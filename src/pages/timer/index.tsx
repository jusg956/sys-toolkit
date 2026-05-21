import { Tabs, InputNumber } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  FlagOutlined,
} from '@ant-design/icons'
import { useTimerStore } from '../../stores/timer'
import { formatTime, formatStopwatch } from '../../utils/format'

// ---- HUD 按钮 ----
function HudButton({ children, onClick, disabled, color = '#00D4FF' }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; color?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '10px 24px',
        borderRadius: 10,
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.06)' : color + '40'}`,
        background: disabled ? 'rgba(255,255,255,0.02)' : color + '15',
        color: disabled ? '#3D4F6F' : color,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        letterSpacing: 0.5,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = color + '25'
          e.currentTarget.style.borderColor = color + '80'
          e.currentTarget.style.boxShadow = `0 0 16px ${color}30`
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = color + '15'
          e.currentTarget.style.borderColor = color + '40'
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
    >
      {children}
    </button>
  )
}

// ---- 倒计时 ----
function Countdown() {
  const {
    countdownSeconds, countdownInputMinutes, countdownRunning,
    startCountdown, pauseCountdown, resetCountdown, setCountdownMinutes,
  } = useTimerStore()

  const isWarning = countdownSeconds <= 10 && countdownSeconds > 0 && countdownRunning

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 88,
          fontWeight: 700,
          color: isWarning ? '#FF3366' : '#E0E6ED',
          letterSpacing: 4,
          marginBottom: 40,
          textShadow: isWarning ? '0 0 30px rgba(255, 51, 102, 0.4)' : '0 0 20px rgba(0, 212, 255, 0.15)',
          transition: 'color 0.3s, text-shadow 0.3s',
          lineHeight: 1,
        }}
      >
        {formatTime(countdownSeconds)}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {!countdownRunning ? (
          <HudButton onClick={startCountdown} disabled={countdownSeconds <= 0}>
            <PlayCircleOutlined /> 开始
          </HudButton>
        ) : (
          <HudButton onClick={pauseCountdown} color="#FF6B35">
            <PauseCircleOutlined /> 暂停
          </HudButton>
        )}
        <HudButton onClick={resetCountdown} color="#6B7B94">
          <ReloadOutlined /> 重置
        </HudButton>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, color: '#6B7B94' }}>时长（分钟）</span>
        <InputNumber
          min={1} max={999} value={countdownInputMinutes}
          onChange={(v) => v && setCountdownMinutes(v)}
          disabled={countdownRunning}
          style={{ width: 80 }}
        />
      </div>
    </div>
  )
}

// ---- 秒表 ----
function Stopwatch() {
  const {
    stopwatchMs, stopwatchRunning, laps,
    startStopwatch, pauseStopwatch, resetStopwatch, addLap,
  } = useTimerStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 64,
          fontWeight: 700,
          color: stopwatchRunning ? '#00D4FF' : '#E0E6ED',
          letterSpacing: 2,
          marginBottom: 40,
          textShadow: stopwatchRunning ? '0 0 20px rgba(0, 212, 255, 0.3)' : '0 0 20px rgba(0, 212, 255, 0.1)',
          transition: 'color 0.3s, text-shadow 0.3s',
          lineHeight: 1,
        }}
      >
        {formatStopwatch(stopwatchMs)}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {!stopwatchRunning ? (
          <HudButton onClick={startStopwatch}>
            <PlayCircleOutlined /> 开始
          </HudButton>
        ) : (
          <>
            <HudButton onClick={pauseStopwatch} color="#FF6B35">
              <PauseCircleOutlined /> 暂停
            </HudButton>
            <HudButton onClick={addLap} color="#00E676">
              <FlagOutlined /> 计次
            </HudButton>
          </>
        )}
        <HudButton onClick={resetStopwatch} color="#6B7B94" disabled={stopwatchRunning}>
          <ReloadOutlined /> 重置
        </HudButton>
      </div>

      {laps.length > 0 && (
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div
            style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
              fontSize: 11, color: '#3D4F6F', fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase', letterSpacing: 1,
            }}
          >
            <span>Lap</span>
            <span>分段</span>
            <span>总时间</span>
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {laps.map((lap) => (
              <div
                key={lap.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
                }}
              >
                <span style={{ color: '#6B7B94', width: 40 }}>#{lap.id}</span>
                <span style={{ color: '#00E676', width: 120, textAlign: 'center' }}>
                  {formatStopwatch(lap.lapMs)}
                </span>
                <span style={{ color: '#E0E6ED', width: 120, textAlign: 'right' }}>
                  {formatStopwatch(lap.totalMs)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- 主组件 ----
export default function Timer() {
  return (
    <div>
      <h2
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 22, fontWeight: 700, color: '#E0E6ED',
          marginBottom: 24,
        }}
      >
        Timer
      </h2>
      <div
        className="hud-card"
        style={{ maxWidth: 560, margin: '0 auto', padding: '40px 32px' }}
      >
        <Tabs
          defaultActiveKey="countdown"
          centered
          items={[
            {
              key: 'countdown',
              label: '倒计时',
              children: <Countdown />,
            },
            {
              key: 'stopwatch',
              label: '秒表',
              children: <Stopwatch />,
            },
          ]}
        />
      </div>
    </div>
  )
}
