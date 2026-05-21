import { create } from 'zustand'

interface Lap {
  id: number
  totalMs: number
  lapMs: number
}

interface TimerState {
  // 倒计时
  countdownSeconds: number
  countdownInputMinutes: number
  countdownRunning: boolean
  countdownIntervalId: ReturnType<typeof setInterval> | null

  // 秒表
  stopwatchMs: number
  stopwatchRunning: boolean
  stopwatchElapsed: number // 累计已过去的时间（暂停时保存）
  stopwatchStartTime: number // 当前段开始时间
  stopwatchIntervalId: ReturnType<typeof setInterval> | null
  laps: Lap[]

  // 倒计时操作
  startCountdown: () => void
  pauseCountdown: () => void
  resetCountdown: () => void
  setCountdownMinutes: (mins: number) => void

  // 秒表操作
  startStopwatch: () => void
  pauseStopwatch: () => void
  resetStopwatch: () => void
  addLap: () => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  // 倒计时初始状态
  countdownSeconds: 300,
  countdownInputMinutes: 5,
  countdownRunning: false,
  countdownIntervalId: null,

  // 秒表初始状态
  stopwatchMs: 0,
  stopwatchRunning: false,
  stopwatchElapsed: 0,
  stopwatchStartTime: 0,
  stopwatchIntervalId: null,
  laps: [],

  // 倒计时操作
  startCountdown: () => {
    const state = get()
    if (state.countdownSeconds <= 0) return
    // 清理可能残留的 interval
    if (state.countdownIntervalId) clearInterval(state.countdownIntervalId)

    const id = setInterval(() => {
      const s = get()
      if (s.countdownSeconds <= 1) {
        clearInterval(id)
        set({ countdownSeconds: 0, countdownRunning: false, countdownIntervalId: null })
        // 动态导入避免循环依赖
        import('antd').then(({ message }) => message.success('倒计时结束！'))
      } else {
        set({ countdownSeconds: s.countdownSeconds - 1 })
      }
    }, 1000)
    set({ countdownRunning: true, countdownIntervalId: id })
  },

  pauseCountdown: () => {
    const state = get()
    if (state.countdownIntervalId) clearInterval(state.countdownIntervalId)
    set({ countdownRunning: false, countdownIntervalId: null })
  },

  resetCountdown: () => {
    const state = get()
    if (state.countdownIntervalId) clearInterval(state.countdownIntervalId)
    set({
      countdownRunning: false,
      countdownIntervalId: null,
      countdownSeconds: state.countdownInputMinutes * 60,
    })
  },

  setCountdownMinutes: (mins: number) => {
    const state = get()
    set({ countdownInputMinutes: mins })
    if (!state.countdownRunning) {
      set({ countdownSeconds: mins * 60 })
    }
  },

  // 秒表操作
  startStopwatch: () => {
    const state = get()
    if (state.stopwatchIntervalId) clearInterval(state.stopwatchIntervalId)

    const startTime = Date.now()
    const id = setInterval(() => {
      const s = get()
      set({ stopwatchMs: s.stopwatchElapsed + (Date.now() - startTime) })
    }, 10)
    set({
      stopwatchRunning: true,
      stopwatchStartTime: startTime,
      stopwatchIntervalId: id,
    })
  },

  pauseStopwatch: () => {
    const state = get()
    if (state.stopwatchIntervalId) clearInterval(state.stopwatchIntervalId)
    const additionalMs = Date.now() - state.stopwatchStartTime
    set({
      stopwatchRunning: false,
      stopwatchIntervalId: null,
      stopwatchElapsed: state.stopwatchElapsed + additionalMs,
      stopwatchMs: state.stopwatchElapsed + additionalMs,
    })
  },

  resetStopwatch: () => {
    const state = get()
    if (state.stopwatchIntervalId) clearInterval(state.stopwatchIntervalId)
    set({
      stopwatchRunning: false,
      stopwatchIntervalId: null,
      stopwatchMs: 0,
      stopwatchElapsed: 0,
      stopwatchStartTime: 0,
      laps: [],
    })
  },

  addLap: () => {
    const state = get()
    const totalMs = state.stopwatchMs
    const prevTotal = state.laps.length > 0 ? state.laps[0].totalMs : 0
    set({
      laps: [
        { id: state.laps.length + 1, totalMs, lapMs: totalMs - prevTotal },
        ...state.laps,
      ],
    })
  },
}))
