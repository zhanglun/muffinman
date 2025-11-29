import { app, BrowserWindow, WebContentsView, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let webContentsView: WebContentsView | null = null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.webContents.openDevTools();

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// 创建 WebContentsView
function createWebContentsView(bounds?: { x: number; y: number; width: number; height: number }) {
  if (!win || webContentsView) return

  webContentsView = new WebContentsView()

  // 将 WebContentsView 添加到主窗口的 contentView
  win.contentView.addChildView(webContentsView)

  // 如果提供了位置信息，使用它；否则使用默认位置
  if (bounds) {
    webContentsView.setBounds(bounds)
  } else {
    // 默认位置（在主窗口底部，高度 600px）
    const winBounds = win.getBounds()
    webContentsView.setBounds({
      x: 0,
      y: winBounds.height - 600,
      width: winBounds.width,
      height: 600,
    })
  }

  // 加载远程 URL
  webContentsView.webContents.loadURL(
    'https://chat.deepseek.com/a/chat/s/27a6f20c-30a8-4b63-85da-346956c1ed8c'
  )
}

// 更新 WebContentsView 的位置和大小
function setWebContentsViewBounds(bounds: { x: number; y: number; width: number; height: number }) {
  if (webContentsView && win) {
    webContentsView.setBounds(bounds)
  }
}

// 销毁 WebContentsView
function destroyWebContentsView() {
  if (webContentsView && win) {
    win.contentView.removeChildView(webContentsView)
    // WebContentsView 销毁时会自动清理其 webContents
    webContentsView = null
  }
}

// IPC 处理程序
ipcMain.handle('webview:create', (_event, bounds?: { x: number; y: number; width: number; height: number }) => {
  createWebContentsView(bounds)
  return { success: true }
})

ipcMain.handle('webview:destroy', () => {
  destroyWebContentsView()
  return { success: true }
})

ipcMain.handle('webview:exists', () => {
  return { exists: webContentsView !== null }
})

ipcMain.handle('webview:setBounds', (_event, bounds: { x: number; y: number; width: number; height: number }) => {
  setWebContentsViewBounds(bounds)
  return { success: true }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    destroyWebContentsView()
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
