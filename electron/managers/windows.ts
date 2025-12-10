import { BrowserWindow, WebContentsView } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private mainView: WebContentsView | null = null;
  private childViews: Map<string, WebContentsView> = new Map();

  createMainWindow(
    options: Electron.BrowserWindowConstructorOptions
  ): BrowserWindow {
    this.mainWindow = new BrowserWindow({
      width: 900,
      height: 600,
      minWidth: 400,
      minHeight: 300,
      ...options,
    });

    return this.mainWindow;
  }

  createMainView(options: Electron.WebContentsViewConstructorOptions): WebContentsView {
    if (!this.mainView) {
      this.mainView = new WebContentsView(options);
    }

    return this.mainView;
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  // 注册子视图
  registerChildView(id: string, webContents: WebContentsView): void {
    this.childViews.set(id, webContents);
  }

  // 获取子视图
  getChildView(id: string): WebContentsView | undefined {
    return this.childViews.get(id);
  }

  // 移除子视图
  unregisterChildView(id: string): boolean {
    return this.childViews.delete(id);
  }

  destroy(): void {
    if (this.mainWindow) {
      this.mainWindow.destroy();
      this.mainWindow = null;
    }
    this.childViews.clear();
  }

  hasWebContentsView(): boolean {
    return this.childViews.size > 0;
  }

  // 创建 WebContentsView
  createWebContentsView(
    info: { url: string; id: string },
    bounds?: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ) {
    const win = this.getMainWindow();

    if (!win) return;

    if (this.childViews.get(info.id)) {
      bounds && this.childViews.get(info.id)?.setBounds(bounds);

      return;
    }

    const webContentsView = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, "preload.mjs"),
      },
    });

    win.contentView.addChildView(webContentsView as any);

    this.registerChildView(info.id, webContentsView);

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
      webContentsView.webContents.openDevTools();
    });
  }

  // 更新指定webview的边界
  updateWebViewBounds(
    id: string,
    bounds: { x: number; y: number; width: number; height: number }
  ): boolean {
    const webContents = this.getChildView(id);

    if (webContents) {
      webContents.setBounds(bounds);
      return true;
    }
    return false;
  }

  public updateWebViewUrl(id: string, url: string) {
    const webContents = this.getChildView(id);

    if (webContents) {
      webContents.webContents.loadURL(url);
      return true;
    }

    return false;
  }

  public moveMainViewToTop() {
    const win = this.getMainWindow();

    if (this.mainView && win) {
      win.contentView.removeChildView(this.mainView);
      win.contentView.addChildView(this.mainView);
    }
  }

  public moveToTop(id: string) {
    const webContentsView = this.getChildView(id);

    if (webContentsView) {
      const win = this.getMainWindow();

      if (!win) return;

      // this.childViews.forEach((webContents) => {
      //   webContents.setVisible(false);
      // });

      win.contentView.removeChildView(webContentsView);
      win.contentView.addChildView(webContentsView);
    }
  }

  public destroyAllChildViews() {
    this.childViews.forEach((webContents) => {
      webContents.webContents.close();
    });
  }
}
