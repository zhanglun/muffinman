import { WebContents, WebContentsView } from "electron";
import { MessageDto, ServiceConfig } from "./types";
import { WindowManager } from "../managers/windows";

export class AIService {
  public id: string;
  public name: string;
  public urls: string[];
  public isLoaded: boolean;

  public windowManager: WindowManager;

  constructor(config: ServiceConfig, windowManager: WindowManager) {
    this.id = config.id;
    this.name = config.name;
    this.urls = config.urls;
    this.isLoaded = false;
    this.windowManager = windowManager;
  }

  // 定义抽象方法，子类必须实现
  async sendMessage(messageDto: MessageDto): Promise<void> {
    console.log(
      `[AIService - ${messageDto?.services[0].id}] sendChatMessage called with: ${messageDto.message}. Implement specific logic in subclass.`
    );
  }

  // setupAIWebViewListeners(webView: WebContentsView, url: string): void {
  //   const { webContents } = webView;

  //   // AI 网站通常有复杂的加载过程
  //   webContents.on("did-finish-load", async () => {
  //     console.log(`✅ ${this.name} - ${url} 加载完成`);

  //     // 注入 AI 网站优化脚本
  //     await this.injectAIOptimizations(webContents);

  //     // 等待可能的动态内容加载
  //     setTimeout(() => {
  //       this.ensureAIContentLoaded(webContents);
  //     }, 2000);
  //   });
  // }

  // async injectAIOptimizations(webContents: WebContents): Promise<void> {
  //   // AI 网站优化脚本
  //   const optimizationScript = `
  //     // 优化 AI 聊天网站的交互
  //     (function() {
  //       console.log('🔧 注入 AI 优化脚本');

  //       // 防止页面意外跳转
  //       const originalConfirm = window.confirm;
  //       window.confirm = function(message) {
  //         if (message.includes('leave') || message.includes('离开') || message.includes('refresh')) {
  //           return true; // 允许离开页面
  //         }
  //         return originalConfirm.call(this, message);
  //       };

  //       // 自动处理可能的弹窗
  //       setTimeout(() => {
  //         const dismissButtons = [
  //           ...document.querySelectorAll('[aria-label="Close"], .dismiss, .close, [data-dismiss="modal"]')
  //         ];
  //         dismissButtons.forEach(btn => {
  //           try { btn.click(); } catch(e) {}
  //         });
  //       }, 1000);

  //       // 保存重要的 UI 状态
  //       const saveUIState = () => {
  //         const state = {
  //           scrollPosition: window.scrollY,
  //           textAreas: Array.from(document.querySelectorAll('textarea')).map(ta => ({
  //             id: ta.id,
  //             value: ta.value
  //           })).filter(ta => ta.value),
  //           timestamp: Date.now()
  //         };
  //         localStorage.setItem('ai_chat_ui_state', JSON.stringify(state));
  //       };

  //       // 定期保存状态
  //       setInterval(saveUIState, 5000);
  //       window.addEventListener('beforeunload', saveUIState);

  //       // 恢复 UI 状态
  //       const savedState = localStorage.getItem('ai_chat_ui_state');
  //       if (savedState) {
  //         try {
  //           const state = JSON.parse(savedState);
  //           setTimeout(() => {
  //             window.scrollTo(0, state.scrollPosition);
  //             state.textAreas.forEach(ta => {
  //               const element = document.getElementById(ta.id);
  //               if (element && element.value === '') {
  //                 element.value = ta.value;
  //               }
  //             });
  //           }, 100);
  //         } catch(e) {}
  //       }
  //     })();
  //   `;

  //   try {
  //     await webContents.executeJavaScript(optimizationScript);
  //   } catch (error) {
  //     console.log("注入 AI 优化脚本失败:", error);
  //   }
  // }

  // ensureAIContentLoaded(webContents: WebContents): void {
  //   // 检查是否已经加载了聊天界面
  //   const checkAILoaded = `
  //     (function() {
  //       // 检查常见的 AI 聊天界面元素
  //       const selectors = [
  //         '.chat-container',
  //         '[data-testid*="chat"]',
  //         '.conversation',
  //         '#chat',
  //         '.message',
  //         'textarea[placeholder*="message" i]',
  //         'input[placeholder*="message" i]'
  //       ];

