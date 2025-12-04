import { BrowserWindow, WebContentsView } from "electron";

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
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

    const webContentsView = new WebContentsView();

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

    //   // 执行 JavaScript 获取 DOM 元素
    //   webContentsView.webContents
    //     .executeJavaScript(
    //       `
    //   // 你的 DOM 操作代码，例如获取特定元素的内容
    //   const targetElement = document.querySelector('.ds-modal-content');
    //   const elementData = targetElement ? targetElement.innerText : '元素未找到';
    //   elementData; // 返回获取的数据
    // `
    //     )
    //     .then((result) => {
    //       // 处理从 WebView 中返回的数据
    //       console.log("获取到的元素数据:", result);
    //     })
    //     .catch((err) => {
    //       console.error("执行 JavaScript 失败:", err);
    //     });
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
}
