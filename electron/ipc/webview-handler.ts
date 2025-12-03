import { ipcMain } from 'electron';
import { WindowManager } from '../managers/windows';

export class WebviewIPC {
  constructor(private windowManager: WindowManager) {
    this.registerHandlers();
  }

  private registerHandlers() {
    // IPC 处理程序
    ipcMain.handle(
      "webview:create",
      (
        _event,
        webviewInfo: { url: string; name: string },
        bounds?: { x: number; y: number; width: number; height: number }
      ) => {
        this.createWebContentsView(webviewInfo, bounds);
        return { success: true };
      }
    );

    ipcMain.handle("webview:destroy", () => {
      this.destroyWebContentsView();
      return { success: true };
    });

    // ipcMain.handle("webview:hide",() => {
    //   this.windowManager.focusMainWindow();
    // })

    // ipcMain.handle("webview:exists", () => {
    //   return { exists: this.windowManager.hasWebContentsView() };
    // });

    ipcMain.handle(
      "webview:setBounds",
      (_event, bounds: { x: number; y: number; width: number; height: number }) => {
        this.setWebContentsViewBounds(bounds);
        return { success: true };
      }
    );
  }

  // 创建 WebContentsView
  private createWebContentsView(
    info: { url: string; name: string },
    bounds?: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ) {
    const win = this.windowManager.getMainWindow();
    if (!win) return;

    // 检查是否已经存在webview
    if (this.windowManager.hasWebContentsView()) {
      this.windowManager.destroyWebContentsView();
    }

    this.windowManager.createWebContentsView(info, bounds);

    // 将 WebContentsView 添加到主窗口的 contentView
    // 注意：这里需要类型断言，因为 getWebContentsView() 返回的是 WebContentsView | null
    const webContentsView = this.windowManager.getWebContentsView();
    if (webContentsView) {
      win.contentView.addChildView(webContentsView as any);

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

        // 执行 JavaScript 获取 DOM 元素
        webContentsView.webContents
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
  }

  // 更新 WebContentsView 的位置和大小
  private setWebContentsViewBounds(bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    if (this.windowManager.hasWebContentsView()) {
      this.windowManager.setWebContentsViewBounds(bounds);
    }
  }

  // 销毁 WebContentsView
  private destroyWebContentsView() {
    if (this.windowManager.hasWebContentsView()) {
      this.windowManager.destroyWebContentsView();
    }
  }
}