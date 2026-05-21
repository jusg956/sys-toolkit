import { Tooltip } from 'antd'
import {
  DashboardOutlined,
  DesktopOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/system-info', icon: <DesktopOutlined />, label: '系统信息' },
  { key: '/timer', icon: <ClockCircleOutlined />, label: '计时器' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        padding: '16px 0',
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #00D4FF 0%, #0088AA 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
          fontSize: 16,
          fontWeight: 700,
          color: '#080C18',
          fontFamily: "'JetBrains Mono', monospace",
          boxShadow: '0 0 16px rgba(0, 212, 255, 0.3)',
        }}
      >
        S
      </div>

      {/* 导航图标 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.key
          return (
            <Tooltip key={item.key} title={item.label} placement="right">
              <div
                onClick={() => navigate(item.key)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 18,
                  color: isActive ? '#00D4FF' : '#6B7B94',
                  background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#E0E6ED'
                    e.currentTarget.style.background = 'rgba(0, 212, 255, 0.06)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#6B7B94'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: 20,
                      borderRadius: '0 3px 3px 0',
                      background: '#00D4FF',
                      boxShadow: '0 0 8px rgba(0, 212, 255, 0.5)',
                    }}
                  />
                )}
                {item.icon}
              </div>
            </Tooltip>
          )
        })}
      </div>

      {/* 版本号 */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: '#3D4F6F',
          letterSpacing: 1,
        }}
      >
        v0.1
      </div>
    </div>
  )
}
