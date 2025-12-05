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
      return
      // return { success: false, error: `WebView for ${this.id} not found.` };
    }

    const webContents = webView.webContents;

    // --- 等待 WebView 加载完成 ---
    try {
      await this.waitForWebViewReady(webContents);
    } catch (error) {
      return
      // return { success: false, error: `Failed to wait for ${this.name} WebView to be ready: ${error.message}` };
    }

    // --- 加载完成，可以安全操作 DOM ---
    if (webView) {
      console.log("🚀 ~ KimiService ~ sendMessage ~ webView:", webView)
      try {
        await webView.webContents.executeJavaScript(`
          (() => {
            console.log("Kimi is ready")
            const p = document.querySelector('#page-layout-container > div > div.layout-content-main > div > div.chat-editor > div.chat-input > div > div > p');
            console.log("p", p)
            setTimeout(() => {
              p.focus()
              document.execCommand('insertText', false, ${JSON.stringify(messageDto.message)})
              document.querySelector('#page-layout-container > div > div.layout-content-main > div > div.chat-editor > div.chat-editor-action > div.right-area > div.send-button-container > div').click()
            })

        })()
        `)
      } catch (error: Error) {
        console.error(`[KimiService - ${this.name}] Error executing JavaScript: ${error.message}`);
      }
    }
  }

}