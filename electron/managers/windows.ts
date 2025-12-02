import { BrowserWindow, WebContentsView, ipcMain } from 'electron';
import { join } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

// 修复 __dirname 在 ES 模块中不可用的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private webviews: Map<string, WebContentsView> = new Map();
  private windows: Map<string, BrowserWindow> = new Map();
  private webContentsView: WebContentsView | null = null;

  constructor() {
    // Initialize the window manager
  }

  /**
   * Create the main application window
   */
  public createMainWindow(options?: Electron.BrowserWindowConstructorOptions): BrowserWindow {
    const defaultOptions: Electron.BrowserWindowConstructorOptions = {
      width: 1200,
      height: 800,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, '../preload/index.js'),
        ...options?.webPreferences
      },
      ...options
    };

    this.mainWindow = new BrowserWindow(defaultOptions);

    // Handle window events
    this.setupWindowEvents(this.mainWindow);

    return this.mainWindow;
  }

  /**
   * Get the main window instance
   */
  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /**
   * Create a new browser window
   */
  public createWindow(id: string, options?: Electron.BrowserWindowConstructorOptions): BrowserWindow {
    const defaultOptions: Electron.BrowserWindowConstructorOptions = {
      width: 800,
      height: 600,
      show: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        ...options?.webPreferences
      },
      ...options
    };

    const window = new BrowserWindow(defaultOptions);
    this.windows.set(id, window);

    // Setup window event handlers
    window.on('closed', () => {
      this.windows.delete(id);
    });

    return window;
  }

  /**
   * Get a window by ID
   */
  public getWindow(id: string): BrowserWindow | undefined {
    return this.windows.get(id);
  }

  /**
   * Close a specific window
   */
  public closeWindow(id: string): void {
    const window = this.windows.get(id);
    if (window) {
      window.close();
      this.windows.delete(id);
    }
  }

  /**
   * Create a webview
   */
  public createWebview(id: string, _url: string): void {
    // Webview creation would typically happen in the renderer process
    // This is just a placeholder for managing webview references
    ipcMain.once(`webview-created-${id}`, (_event) => {
      // 注意：WebContentsView不是WebContents，需要调整类型
    });
  }

  /**
   * Get a webview by ID
   */
  public getWebview(id: string): WebContentsView | undefined {
    return this.webviews.get(id);
  }

  /**
   * Close all windows and clean up
   */
  public destroy(): void {
    // Close all additional windows
    for (const [id, window] of this.windows) {
      window.destroy();
    }
    this.windows.clear();

    // Clear webview references
    this.webviews.clear();
    
    this.destroyWebContentsView();

    // Don't destroy main window here as it may be handled separately
  }

  /**
   * Setup event handlers for a window
   */
  private setupWindowEvents(window: BrowserWindow): void {
    window.on('ready-to-show', () => {
      window.show();
    });

    window.on('closed', () => {
      if (window === this.mainWindow) {
        this.mainWindow = null;
      }
    });
  }

  /**
   * Check if main window exists and is not destroyed
   */
  public isMainWindowValid(): boolean {
    return this.mainWindow !== null && !this.mainWindow.isDestroyed();
  }

  /**
   * Focus the main window
   */
  public focusMainWindow(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.focus();
    }
  }
  
  /**
   * Create WebContentsView
   */
  public createWebContentsView(
    info: { url: string; name: string },
    bounds?: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ): void {
    if (!this.mainWindow || this.webContentsView) return;

    this.webContentsView = new WebContentsView({
      webPreferences: {
        devTools: true,
      },
    });

    // 将 WebContentsView 添加到主窗口的 contentView
    this.mainWindow.contentView.addChildView(this.webContentsView);

    // 如果提供了位置信息，使用它；否则使用默认位置
    if (bounds) {
      this.webContentsView.setBounds(bounds);
    } else {
      // 默认位置（在主窗口底部，高度 600px）
      const winBounds = this.mainWindow.getBounds();
      this.webContentsView.setBounds({
        x: 0,
        y: winBounds.height - 600,
        width: winBounds.width,
        height: 600,
      });
    }

    // 加载远程 URL
    this.webContentsView.webContents.loadURL(info.url);

    // 监听页面加载完成事件
    this.webContentsView.webContents.on("did-finish-load", () => {
      this.webContentsView?.webContents.openDevTools();

      // 执行 JavaScript 获取 DOM 元素
      this.webContentsView?.webContents
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
  
  /**
   * Update WebContentsView bounds
   */
  public setWebContentsViewBounds(bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): void {
    if (this.webContentsView && this.mainWindow) {
      this.webContentsView.setBounds(bounds);
    }
  }
  
  /**
   * Destroy WebContentsView
   */
  public destroyWebContentsView(): void {
    if (this.webContentsView && this.mainWindow) {
      this.mainWindow.contentView.removeChildView(this.webContentsView);
      // WebContentsView 销毁时会自动清理其 webContents
      this.webContentsView = null;
    }
  }
  
  /**
   * Check if WebContentsView exists
   */
  public hasWebContentsView(): boolean {
    return this.webContentsView !== null;
  }
  
  /**
   * Get WebContentsView instance
   */
  public getWebContentsView(): WebContentsView | null {
    return this.webContentsView;
  }
}