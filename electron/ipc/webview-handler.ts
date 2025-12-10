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
    ipcMain.on(
      "webview:send-message",
      async (_event, messageDto: MessageDto) => {
        const { services } = messageDto;
        const webviewId = services[0]?.id;
        const webview = this.windowManager.getChildView(webviewId);

        if (webview) {
          // 发送结果给WebView
          await webview.webContents.executeJavaScript(`
          (() => {
            const list = window.ipcRenderer.DOMManager.getUserMessageDOM();

            window.ipcRenderer.sendMessageFromWebview({
              message: 'message-list',
              action: 'get-message-list',
              fromId: "${webviewId}",
              payload: {
                list: list
              },
              services: ${JSON.stringify(services)}
            });
          })()
        `);

          return "success";
        }
      }
    );

    ipcMain.on(
      "webview:send-message-back",
      async (_event, crossWebviewMessageDto: CrossWebviewMessageDto) => {
        const webview = this.windowManager.getChildView(
          crossWebviewMessageDto.fromId
        );
        const mainWindow = this.windowManager.getMainWindow();

        if (webview && mainWindow) {
          console.log(
            "🚀 ~ WebviewIPC ~ registerHandlers ~ CrossWebviewMessageDto:",
            crossWebviewMessageDto
          );
          mainWindow.webContents.send(
            "webview:received-message",
            crossWebviewMessageDto
          );
        }
      }
    );

    ipcMain.handle("webview:destroy", () => {
      return { success: true };
    });

    ipcMain.handle("webview:hide", () => {});

    ipcMain.handle("webview:set-main-view-to-top", () => {
      this.windowManager.moveMainViewToTop();
    });

    ipcMain.handle("webview:set-child-view-to-top", (_event, serviceId) => {
      this.windowManager.moveToTop(serviceId);
    });

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
