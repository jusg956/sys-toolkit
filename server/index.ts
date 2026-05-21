import express from 'express'
import cors from 'cors'
import si from 'systeminformation'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const app = express()
const PORT = parseInt(process.env.SERVER_PORT || '3001', 10)

app.use(cors())
app.use(express.json())

// 通过 WMI 获取显示器真实品牌型号
async function getMonitorInfo(): Promise<{ name: string }[]> {
  try {
    const { stdout } = await execAsync(
      'powershell -NoProfile -Command "Get-CimInstance Win32_PnPEntity | Where-Object { $_.Service -eq \'monitor\' } | Select-Object Name | ConvertTo-Csv -NoTypeInformation"',
      { timeout: 5000, encoding: 'utf8' }
    )
    const lines = stdout.trim().split('\n').filter(l => l.trim() && !l.startsWith('"Name"'))
    return lines.map(line => {
      const name = line.trim().replace(/^"|"$/g, '')
      return { name: name.trim() }
    }).filter(m => m.name)
  } catch {
    return []
  }
}

// CPU 信息
app.get('/api/cpu', async (_req, res) => {
  try {
    const [cpu, cpuSpeed, cpuLoad] = await Promise.all([
      si.cpu(),
      si.cpuCurrentSpeed(),
      si.currentLoad(),
    ])
    res.json({
      brand: cpu.brand,
      manufacturer: cpu.manufacturer,
      vendor: cpu.vendor,
      family: cpu.family,
      model: cpu.model,
      speed: cpuSpeed.avg,
      cores: cpu.cores,
      physicalCores: cpu.physicalCores,
      processors: cpu.processors,
      usage: cpuLoad.currentLoad,
    })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// 内存信息
app.get('/api/memory', async (_req, res) => {
  try {
    const mem = await si.mem()
    res.json({
      total: mem.total,
      used: mem.used,
      free: mem.free,
      usedPercent: mem.used / mem.total * 100,
      swapTotal: mem.swaptotal,
      swapUsed: mem.swapused,
      swapFree: mem.swapfree,
    })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// 磁盘信息
app.get('/api/disk', async (_req, res) => {
  try {
    const [disks, fsSize] = await Promise.all([
      si.diskLayout(),
      si.fsSize(),
    ])
    res.json({
      layout: disks.map(d => ({
        name: d.name,
        type: d.type,
        size: d.size,
        vendor: d.vendor,
        interfaceType: d.interfaceType,
        smartStatus: d.smartStatus,
      })),
      partitions: fsSize.map(f => ({
        fs: f.fs,
        type: f.type,
        size: f.size,
        used: f.used,
        available: f.available,
        usedPercent: f.use,
        mount: f.mount,
      })),
    })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// 显卡信息
app.get('/api/gpu', async (_req, res) => {
  try {
    const [gpu, monitors] = await Promise.all([
      si.graphics(),
      getMonitorInfo(),
    ])
    res.json({
      controllers: gpu.controllers.map(g => ({
        model: g.model,
        vendor: g.vendor,
        vram: g.vram,
        driverVersion: g.driverVersion,
        pciBus: g.pciBus,
      })),
      displays: gpu.displays.map((d, i) => ({
        model: d.model,
        vendor: d.vendor,
        resolutionX: d.resolutionX,
        resolutionY: d.resolutionY,
        currentRefreshRate: d.currentRefreshRate,
        monitorName: monitors[i]?.name || '',
      })),
    })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// 主板信息
app.get('/api/motherboard', async (_req, res) => {
  try {
    const mb = await si.baseboard()
    res.json({
      manufacturer: mb.manufacturer,
      model: mb.model,
      version: mb.version,
      serial: mb.serial,
      assetTag: mb.assetTag,
    })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// 操作系统信息
app.get('/api/os', async (_req, res) => {
  try {
    const [os, uuid, time] = await Promise.all([
      si.osInfo(),
      si.uuid(),
      si.time(),
    ])
    res.json({
      platform: os.platform,
      distro: os.distro,
      release: os.release,
      codename: os.codename,
      kernel: os.kernel,
      arch: os.arch,
      hostname: os.hostname,
      fqdn: os.fqdn,
      serial: os.serial,
      uuid: uuid.os,
      uptime: time.uptime,
    })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// 网络信息
app.get('/api/network', async (_req, res) => {
  try {
    const [ifaces, stats] = await Promise.all([
      si.networkInterfaces(),
      si.networkStats(),
    ])
    const ifaceArr = Array.isArray(ifaces) ? ifaces : [ifaces]
    const statsArr = Array.isArray(stats) ? stats : [stats]
    res.json({
      interfaces: ifaceArr.map(iface => ({
        iface: iface.iface,
        ifaceName: iface.ifaceName,
        ip4: iface.ip4,
        ip4subnet: iface.ip4subnet,
        ip6: iface.ip6,
        mac: iface.mac,
        internal: iface.internal,
        virtual: iface.virtual,
        operstate: iface.operstate,
        type: iface.type,
        speed: iface.speed,
        dhcp: iface.dhcp,
      })),
      stats: statsArr.map(s => ({
        iface: s.iface,
        operstate: s.operstate,
        rx_bytes: s.rx_bytes,
        tx_bytes: s.tx_bytes,
        rx_sec: s.rx_sec,
        tx_sec: s.tx_sec,
      })),
    })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// 轻量级实时数据端点（CPU/内存/网络/磁盘使用率/运行时间）
let liveCache: { data: unknown; timestamp: number } | null = null
const LIVE_CACHE_TTL = 1500

app.get('/api/live', async (_req, res) => {
  try {
    if (liveCache && Date.now() - liveCache.timestamp < LIVE_CACHE_TTL) {
      res.json(liveCache.data)
      return
    }

    const [cpuLoad, mem, netStats, fsSize, time] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.networkStats(),
      si.fsSize(),
      si.time(),
    ])

    const data = {
      cpu: { usage: cpuLoad.currentLoad },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        usedPercent: mem.used / mem.total * 100,
      },
      network: {
        stats: (Array.isArray(netStats) ? netStats : [netStats]).map(s => ({
          iface: s.iface,
          operstate: s.operstate,
          rx_bytes: s.rx_bytes,
          tx_bytes: s.tx_bytes,
          rx_sec: s.rx_sec,
          tx_sec: s.tx_sec,
        })),
      },
      disk: {
        partitions: fsSize.map(f => ({
          mount: f.mount,
          size: f.size,
          used: f.used,
          available: f.available,
          usedPercent: f.use,
        })),
      },
      os: { uptime: time.uptime },
    }

    liveCache = { data, timestamp: Date.now() }
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// 简单内存缓存（5 秒）
let snapshotCache: { data: unknown; timestamp: number } | null = null
const CACHE_TTL = 5000

// 一次性获取全部系统信息
app.get('/api/snapshot', async (_req, res) => {
  try {
    // 返回缓存
    if (snapshotCache && Date.now() - snapshotCache.timestamp < CACHE_TTL) {
      res.json(snapshotCache.data)
      return
    }

    const [cpu, cpuLoad, mem, disks, fsSize, gpu, mb, os, uuid, time, monitors, ifaces, netStats] =
      await Promise.all([
        si.cpu(),
        si.currentLoad(),
        si.mem(),
        si.diskLayout(),
        si.fsSize(),
        si.graphics(),
        si.baseboard(),
        si.osInfo(),
        si.uuid(),
        si.time(),
        getMonitorInfo(),
        si.networkInterfaces(),
        si.networkStats(),
      ])

    const data = {
      cpu: {
        brand: cpu.brand,
        manufacturer: cpu.manufacturer,
        vendor: cpu.vendor,
        family: cpu.family,
        model: cpu.model,
        speed: cpu.speed,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        processors: cpu.processors,
        usage: cpuLoad.currentLoad,
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        usedPercent: mem.used / mem.total * 100,
        swapTotal: mem.swaptotal,
        swapUsed: mem.swapused,
        swapFree: mem.swapfree,
      },
      disk: {
        layout: disks.map(d => ({
          name: d.name,
          type: d.type,
          size: d.size,
          vendor: d.vendor,
          interfaceType: d.interfaceType,
          smartStatus: d.smartStatus,
        })),
        partitions: fsSize.map(f => ({
          fs: f.fs,
          type: f.type,
          size: f.size,
          used: f.used,
          available: f.available,
          usedPercent: f.use,
          mount: f.mount,
        })),
      },
      gpu: {
        controllers: gpu.controllers.map(g => ({
          model: g.model,
          vendor: g.vendor,
          vram: g.vram,
          driverVersion: g.driverVersion,
          pciBus: g.pciBus,
        })),
        displays: gpu.displays.map((d, i) => ({
          model: d.model,
          vendor: d.vendor,
          resolutionX: d.resolutionX,
          resolutionY: d.resolutionY,
          currentRefreshRate: d.currentRefreshRate,
          monitorName: monitors[i]?.name || '',
        })),
      },
      motherboard: {
        manufacturer: mb.manufacturer,
        model: mb.model,
        version: mb.version,
        serial: mb.serial,
        assetTag: mb.assetTag,
      },
      os: {
        platform: os.platform,
        distro: os.distro,
        release: os.release,
        codename: os.codename,
        kernel: os.kernel,
        arch: os.arch,
        hostname: os.hostname,
        fqdn: os.fqdn,
        serial: os.serial,
        uuid: uuid.os,
        uptime: time.uptime,
      },
      network: {
        interfaces: (Array.isArray(ifaces) ? ifaces : [ifaces]).map(iface => ({
          iface: iface.iface,
          ifaceName: iface.ifaceName,
          ip4: iface.ip4,
          ip4subnet: iface.ip4subnet,
          ip6: iface.ip6,
          mac: iface.mac,
          internal: iface.internal,
          virtual: iface.virtual,
          operstate: iface.operstate,
          type: iface.type,
          speed: iface.speed,
          dhcp: iface.dhcp,
        })),
        stats: (Array.isArray(netStats) ? netStats : [netStats]).map(s => ({
          iface: s.iface,
          operstate: s.operstate,
          rx_bytes: s.rx_bytes,
          tx_bytes: s.tx_bytes,
          rx_sec: s.rx_sec,
          tx_sec: s.tx_sec,
        })),
      },
    }

    // 保存缓存
    snapshotCache = { data, timestamp: Date.now() }
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

app.listen(PORT, () => {
  console.log(`[SysToolkit] API server running at http://localhost:${PORT}`)
})
