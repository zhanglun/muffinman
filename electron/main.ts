import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { AIServiceManager } from "./services/ai-manager";
import { WindowManager } from "./managers/windows";
import { WebviewIPC, AIIPC } from "./ipc";

// 修复 __dirname 在 ES 模块中不可用的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("🚀 ~ __dirname:", __dirname)

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

const windowManager = new WindowManager();
const webviewIPC = new WebviewIPC(windowManager);
const aiIPC = new AIIPC();








// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    windowManager.destroyWebContentsView();
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.createMainWindow({
      icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
      webPreferences: {
        preload: path.join(__dirname, "preload.mjs"),
      }
    });

    const win = windowManager.getMainWindow();
    if (win) {
      // Test active push message to Renderer-process.
      win.webContents.on("did-finish-load", () => {
        win.webContents.send("main-process-message", new Date().toLocaleString());
      });

      if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
      } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(RENDERER_DIST, "index.html"));
      }
    }
  }
});

let aiServiceManager: AIServiceManager | null = null;

app.whenReady().then(() => {
  windowManager.createMainWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    }
  });

  const win = windowManager.getMainWindow();
  if (win) {
    win.webContents.openDevTools();

    // 初始化 AI 服务管理器
    aiServiceManager = new AIServiceManager(win);
    aiIPC.setAIServiceManager(aiServiceManager);

    // 预加载常用服务
    aiServiceManager.preloadService("openai");
    aiServiceManager.preloadService("claude");
  }
});