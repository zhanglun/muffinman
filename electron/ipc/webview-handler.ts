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
      "webview:send-message-to-child-view",
      async (_event, messageDto: MessageDto) => {
        const { services, message, action, payload } = messageDto;
        const webviewId = services[0]?.id;
        const webview = this.windowManager.getChildView(webviewId);

        if (webview) {
          // 发送结果给WebView,
          // TODO: 将代码从字符串模板中抽离， 根据action来执行不同的函数，返回数据之后再转发
          await webview.webContents.executeJavaScript(`
          (() => {

            const list = window.ipcRenderer.DOMManager.getUserMessageDOM();
            const result = { list: list}

            window.ipcRenderer.sendMessageToMainView({
              message: "${message}",
              action: "${action}",
              fromId: "${webviewId}",
              payload: result,
              services: ${JSON.stringify(services)}
            });
          })()
        `);

          return "success";
        }
      }
    );

    ipcMain.on(
      "webview:send-message-to-main-view",
      async (_event, crossWebviewMessageDto: CrossWebviewMessageDto) => {
        const mainWindow = this.windowManager.getMainWindow();
        const mainView = this.windowManager.getMainView();

        if (mainView && mainWindow) {
          console.log(
            "🚀 ~ WebviewIPC ~ registerHandlers ~ CrossWebviewMessageDto:",
            crossWebviewMessageDto
          );
          mainView.webContents.send(
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
