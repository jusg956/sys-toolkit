declare global {
  interface Window {
    electronAPI?: { platform: string }
  }
}

const isElectron = !!window.electronAPI
export const API_BASE = isElectron ? 'http://localhost:3001' : ''
