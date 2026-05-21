import { create } from 'zustand'
import type { SystemSnapshot } from '../types/system'
import { API_BASE } from '../utils/api'

interface LiveData {
  cpu: { usage: number }
  memory: { total: number; used: number; free: number; usedPercent: number }
  network: { stats: { iface: string; operstate: string; rx_bytes: number; tx_bytes: number; rx_sec: number; tx_sec: number }[] }
  disk: { partitions: { mount: string; size: number; used: number; available: number; usedPercent: number }[] }
  os: { uptime: number }
}

interface SystemInfoState {
  snapshot: SystemSnapshot | null
  loading: boolean
  error: string | null
  lastFetch: number
  liveIntervalId: ReturnType<typeof setInterval> | null
  fetchSnapshot: (force?: boolean) => Promise<void>
  startLiveRefresh: () => void
  stopLiveRefresh: () => void
  applyLive: (live: LiveData) => void
}

export const useSystemInfoStore = create<SystemInfoState>((set, get) => ({
  snapshot: null,
  loading: false,
  error: null,
  lastFetch: 0,
  liveIntervalId: null,

  fetchSnapshot: async (force = false) => {
    const state = get()
    if (!force && state.loading) return
    if (!force && Date.now() - state.lastFetch < 2000) return

    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/api/snapshot`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: SystemSnapshot = await res.json()
      set({ snapshot: data, loading: false, lastFetch: Date.now() })
    } catch (err) {
      set({ error: String(err), loading: false })
    }
  },

  applyLive: (live: LiveData) => {
    const state = get()
    if (!state.snapshot) return
    const prev = state.snapshot
    set({
      snapshot: {
        ...prev,
        cpu: { ...prev.cpu, usage: live.cpu.usage },
        memory: {
          ...prev.memory,
          total: live.memory.total,
          used: live.memory.used,
          free: live.memory.free,
          usedPercent: live.memory.usedPercent,
        },
        disk: {
          ...prev.disk,
          partitions: prev.disk.partitions.map(p => {
            const live_p = live.disk.partitions.find(lp => lp.mount === p.mount)
            return live_p ? { ...p, used: live_p.used, available: live_p.available, usedPercent: live_p.usedPercent } : p
          }),
        },
        network: {
          ...prev.network,
          stats: live.network.stats,
        },
        os: { ...prev.os, uptime: live.os.uptime },
      },
    })
  },

  startLiveRefresh: () => {
    const state = get()
    if (state.liveIntervalId) return

    const fetchLive = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/live`)
        if (!res.ok) return
        const data: LiveData = await res.json()
        get().applyLive(data)
      } catch { /* ignore */ }
    }

    const id = setInterval(fetchLive, 2000)
    set({ liveIntervalId: id })
  },

  stopLiveRefresh: () => {
    const state = get()
    if (state.liveIntervalId) {
      clearInterval(state.liveIntervalId)
      set({ liveIntervalId: null })
    }
  },
}))
