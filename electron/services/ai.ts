import { BrowserWindow, WebContents, WebContentsView } from "electron"
import { ServiceConfig } from "./types"

export class AIService {
  public id: string
  public name: string
  public urls: string[]
  public mainWindow: BrowserWindow
  public webViews: Map<string, WebContentsView>
  public currentWebView: WebContentsView | null
  private isLoaded: boolean

  constructor(config: ServiceConfig, mainWindow: BrowserWindow) {
    this.id = config.id
    this.name = config.name
    this.urls = config.urls
    this.mainWindow = mainWindow

    this.webViews = new Map() // url -> WebContentsView
    this.currentWebView = null
    this.isLoaded = false
  }

  // 创建或获取 WebContentsView
  async getWebView(url: string): Promise<WebContentsView> {
    if (this.webViews.has(url)) {
      return this.webViews.get(url) as WebContentsView
    }

    const webView = new WebContentsView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        // AI 网站通常需要这些权限
        webgl: true,
        plugins: true,
        experimentalFeatures: true
      }
    })

    // 设置通用大小
    webView.setBounds({ x: 50, y: 100, width: 1100, height: 600 })

    // 添加到主窗口但初始隐藏
    this.mainWindow.contentView.addChildView(webView)
    webView.setVisible(false)

    // 设置 AI 特定的监听器
    this.setupAIWebViewListeners(webView, url)

    // 加载 URL
    await webView.webContents.loadURL(url)

    this.webViews.set(url, webView)
    return webView
  }

  setupAIWebViewListeners(webView: WebContentsView, url: string): void {
    const { webContents } = webView

    // AI 网站通常有复杂的加载过程
    webContents.on('did-finish-load', async () => {
      console.log(`✅ ${this.name} - ${url} 加载完成`)

      // 注入 AI 网站优化脚本
      await this.injectAIOptimizations(webContents)

      // 等待可能的动态内容加载
      setTimeout(() => {
        this.ensureAIContentLoaded(webContents)
      }, 2000)
    })
  }

  async injectAIOptimizations(webContents: WebContents): Promise<void> {
    // AI 网站优化脚本
    const optimizationScript = `
      // 优化 AI 聊天网站的交互
      (function() {
        console.log('🔧 注入 AI 优化脚本');

        // 防止页面意外跳转
        const originalConfirm = window.confirm;
        window.confirm = function(message) {
          if (message.includes('leave') || message.includes('离开') || message.includes('refresh')) {
            return true; // 允许离开页面
          }
          return originalConfirm.call(this, message);
        };

        // 自动处理可能的弹窗
        setTimeout(() => {
          const dismissButtons = [
            ...document.querySelectorAll('[aria-label="Close"], .dismiss, .close, [data-dismiss="modal"]')
          ];
          dismissButtons.forEach(btn => {
            try { btn.click(); } catch(e) {}
          });
        }, 1000);

        // 保存重要的 UI 状态
        const saveUIState = () => {
          const state = {
            scrollPosition: window.scrollY,
            textAreas: Array.from(document.querySelectorAll('textarea')).map(ta => ({
              id: ta.id,
              value: ta.value
            })).filter(ta => ta.value),
            timestamp: Date.now()
          };
          localStorage.setItem('ai_chat_ui_state', JSON.stringify(state));
        };

        // 定期保存状态
        setInterval(saveUIState, 5000);
        window.addEventListener('beforeunload', saveUIState);

        // 恢复 UI 状态
        const savedState = localStorage.getItem('ai_chat_ui_state');
        if (savedState) {
          try {
            const state = JSON.parse(savedState);
            setTimeout(() => {
              window.scrollTo(0, state.scrollPosition);
              state.textAreas.forEach(ta => {
                const element = document.getElementById(ta.id);
                if (element && element.value === '') {
                  element.value = ta.value;
                }
              });
            }, 100);
          } catch(e) {}
        }
      })();
    `

    try {
      await webContents.executeJavaScript(optimizationScript)
    } catch (error) {
      console.log('注入 AI 优化脚本失败:', error)
    }
  }

  ensureAIContentLoaded(webContents: WebContents): void {
    // 检查是否已经加载了聊天界面
    const checkAILoaded = `
      (function() {
        // 检查常见的 AI 聊天界面元素
        const selectors = [
          '.chat-container',
          '[data-testid*="chat"]',
          '.conversation',
          '#chat',
          '.message',
          'textarea[placeholder*="message" i]',
          'input[placeholder*="message" i]'
        ];

        return selectors.some(selector => document.querySelector(selector));
      })();
    `

    webContents.executeJavaScript(checkAILoaded).then(isLoaded => {
      if (!isLoaded) {
        console.log('🤖 AI 聊天界面未完全加载，等待中...')
        // 可以在这里触发重试或其他处理
      }
    })
  }

  // 显示服务
  async show(specificUrl: string | null): Promise<WebContentsView> {
    const targetUrl = specificUrl || this.urls[0]
    const webView = await this.getWebView(targetUrl)

    // 隐藏其他 WebView
    this.webViews.forEach((wv, url) => {
      if (url !== targetUrl) {
        wv.setVisible(false)
      }
    })

    // 显示目标 WebView
    webView.setVisible(true)
    this.currentWebView = webView
    this.isLoaded = true

    // 确保获得焦点
    webView.webContents.focus()

    return webView
  }

  // 切换到同一服务的不同 URL
  async switchToURL(url: string): Promise<WebContentsView> {
    if (!this.urls.includes(url)) {
      // 如果是新的 URL，添加到服务中
      this.urls.push(url)
    }

    const webView = await this.getWebView(url)
    this.show(url)
    return webView
  }

  // 隐藏服务
  hide(): void {
    if (this.currentWebView) {
      this.currentWebView.setVisible(false)
    }
  }

  // 预加载服务
  async preload(): Promise<void> {
    if (this.urls.length > 0) {
      await this.getWebView(this.urls[0])
      this.isLoaded = true
    }
  }

  getURLs(): string[] {
    return [...this.urls]
  }

  // 清理资源
  destroy(): void {
    this.webViews.forEach(webView => {
      this.mainWindow.contentView.removeChildView(webView)
      if (!webView.webContents.isDestroyed()) {
        webView.webContents.close()
      }
    })
    this.webViews.clear()
  }
}