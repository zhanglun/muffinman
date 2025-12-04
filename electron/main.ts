import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { AIServiceManager } from "./services/ai-manager";
import { WindowManager } from "./managers/windows";
import { WebviewIPC, AIIPC, WordsIPC } from "./ipc";

// 修复 __dirname 在 ES 模塊中不可用的問題
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const aiIPC = new AIIPC(windowManager);
const wordsIPC = new WordsIPC(windowManager); // 已创建WordsIPC实例

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let aiServiceManager: AIServiceManager | null = null;

// 统一创建窗口函数
const createWindow = () => {
  windowManager.createMainWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    }
  });

  const win = windowManager.getMainWindow();
  if (win) {
    win.webContents.openDevTools();

    // Test active push message to Renderer-process.
    win.webContents.on("did-finish-load", () => {
      win.webContents.send("main-process-message", new Date().toLocaleString());
    });

    if (VITE_DEV_SERVER_URL) {
      win.loadURL(VITE_DEV_SERVER_URL);
    } else {
      win.loadFile(path.join(RENDERER_DIST, "index.html"));
    }

    // 初始化 AI 服务管理器（仅在首次创建窗口时）
    if (!aiServiceManager) {
      aiServiceManager = new AIServiceManager(windowManager);
      aiIPC.setAIServiceManager(aiServiceManager);
      wordsIPC.setAIServiceManager(aiServiceManager); // 已设置AI Service Manager

      // 預加載常用服務
      // aiServiceManager.preloadService("openai");
      // aiServiceManager.preloadService("claude");
    }
  }
};

app.whenReady().then(() => {
  createWindow();
});