  //       return selectors.some(selector => document.querySelector(selector));
  //     })();
  //   `;

  //   webContents.executeJavaScript(checkAILoaded).then((isLoaded) => {
  //     if (!isLoaded) {
  //       console.log("🤖 AI 聊天界面未完全加载，等待中...");
  //       // 可以在这里触发重试或其他处理
  //     }
  //   });
  // }

  // 显示服务
  async show(
    specificUrl?: string,
    bounds?: { x: number; y: number; height: number; width: number }
  ): Promise<WebContentsView> {
    const targetUrl = specificUrl || this.urls[0];

    if (!this.windowManager.getChildView(this.id)) {
      this.windowManager.createWebContentsView(
        {
          url: targetUrl as string,
          id: this.id,
        },
        bounds
      );
    }

    const webView = this.windowManager.getChildView(this.id) as WebContentsView;

    console.log("🚀 ~ AIService ~ show ~ webView:", webView)

    // 显示目标 WebView
    bounds && this.windowManager.updateWebViewBounds(this.id, bounds);

    webView.setVisible(true);

    this.isLoaded = true;

    // 确保获得焦点
    webView.webContents.focus();

    return webView;
  }

  // 切换到同一服务的不同 URL
  async switchToURL(url: string) {
    if (!this.urls.includes(url)) {
      // 如果是新的 URL，添加到服务中
      this.urls.push(url);
    }

    return this.windowManager.updateWebViewUrl(this.id, url);
  }

  getURLs(): string[] {
    return [...this.urls];
  }

  hide() {}

  destroy() {
    this.windowManager.unregisterChildView(this.id);
  }

  /**
   * 等待 WebView 加载完成 (dom-ready)
   * @param webContents WebContents 实例
   * @param timeout 超时时间 (毫秒)
   * @returns Promise<void>
   */
  public async waitForWebViewReady(
    webContents: Electron.WebContents,
    timeout: number = 10000
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      // 检查是否已经加载完成
      if (
        !webContents.isLoading() &&
        webContents.getURL() &&
        webContents.getURL() !== "about:blank"
      ) {
        console.log(`[AIService - ${this.name}] WebView already ready.`);
        resolve();
        return;
      }

      const timeoutId = setTimeout(() => {
        console.error(
          `[AIService - ${this.name}] Timeout waiting for WebView to be ready after ${timeout}ms.`
        );
        // 移除事件监听器
        webContents.removeListener("dom-ready", onDomReady);
        webContents.removeListener("did-fail-load", onLoadFailed);
        reject(
          new Error(
            `Timeout waiting for WebView to be ready after ${timeout}ms.`
          )
        );
      }, timeout);

      const onDomReady = () => {
        console.log(`[AIService - ${this.name}] WebView DOM ready.`);
        clearTimeout(timeoutId);
        // 移除事件监听器
        webContents.removeListener("did-fail-load", onLoadFailed);
        resolve();
      };

      const onLoadFailed = (
        event: Electron.Event,
        errorCode: number,
        errorDescription: string
      ) => {
        console.error(
          `[AIService - ${this.name}] WebView load failed: ${errorDescription} (Code: ${errorCode})`
        );
        clearTimeout(timeoutId);
        // 移除事件监听器
        webContents.removeListener("dom-ready", onDomReady);
        reject(
          new Error(
            `WebView load failed: ${errorDescription} (Code: ${errorCode})`
          )
        );
      };

      // 监听事件
      webContents.on("dom-ready", onDomReady);
      webContents.on("did-fail-load", onLoadFailed);

      // 再次检查，以防在设置监听器前就完成了
      if (
        !webContents.isLoading() &&
        webContents.getURL() &&
        webContents.getURL() !== "about:blank"
      ) {
        console.log(
          `[AIService - ${this.name}] WebView ready check passed after listener setup.`
        );
        clearTimeout(timeoutId);
        webContents.removeListener("dom-ready", onDomReady);
        webContents.removeListener("did-fail-load", onLoadFailed);
        resolve();
      }
    });
  }
}
