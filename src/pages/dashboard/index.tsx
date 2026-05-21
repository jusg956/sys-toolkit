import { useEffect } from 'react'
import { Spin, Tooltip } from 'antd'
import {
  DesktopOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  CloudServerOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSystemInfoStore } from '../../stores/systemInfo'
import { formatBytes, formatUptime } from '../../utils/format'

function RingProgress({ percent, size = 64, stroke = 5, color = '#00D4FF' }: {
  percent: number; size?: number; stroke?: number; color?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference

  return (
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
      <span className="ring-text" style={{ fontSize: size * 0.22 }}>
        {Math.round(percent)}%
      </span>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { snapshot, loading, fetchSnapshot, startLiveRefresh, stopLiveRefresh } = useSystemInfoStore()

  useEffect(() => {
    if (!snapshot && !loading) fetchSnapshot()
    startLiveRefresh()
    return () => stopLiveRefresh()
  }, [])

  return (
    <div>
      {/* 顶部横幅 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 28,
                fontWeight: 700,
                color: '#E0E6ED',
                marginBottom: 4,
                letterSpacing: -0.5,
              }}
            >
              SysToolkit
            </h1>
            <p style={{ color: '#6B7B94', fontSize: 13 }}>
              系统监控与工具箱
            </p>
          </div>
          <Tooltip title="刷新数据">
            <div
              onClick={() => fetchSnapshot()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1px solid rgba(0, 212, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6B7B94',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.4)'
                e.currentTarget.style.color = '#00D4FF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.15)'
                e.currentTarget.style.color = '#6B7B94'
              }}
            >
              <ReloadOutlined style={{ fontSize: 14 }} />
            </div>
          </Tooltip>
        </div>
      </div>

      {loading && !snapshot ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 120 }}>
          <Spin size="large" />
        </div>
      ) : snapshot ? (
        <>
          {/* 系统概览条 */}
          <div
            className="hud-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              marginBottom: 20,
              padding: '14px 24px',
            }}
          >
            <CloudServerOutlined style={{ fontSize: 20, color: '#00D4FF' }} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#E0E6ED' }}>
              {snapshot.os.distro}
            </div>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#6B7B94' }}>
              {snapshot.os.hostname}
            </div>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ fontSize: 12, color: '#6B7B94' }}>
              运行 {formatUptime(snapshot.os.uptime)}
            </div>
          </div>

          {/* 数据卡片网格 */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            {/* CPU */}
            <div className="hud-card">
              <div className="hud-card-title">
                <span className="icon">CPU</span>
                处理器
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="data-value" style={{ fontSize: 20, marginBottom: 6 }}>
                    {snapshot.cpu.brand}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7B94' }}>
                    {snapshot.cpu.physicalCores} 核心 / {snapshot.cpu.cores} 线程
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7B94', marginTop: 2 }}>
                    {snapshot.cpu.speed.toFixed(1)} GHz
                  </div>
                </div>
                <RingProgress
                  percent={snapshot.cpu.usage}
                  size={72}
                  stroke={5}
                  color={snapshot.cpu.usage > 80 ? '#FF3366' : '#00D4FF'}
                />
              </div>
            </div>

            {/* 内存 */}
            <div className="hud-card">
              <div className="hud-card-title">
                <span className="icon">RAM</span>
                内存
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="data-value accent" style={{ fontSize: 28 }}>
                    {formatBytes(snapshot.memory.used)}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7B94', marginTop: 4 }}>
                    共 {formatBytes(snapshot.memory.total)}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7B94' }}>
                    可用 {formatBytes(snapshot.memory.free)}
                  </div>
                </div>
                <RingProgress
                  percent={snapshot.memory.usedPercent}
                  size={72}
                  stroke={5}
                  color={snapshot.memory.usedPercent > 90 ? '#FF3366' : '#00E676'}
                />
              </div>
            </div>

            {/* GPU */}
            <div className="hud-card">
              <div className="hud-card-title">
                <span className="icon">GPU</span>
                显卡
              </div>
              {snapshot.gpu.controllers.filter(g => g.vram > 0).map((g, i) => (
                <div key={i}>
                  <div className="data-value" style={{ fontSize: 18, marginBottom: 6 }}>
                    {g.model}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7B94' }}>
                    {g.vendor} / {formatBytes(g.vram * 1024 * 1024)} 显存
                  </div>
                  {g.driverVersion && (
                    <div style={{ fontSize: 12, color: '#3D4F6F', marginTop: 2 }}>
                      驱动 {g.driverVersion}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 磁盘 */}
            <div className="hud-card">
              <div className="hud-card-title">
                <span className="icon">DISK</span>
                磁盘
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {snapshot.disk.partitions.map((p, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#E0E6ED' }}>
                        {p.mount}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#6B7B94' }}>
                        {formatBytes(p.used)} / {formatBytes(p.size)}
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
          </div>

          {/* 导航卡片 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div
              className="hud-card"
              onClick={() => navigate('/system-info')}
              style={{ cursor: 'pointer', textAlign: 'center', padding: '28px 24px' }}
            >
              <DesktopOutlined style={{ fontSize: 36, color: '#00D4FF', marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: '#E0E6ED', marginBottom: 4 }}>
                系统详情
              </div>
              <div style={{ fontSize: 12, color: '#6B7B94' }}>
                查看完整硬件信息
              </div>
            </div>
            <div
              className="hud-card"
              onClick={() => navigate('/timer')}
              style={{ cursor: 'pointer', textAlign: 'center', padding: '28px 24px' }}
            >
              <ClockCircleOutlined style={{ fontSize: 36, color: '#00E676', marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: '#E0E6ED', marginBottom: 4 }}>
                计时器
              </div>
              <div style={{ fontSize: 12, color: '#6B7B94' }}>
                倒计时与秒表
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
