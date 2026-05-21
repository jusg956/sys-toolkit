import * as XLSX from 'xlsx'
import type { SystemSnapshot } from '../types/system'
import { formatBytes, formatUptime } from './format'

export function exportSystemInfoXlsx(snapshot: SystemSnapshot) {
  const wb = XLSX.utils.book_new()

  const rows: (string | number)[][] = []
  const sep = () => rows.push([])

  const section = (title: string) => {
    sep()
    rows.push([title])
  }

  const kv = (key: string, value: string | number) => {
    rows.push([key, value])
  }

  // CPU
  section('CPU 处理器')
  kv('型号', snapshot.cpu.brand)
  kv('厂商', snapshot.cpu.manufacturer)
  kv('物理核心', snapshot.cpu.physicalCores)
  kv('逻辑核心', snapshot.cpu.cores)
  kv('频率 (GHz)', snapshot.cpu.speed.toFixed(1))
  kv('使用率 (%)', snapshot.cpu.usage.toFixed(1))

  // 内存
  section('内存')
  kv('总内存', formatBytes(snapshot.memory.total))
  kv('已使用', formatBytes(snapshot.memory.used))
  kv('可用', formatBytes(snapshot.memory.free))
  kv('使用率 (%)', snapshot.memory.usedPercent.toFixed(1))
  if (snapshot.memory.swapTotal > 0) {
    kv('虚拟内存总量', formatBytes(snapshot.memory.swapTotal))
    kv('虚拟内存已用', formatBytes(snapshot.memory.swapUsed))
  }

  // GPU
  section('显卡')
  snapshot.gpu.controllers
    .filter(g => !g.model.includes('OrayIddDriver'))
    .forEach((g, i) => {
      const label = snapshot.gpu.controllers.filter(c => !c.model.includes('OrayIddDriver')).length > 1 ? `显卡 ${i + 1}` : '显卡'
      kv(`${label} 型号`, g.model)
      kv(`${label} 厂商`, g.vendor)
      if (g.vram > 0) kv(`${label} 显存`, formatBytes(g.vram * 1024 * 1024))
      kv(`${label} 驱动`, g.driverVersion || '-')
    })

  // 显示器
  if (snapshot.gpu.displays.length > 0) {
    section('显示器')
    snapshot.gpu.displays.forEach((d, i) => {
      const prefix = snapshot.gpu.displays.length > 1 ? `显示器 ${i + 1}` : '显示器'
      kv(`${prefix} 型号`, d.monitorName || d.model || '未知')
      kv(`${prefix} 分辨率`, `${d.resolutionX} x ${d.resolutionY}`)
      if (d.currentRefreshRate > 0) kv(`${prefix} 刷新率 (Hz)`, d.currentRefreshRate)
    })
  }

  // 磁盘
  section('磁盘')
  snapshot.disk.layout.forEach(d => {
    sep()
    rows.push([d.name])
    kv('类型', d.type)
    kv('接口', d.interfaceType)
    kv('容量', formatBytes(d.size))
  })
  sep()
  rows.push(['分区'])
  snapshot.disk.partitions.forEach(p => {
    kv(`${p.mount} (${p.type} ${p.fs})`, `${formatBytes(p.used)} / ${formatBytes(p.size)} (${p.usedPercent.toFixed(1)}%)`)
  })

  // 主板
  section('主板')
  kv('制造商', snapshot.motherboard.manufacturer)
  kv('型号', snapshot.motherboard.model)
  kv('版本', snapshot.motherboard.version || '-')

  // 操作系统
  section('操作系统')
  kv('系统', snapshot.os.distro)
  kv('版本', snapshot.os.release)
  kv('内核', snapshot.os.kernel)
  kv('架构', snapshot.os.arch)
  kv('主机名', snapshot.os.hostname)
  kv('运行时间', formatUptime(snapshot.os.uptime))

  // 网络
  if (snapshot.network) {
    section('网络')
    snapshot.network.interfaces
      .filter(i => !i.internal && !i.virtual)
      .forEach(iface => {
        sep()
        rows.push([iface.ifaceName || iface.iface])
        if (iface.ip4) kv('IPv4', iface.ip4)
        if (iface.mac) kv('MAC', iface.mac)
        if (iface.speed > 0) kv('速度 (Mbps)', iface.speed)
        kv('DHCP', iface.dhcp ? '是' : '否')
        kv('状态', iface.operstate === 'up' ? '已连接' : '未连接')
        const stat = snapshot.network.stats.find(s => s.iface === iface.iface)
        if (stat) {
          kv('累计下载', formatBytes(stat.rx_bytes))
          kv('累计上传', formatBytes(stat.tx_bytes))
        }
      })
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 20 }, { wch: 40 }]
  XLSX.utils.book_append_sheet(wb, ws, '系统信息')

  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `SysToolkit_系统信息_${date}.xlsx`)
}
