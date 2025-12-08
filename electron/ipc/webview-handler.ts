import { ipcMain } from "electron";
import { WindowManager } from "../managers/windows";
import { MessageDto, CrossWebviewMessageDto } from "../services/types";

export class WebviewIPC {
  constructor(private windowManager: WindowManager) {
    this.windowManager = windowManager;
    this.registerHandlers();
  }

  private registerHandlers() {
    // 处理来自渲染进程的执行请求
    ipcMain.handle("webview:send-message", async (_event, messageDto: MessageDto) => {
      const { services } = messageDto;
      const webviewId = services[0]?.id;
      const webview = this.windowManager.getChildView(webviewId);

      if (webview) {
        // 发送结果给WebView
        await webview.webContents.executeJavaScript(`
          (() => {
            window.ipcRenderer.DOMManager.getUserMessageDOM();
            
            window.ipcRenderer.sendMessageFromWebview({
            id: "${webviewId}",
            payload: ${JSON.stringify({ data: 1323 })},
            services: ${JSON.stringify(services)}});
          })()
        `)
        // webview?.send("webview:function-result", result);
      }
    });

    ipcMain.handle("webview:send-message-back", async (_event, crossWebviewMessageDto: CrossWebviewMessageDto) => {
      console.log("🚀 ~ WebviewIPC ~ registerHandlers ~ crossWebviewMessageDto:", crossWebviewMessageDto)
      return 'haha';
    });

    ipcMain.handle("webview:destroy", () => {
      console.log(
        "TODO: 🚀 ~ WebviewIPC ~ registerHandlers ~ webview:destroy:"
      );
      // this.destroyWebContentsView();

      return { success: true };
    });

    ipcMain.handle("webview:hide", () => {
      // this.windowManager.hideWebContentsView();
    });

    // ipcMain.handle("webview:exists", () => {
    //   return { exists: this.windowManager.hasWebContentsView() };
    // });

    ipcMain.handle(
      "webview:setBounds",
      (
        _event,
        id: string,
        bounds: { x: number; y: number; width: number; height: number }
      ) => {
        this.windowManager.updateWebViewBounds(id, bounds);
        return { success: true };
      }
    );
  }
}
