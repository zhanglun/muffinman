import { MessageDto, ServiceConfig } from "./types";
import { AIService } from "./ai";
import { WindowManager } from "../managers/windows";

export class KimiService extends AIService {
  constructor(config: ServiceConfig, windowManager: WindowManager) {
    super(config, windowManager);
  }

  override async sendMessage(messageDto: MessageDto): Promise<void> {
    console.log(`Sending message to Kimi: `, messageDto);

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
      await webView.webContents.executeJavaScript(`
        (() => {
          alert("Kimi is ready")
        })
      `)
    }

    // 示例实现（需要根据实际需求完善）：
    // 1. 获取 webview 实例
    // 2. 执行 JavaScript 将消息注入到网页中
    // 3. 触发发送操作

    // 暂时保留空实现，后续补充完整逻辑
  }

  async getLatestReply(): Promise<string> {
    // TODO: 实现获取最新回复的逻辑
    return "";
  }
}