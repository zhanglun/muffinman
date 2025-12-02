import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { AIServiceManager } from "./services/ai-manager";
import { ServiceConfig } from "./services/types";
import { AIService } from "./services/ai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  win.webContents.openDevTools();

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}


// IPC 处理程序

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let aiServiceManager: AIServiceManager | null = null;

app.whenReady().then(() => {
  createWindow();
  // 初始化 AI 服务管理器
  aiServiceManager = new AIServiceManager(win as BrowserWindow);

  // 不再预加载服务，按需创建 webview
});

ipcMain.handle("get-services", async () => {
  if (!aiServiceManager) return [];

  const services: ServiceConfig[] = [];

  aiServiceManager.getServices().forEach((service: AIService) => {
    services.push({
      id: service.id,
      name: service.name,
      urls: service.urls,
    });
  });
  return services;
});

ipcMain.handle(
  "switch-to-service",
  async (event, serviceId, specificUrl = null, bounds = null) => {
    if (aiServiceManager) {
      const service = await aiServiceManager.switchToService(
        serviceId,
        specificUrl
      );

      console.log("🚀 ~ service:", service)

      // 如果提供了 bounds，设置 webview 的位置和大小
      if (bounds && service.currentWebView) {
        service.currentWebView.setBounds(bounds);
      }
      return { success: true, service: service.id };
    }
    return { success: false, error: "Service manager not initialized" };
  }
);

ipcMain.handle("preload-service", async (event, serviceId) => {
  if (aiServiceManager) {
    aiServiceManager.preloadService(serviceId);
    return { success: true };
  }
  return { success: false };
});

ipcMain.handle("register-service", async (event, serviceConfig) => {
  if (aiServiceManager) {
    // 动态注册新服务
    const newServiceId = serviceConfig.name.toLowerCase().replace(/\s+/g, "-");
    const config = {
      id: newServiceId,
      name: serviceConfig.name,
      domains: [new URL(serviceConfig.url).hostname],
      urls: [serviceConfig.url],
    };

    aiServiceManager.registerService(config);
    return { success: true, serviceId: newServiceId };
  }
  return { success: false };
});

// 设置当前 webview 的 bounds
ipcMain.handle(
  "webview:setBounds",
  async (event, bounds: { x: number; y: number; width: number; height: number }) => {
    if (aiServiceManager) {
      const result = await aiServiceManager.setCurrentWebViewBounds(bounds);
      return { success: result };
    }
    return { success: false };
  }
);

// 隐藏当前 webview
ipcMain.handle("webview:hide", async () => {
  if (aiServiceManager) {
    await aiServiceManager.hideCurrentService();
    return { success: true };
  }
  return { success: false };
});
