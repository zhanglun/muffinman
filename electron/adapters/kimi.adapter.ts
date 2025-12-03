import { BrowserWindow, WebContents, WebContentsView } from "electron";

/**
 * Kimi AI 适配器
 * 实现与 Kimi AI 网页的交互逻辑
 */
export class KimiAdapter {
  private webView: WebContentsView | null = null;

  constructor(webView: WebContentsView) {
    this.webView = webView;
  }

  /**
   * 发送消息到 Kimi AI
   * @param message 用户输入的消息
   */
  public async sendMessage(message: string): Promise<void> {
    if (!this.webView) {
      throw new Error("Kimi webview is not available");
    }

    try {
      await this.webView.webContents.executeJavaScript(`
        (() => {
          alert("Kimi is ready")
          // 查找输入框并填入内容
          const inputElement = document.querySelector('#page-layout-container > div > div.layout-content-main > div > div.chat-editor > div.chat-input > div > div > p > span');
          if (inputElement) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLTextAreaElement.prototype,
              "value"
            ).set;
            nativeInputValueSetter.call(inputElement, ${JSON.stringify(message)});

            const event = new Event('input', { bubbles: true});
            inputElement.dispatchEvent(event);

            // 查找发送按钮并点击
            const sendButtons = Array.from(document.querySelectorAll('button'));
            const sendButton = sendButtons.find(button =>
              button.textContent.includes('发送') ||
              button.textContent.includes('Send') ||
              button.querySelector('svg') // 有些发送按钮可能使用图标
            );

            if (sendButton) {
              sendButton.click();
              true; // 表示成功找到并点击了发送按钮
            } else {
              // 如果找不到发送按钮，尝试按回车键
              const keyboardEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true,
                cancelable: true
              });
              inputElement.dispatchEvent(keyboardEvent);
              true; // 表示触发了回车事件
            }
          } else {
            false; // 表示未找到输入框
          }
        })()
      `);
    } catch (error) {
      console.error("Failed to send message to Kimi:", error);
      throw error;
    }
  }

  /**
   * 获取当前页面的回复内容
   * @returns 最新的回复内容
   */
  public async getLatestReply(): Promise<string> {
    if (!this.webView) {
      throw new Error("Kimi webview is not available");
    }

    try {
      const result = await this.webView.webContents.executeJavaScript(`
        (() => {
          // 查找回复内容，这需要根据 Kimi 的具体页面结构来调整
          const replyElements = Array.from(document.querySelectorAll('.message-content')); // 根据实际情况调整选择器
          if (replyElements.length > 0) {
            const latestReply = replyElements[replyElements.length - 1];
            return latestReply.innerText || latestReply.textContent || '';
          }
          return '';
        })()
      `);

      return result;
    } catch (error) {
      console.error("Failed to get latest reply from Kimi:", error);
      throw error;
    }
  }
}