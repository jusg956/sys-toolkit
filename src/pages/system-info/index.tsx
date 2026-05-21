import { useEffect } from 'react'
import { Spin, Tag } from 'antd'
import {
  ReloadOutlined,
  CloudServerOutlined,
  DesktopOutlined,
  HddOutlined,
  DashboardOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import { useSystemInfoStore } from '../../stores/systemInfo'
import { formatBytes, formatUptime } from '../../utils/format'
import CopyButton from '../../components/CopyButton'
import { exportSystemInfoXlsx } from '../../utils/exportXlsx'

function RingProgress({ percent, size = 80, stroke = 6, color = '#00D4FF', label }: {
  percent: number; size?: number; stroke?: number; color?: string; label?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div className="ring-progress" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
          <circle
            className="ring-fill"
            cx={size / 2} cy={size / 2} r={radius}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ stroke: color }}
          />
        </svg>
        <span className="ring-text" style={{ fontSize: size * 0.18 }}>{Math.round(percent)}%</span>
      </div>
      {label && <span style={{ fontSize: 11, color: '#6B7B94', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>{label}</span>}
    </div>
  )
}

export default function SystemInfo() {
  const { snapshot, loading, error, fetchSnapshot, startLiveRefresh, stopLiveRefresh } = useSystemInfoStore()

  useEffect(() => {
    if (!snapshot && !loading) fetchSnapshot()
    startLiveRefresh()
    return () => stopLiveRefresh()
  }, [])

  if (loading && !snapshot) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <h2 style={{ color: '#FF3366', marginBottom: 12 }}>获取失败</h2>
        <p style={{ color: '#6B7B94', marginBottom: 20 }}>{error}</p>
        <button
          onClick={() => fetchSnapshot()}
          style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            color: '#00D4FF',
            padding: '8px 24px',
            borderRadius: 8,
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          重试
        </button>
      </div>
    )
  }

  if (!snapshot) return null

  const { cpu, memory, disk, gpu, motherboard, os } = snapshot

  return (
    <div>
      {/* 标题栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: '#E0E6ED' }}>
          System Info
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            onClick={() => exportSystemInfoXlsx(snapshot)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#6B7B94',
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid rgba(0, 230, 118, 0.12)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 230, 118, 0.4)'; e.currentTarget.style.color = '#00E676' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 230, 118, 0.12)'; e.currentTarget.style.color = '#6B7B94' }}
          >
            <ExportOutlined />
            EXPORT
          </div>
          <div
            onClick={() => fetchSnapshot()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#6B7B94',
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid rgba(0, 212, 255, 0.12)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.4)'; e.currentTarget.style.color = '#00D4FF' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.12)'; e.currentTarget.style.color = '#6B7B94' }}
          >
            <ReloadOutlined spin={loading} />
            REFRESH
          </div>
        </div>
      </div>

      {/* CPU + 内存 并排大卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* CPU */}
        <div className="hud-card" style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 12, right: 16 }}>
            <CopyButton getText={() => `型号: ${cpu.brand}\n厂商: ${cpu.manufacturer}\n物理核心: ${cpu.physicalCores}\n逻辑核心: ${cpu.cores}\n频率: ${cpu.speed.toFixed(1)} GHz\n使用率: ${cpu.usage.toFixed(1)}%`} />
          </div>
          <RingProgress
            percent={cpu.usage}
            size={100}
            stroke={7}
            color={cpu.usage > 80 ? '#FF3366' : '#00D4FF'}
            label="CPU"
          />
          <div style={{ flex: 1 }}>
            <div className="hud-card-title"><span className="icon"><DashboardOutlined /></span> 处理器</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#E0E6ED', marginBottom: 8 }}>
              {cpu.brand}
            </div>
            <dl className="hud-desc">
              <dt>厂商</dt><dd>{cpu.manufacturer}</dd>
              <dt>物理核心</dt><dd>{cpu.physicalCores}</dd>
              <dt>逻辑核心</dt><dd>{cpu.cores}</dd>
              <dt>频率</dt><dd>{cpu.speed.toFixed(1)} GHz</dd>
            </dl>
          </div>
        </div>

        {/* 内存 */}
        <div className="hud-card" style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 12, right: 16 }}>
            <CopyButton getText={() => `总内存: ${formatBytes(memory.total)}\n已使用: ${formatBytes(memory.used)}\n可用: ${formatBytes(memory.free)}\n使用率: ${memory.usedPercent.toFixed(1)}%${memory.swapTotal > 0 ? `\n虚拟内存: ${formatBytes(memory.swapUsed)} / ${formatBytes(memory.swapTotal)}` : ''}`} />
          </div>
          <RingProgress
            percent={memory.usedPercent}
            size={100}
            stroke={7}
            color={memory.usedPercent > 90 ? '#FF3366' : '#00E676'}
            label="RAM"
          />
          <div style={{ flex: 1 }}>
            <div className="hud-card-title"><span className="icon">RAM</span> 内存</div>
            <div className="data-value accent" style={{ fontSize: 24, marginBottom: 8 }}>
              {formatBytes(memory.used)}
              <span className="data-unit">/ {formatBytes(memory.total)}</span>
            </div>
            <dl className="hud-desc">
              <dt>可用</dt><dd>{formatBytes(memory.free)}</dd>
              {memory.swapTotal > 0 && (
                <>
                  <dt>虚拟内存</dt>
                  <dd>{formatBytes(memory.swapUsed)} / {formatBytes(memory.swapTotal)}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* OS + 主板 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* 操作系统 */}
        <div className="hud-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="hud-card-title" style={{ marginBottom: 0 }}><span className="icon"><CloudServerOutlined /></span> 操作系统</div>
            <CopyButton getText={() => `系统: ${os.distro}\n版本: ${os.release}\n内核: ${os.kernel}\n架构: ${os.arch}\n主机名: ${os.hostname}\n运行时间: ${formatUptime(os.uptime)}`} />
          </div>
          <dl className="hud-desc">
            <dt>系统</dt><dd>{os.distro}</dd>
            <dt>版本</dt><dd>{os.release}</dd>
            <dt>内核</dt><dd>{os.kernel}</dd>
            <dt>架构</dt><dd>{os.arch}</dd>
            <dt>主机名</dt><dd>{os.hostname}</dd>
            <dt>运行时间</dt><dd>{formatUptime(os.uptime)}</dd>
          </dl>
        </div>

        {/* 主板 */}
        <div className="hud-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="hud-card-title" style={{ marginBottom: 0 }}><span className="icon"><DesktopOutlined /></span> 主板</div>
            <CopyButton getText={() => `制造商: ${motherboard.manufacturer}\n型号: ${motherboard.model}\n版本: ${motherboard.version || '-'}`} />
          </div>
          <dl className="hud-desc">
            <dt>制造商</dt><dd>{motherboard.manufacturer}</dd>
            <dt>型号</dt><dd>{motherboard.model}</dd>
            <dt>版本</dt><dd>{motherboard.version || '-'}</dd>
          </dl>
        </div>
      </div>

      {/* 显卡 + 显示器 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16, marginBottom: 16 }}>
        {gpu.controllers.filter(g => !g.model.includes('OrayIddDriver')).map((g, i) => (
          <div className="hud-card" key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="hud-card-title" style={{ marginBottom: 0 }}>
                <span className="icon">GPU</span>
                {gpu.controllers.filter(c => !c.model.includes('OrayIddDriver')).length > 1 ? `显卡 ${i + 1}` : '显卡'}
              </div>
              <CopyButton getText={() => {
                const lines = [`型号: ${g.model}`, `厂商: ${g.vendor}`]
                if (g.vram > 0) lines.push(`显存: ${formatBytes(g.vram * 1024 * 1024)}`)
                lines.push(`驱动: ${g.driverVersion || '-'}`)
                gpu.displays.forEach((d, di) => {
                  lines.push(`\n显示器${gpu.displays.length > 1 ? ` ${di + 1}` : ''}: ${d.monitorName || d.model || '未知'}`)
                  lines.push(`  分辨率: ${d.resolutionX} x ${d.resolutionY}`)
                  if (d.currentRefreshRate > 0) lines.push(`  刷新率: ${d.currentRefreshRate} Hz`)
                })
                return lines.join('\n')
              }} />
            </div>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {/* 左侧：GPU 基本信息 */}
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#E0E6ED', marginBottom: 8 }}>
                  {g.model}
                </div>
                <dl className="hud-desc">
                  <dt>厂商</dt><dd>{g.vendor}</dd>
                  {g.vram > 0 && <><dt>显存</dt><dd>{formatBytes(g.vram * 1024 * 1024)}</dd></>}
                  <dt>驱动</dt><dd>{g.driverVersion || '-'}</dd>
                </dl>
              </div>
              {/* 右侧：显示器信息 */}
              {gpu.displays.length > 0 && (
                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 32, borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                  {gpu.displays.map((d, di) => (
                    <div key={di}>
                      <div style={{ fontSize: 11, color: '#6B7B94', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {gpu.displays.length > 1 ? `显示器 ${di + 1}` : '显示器'} — {d.monitorName || d.model || '未知'}
                      </div>
                      <dl className="hud-desc">
                        <dt>分辨率</dt><dd>{d.resolutionX} x {d.resolutionY}</dd>
                        {d.currentRefreshRate > 0 && <><dt>刷新率</dt><dd>{d.currentRefreshRate} Hz</dd></>}
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 磁盘分区 */}
      <div className="hud-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="hud-card-title" style={{ marginBottom: 0 }}><span className="icon"><HddOutlined /></span> 磁盘</div>
          <CopyButton getText={() => {
            const lines: string[] = []
            disk.layout.forEach(d => {
              lines.push(`${d.name} (${d.type} ${d.interfaceType}) ${formatBytes(d.size)}`)
            })
            lines.push('')
            disk.partitions.forEach(p => {
              lines.push(`${p.mount} ${p.type} ${formatBytes(p.used)} / ${formatBytes(p.size)} (${p.usedPercent.toFixed(1)}%)`)
            })
            return lines.join('\n')
          }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 物理硬盘 */}
          {disk.layout.map((d, i) => (
            <div key={`disk-${i}`} style={{ padding: '10px 14px', background: 'rgba(0, 212, 255, 0.04)', borderRadius: 8, border: '1px solid rgba(0, 212, 255, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600, color: '#E0E6ED' }}>
                  {d.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag style={{ fontSize: 10, padding: '0 6px', lineHeight: '18px' }}>{d.type}</Tag>
                  <Tag style={{ fontSize: 10, padding: '0 6px', lineHeight: '18px' }}>{d.interfaceType}</Tag>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#6B7B94' }}>{formatBytes(d.size)}</span>
                </div>
              </div>
            </div>
          ))}
          {/* 分区列表 */}
          {disk.partitions.map((p, i) => (
            <div key={`part-${i}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600, color: '#E0E6ED' }}>
                    {p.mount}
                  </span>
                  <Tag style={{ fontSize: 10, padding: '0 6px', lineHeight: '18px' }}>{p.type}</Tag>
                  <span style={{ fontSize: 11, color: '#3D4F6F' }}>{p.fs}</span>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#6B7B94' }}>
                  {formatBytes(p.used)} / {formatBytes(p.size)}
                  <span style={{ marginLeft: 8, color: p.usedPercent > 90 ? '#FF3366' : p.usedPercent > 75 ? '#FF6B35' : '#00D4FF' }}>
                    ({p.usedPercent.toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div className="hud-progress">
                <div
                  className={`hud-progress-bar ${p.usedPercent > 90 ? 'danger' : p.usedPercent > 75 ? 'warning' : ''}`}
                  style={{ width: `${p.usedPercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 网络信息 */}
      {snapshot.network && snapshot.network.interfaces.filter(i => !i.internal && !i.virtual).length > 0 && (
        <div className="hud-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="hud-card-title" style={{ marginBottom: 0 }}><span className="icon"><CloudServerOutlined /></span> 网络</div>
            <CopyButton getText={() => snapshot.network.interfaces.filter(i => !i.internal && !i.virtual).map(iface => {
              const stat = snapshot.network.stats.find(s => s.iface === iface.iface)
              const lines = [`${iface.ifaceName || iface.iface}: ${iface.operstate === 'up' ? '已连接' : '未连接'}`]
              if (iface.ip4) lines.push(`  IPv4: ${iface.ip4}`)
              if (iface.mac) lines.push(`  MAC: ${iface.mac}`)
              if (iface.speed > 0) lines.push(`  速度: ${iface.speed} Mbps`)
              if (stat) lines.push(`  累计流量: ↓${formatBytes(stat.rx_bytes)} ↑${formatBytes(stat.tx_bytes)}`)
              return lines.join('\n')
            }).join('\n\n')} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {snapshot.network.interfaces.filter(i => !i.internal && !i.virtual).map((iface) => {
              const stat = snapshot.network.stats.find(s => s.iface === iface.iface)
              return (
                <div key={iface.iface} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#E0E6ED' }}>
                      {iface.ifaceName || iface.iface}
                    </span>
                    <Tag style={{ fontSize: 10, padding: '0 6px', lineHeight: '18px', color: iface.operstate === 'up' ? '#00E676' : '#FF3366', borderColor: iface.operstate === 'up' ? '#00E676' : '#FF3366', background: 'transparent' }}>
                      {iface.operstate === 'up' ? '已连接' : '未连接'}
                    </Tag>
                  </div>
                  <dl className="hud-desc">
                    {iface.ip4 && <><dt>IPv4</dt><dd>{iface.ip4}</dd></>}
                    {iface.mac && <><dt>MAC</dt><dd>{iface.mac}</dd></>}
                    {iface.speed > 0 && <><dt>速度</dt><dd>{iface.speed} Mbps</dd></>}
                    {iface.dhcp && <><dt>DHCP</dt><dd>是</dd></>}
                    {stat && stat.rx_sec > 0 && (
                      <><dt>实时速率</dt><dd>↓ {formatBytes(stat.rx_sec)}/s  ↑ {formatBytes(stat.tx_sec)}/s</dd></>
                    )}
                    {stat && (
                      <><dt>累计流量</dt><dd>↓ {formatBytes(stat.rx_bytes)}  ↑ {formatBytes(stat.tx_bytes)}</dd></>
                    )}
                  </dl>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
