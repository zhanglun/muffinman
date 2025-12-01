import { app, BrowserWindow, WebContentsView, ipcMain } from "electron";
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
let webContentsView: WebContentsView | null = null;

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

// 创建 WebContentsView
function createWebContentsView(
  info: { url: string; name: string },
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
) {
  if (!win || webContentsView) return;

  webContentsView = new WebContentsView({
    webPreferences: {
      devTools: true,
    },
  });

  // 将 WebContentsView 添加到主窗口的 contentView
  win.contentView.addChildView(webContentsView);

  // 如果提供了位置信息，使用它；否则使用默认位置
  if (bounds) {
    webContentsView.setBounds(bounds);
  } else {
    // 默认位置（在主窗口底部，高度 600px）
    const winBounds = win.getBounds();
    webContentsView.setBounds({
      x: 0,
      y: winBounds.height - 600,
      width: winBounds.width,
      height: 600,
    });
  }

  // 加载远程 URL
  webContentsView.webContents.loadURL(info.url);

  // 监听页面加载完成事件
  webContentsView.webContents.on("did-finish-load", () => {
    webContentsView?.webContents.openDevTools();

    // 执行 JavaScript 获取 DOM 元素
    webContentsView?.webContents
      .executeJavaScript(
        `
    // 你的 DOM 操作代码，例如获取特定元素的内容
    const targetElement = document.querySelector('.ds-modal-content');
    const elementData = targetElement ? targetElement.innerText : '元素未找到';
    elementData; // 返回获取的数据
  `
      )
      .then((result) => {
        // 处理从 WebView 中返回的数据
        console.log("获取到的元素数据:", result);
      })
      .catch((err) => {
        console.error("执行 JavaScript 失败:", err);
      });
  });
}

// 更新 WebContentsView 的位置和大小
function setWebContentsViewBounds(bounds: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  if (webContentsView && win) {
    webContentsView.setBounds(bounds);
  }
}

// 销毁 WebContentsView
function destroyWebContentsView() {
  if (webContentsView && win) {
    win.contentView.removeChildView(webContentsView);
    // WebContentsView 销毁时会自动清理其 webContents
    webContentsView = null;
  }
}

// IPC 处理程序
ipcMain.handle(
  "webview:create",
  (
    _event,
    webviewInfo: { url: string; name: string },
    bounds?: { x: number; y: number; width: number; height: number }
  ) => {
    createWebContentsView(webviewInfo, bounds);
    return { success: true };
  }
);

ipcMain.handle("webview:destroy", () => {
  destroyWebContentsView();
  return { success: true };
});

ipcMain.handle("webview:exists", () => {
  return { exists: webContentsView !== null };
});

ipcMain.handle(
  "webview:setBounds",
  (_event, bounds: { x: number; y: number; width: number; height: number }) => {
    setWebContentsViewBounds(bounds);
    return { success: true };
  }
);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    destroyWebContentsView();
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

  // 预加载常用服务
  aiServiceManager.preloadService("openai");
  aiServiceManager.preloadService("claude");
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
  async (event, serviceId, specificUrl = null) => {
    if (aiServiceManager) {
      const service = await aiServiceManager.switchToService(
        serviceId,
        specificUrl
      );
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
