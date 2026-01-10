const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const http = require('http')

const DEFAULT_PORT = Number(process.env.APP_PORT || 8000)
const isDev = !app.isPackaged
let backendProcess = null
let backendStarting = null
let isQuitting = false

function checkHealth(port) {
  return new Promise((resolve) => {
    const req = http.get(
      { hostname: '127.0.0.1', port, path: '/health', timeout: 500 },
      (res) => {
        res.resume()
        resolve(res.statusCode === 200)
      }
    )
    req.on('error', () => resolve(false))
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
  })
}

async function waitForHealth(port, timeoutMs = 10000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await checkHealth(port)) return true
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  return false
}

function getBackendBinaryPath() {
  const binaryName =
    process.platform === 'win32'
      ? 'indoorcycling-backend.exe'
      : 'indoorcycling-backend'
  return path.join(process.resourcesPath, 'backend', binaryName)
}

async function startBackend() {
  if (backendStarting) return backendStarting

  backendStarting = (async () => {
    const port = DEFAULT_PORT
    if (await checkHealth(port)) return port

    if (isDev) {
      const backDir = path.join(__dirname, '..', '..', 'back')
      backendProcess = spawn(
        'pipenv',
        ['run', 'python', 'main_desktop.py'],
        {
          cwd: backDir,
          env: { ...process.env, APP_PORT: String(port) },
          stdio: 'inherit',
          windowsHide: true,
          shell: process.platform === 'win32'
        }
      )
    } else {
      const backendPath = getBackendBinaryPath()
      backendProcess = spawn(backendPath, [], {
        env: { ...process.env, APP_PORT: String(port) },
        stdio: 'inherit',
        windowsHide: true
      })
    }

    if (backendProcess) {
      backendProcess.on('exit', (code) => {
        if (!isQuitting) {
          console.error(`[backend] exited with code ${code}`)
        }
      })
      backendProcess.on('error', (error) => {
        console.error(`[backend] failed to start: ${error.message}`)
      })
    }

    const ready = await waitForHealth(port)
    if (!ready) {
      console.warn('[backend] health check timed out')
    }

    return port
  })()

  return backendStarting
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  const devServerUrl = process.env.VITE_DEV_SERVER_URL
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

app.whenReady().then(async () => {
  await startBackend()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('before-quit', () => {
  isQuitting = true
  if (backendProcess) {
    backendProcess.kill()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
