import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { spawn, ChildProcess } from 'child_process'
import { existsSync } from 'fs'

let mainWindow: BrowserWindow | null = null
let backendProcess: ChildProcess | null = null

const isDev = !app.isPackaged
const BACKEND_PORT = 3001

function startBackend(): void {
  if (isDev) return

  const serverPath = join(process.resourcesPath, 'backend', 'index.mjs')
  if (!existsSync(serverPath)) {
    console.error('Backend not found:', serverPath)
    return
  }

  backendProcess = spawn('node', [serverPath], {
    env: { ...process.env, SERVER_PORT: String(BACKEND_PORT) },
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
  })

  backendProcess.stdout?.on('data', (data: Buffer) => {
    console.log(`[backend] ${data.toString().trim()}`)
  })

  backendProcess.stderr?.on('data', (data: Buffer) => {
    console.error(`[backend] ${data.toString().trim()}`)
  })

  backendProcess.on('exit', (code) => {
    console.log(`[backend] exited with code ${code}`)
    backendProcess = null
  })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'SysToolkit',
    backgroundColor: '#080C18',
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(process.resourcesPath, 'frontend', 'index.html'))
  }
}

app.whenReady().then(() => {
  startBackend()
  setTimeout(createWindow, isDev ? 0 : 1000)
})

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill()
    backendProcess = null
  }
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
