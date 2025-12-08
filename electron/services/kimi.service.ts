import { MessageDto, ServiceConfig } from "./types";
import { AIService } from "./ai";
import { WindowManager } from "../managers/windows";

export class KimiService extends AIService {
  constructor(config: ServiceConfig, windowManager: WindowManager) {
    super(config, windowManager);
  }

  override async sendMessage(messageDto: MessageDto): Promise<void> {
    const webView = this.windowManager.getChildView(this.id);

    if (!webView) {
      return;
      // return { success: false, error: `WebView for ${this.id} not found.` };
    }

    const webContents = webView.webContents;

    // --- 等待 WebView 加载完成 ---
    try {
      await this.waitForWebViewReady(webContents);
    } catch (error) {
      return;
      // return { success: false, error: `Failed to wait for ${this.name} WebView to be ready: ${error.message}` };
    }

    // --- 加载完成，可以安全操作 DOM ---
    if (webView) {
      console.log("🚀 ~ KimiService ~ sendMessage ~ webView:", webView);
      try {
        await webView.webContents.executeJavaScript(`
          (async () => {
            console.log("Kimi is ready")
             // 等待函数
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // 等待元素并且确保它是可交互的
    const waitForInteractiveElement = async (selector, timeout = 5000) => {
      const start = Date.now();

      while (Date.now() - start < timeout) {
        const element = document.querySelector(selector);

        if (element) {
          // 检查元素是否真的可交互
          const style = window.getComputedStyle(element);
          const isVisible = style.display !== 'none' &&
                           style.visibility !== 'hidden' &&
                           style.opacity !== '0';

          const isInDOM = document.body.contains(element);

          // 检查是否有事件监听器（通过检查某些属性）
          const hasClickHandler = element.onclick ||
                                  element.getAttribute('onclick') ||
                                  element.hasAttribute('data-click-bound');

          if (isVisible && isInDOM) {
            console.log(\`元素找到: \${selector}, 可见: \${isVisible}, 有点击处理器: \${hasClickHandler}\`);
            return element;
          }
        }

        // 等待一段时间再检查
        await wait(100);
      }

      throw new Error(\`元素不可交互或超时: \${selector}\`);
    };

            const pSelector = '#page-layout-container > div > div.layout-content-main > div > div.chat-editor > div.chat-input > div > div > p';
            const p = await waitForInteractiveElement(pSelector, 3000);
              p.click()
              await wait(100);
              p.focus();

              document.execCommand('insertText', false, ${JSON.stringify(
                messageDto.message
              )})
              const btnSelector = '#page-layout-container > div > div.layout-content-main > div > div.chat-editor > div.chat-editor-action > div.right-area > div.send-button-container > div'
            const btn = await waitForInteractiveElement(btnSelector, 3000);
              btn.style.padding = '20px';
              btn.click()

        })()
        `);
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            `[KimiService - ${this.name}] Error executing JavaScript: ${error.message}`
          );
        } else {
          console.error(
            `[KimiService - ${this.name}] Unknown error occurred:`,
            error
          );
        }
      }
    }
  }
}
