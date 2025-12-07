import { ipcMain } from 'electron';
import { WindowManager } from '../managers/windows';

export class WebviewIPC {
  constructor(private windowManager: WindowManager) {
    this.registerHandlers();
  }

  private registerHandlers() {
    // IPC 处理程序
    // ipcMain.handle(
    //   "webview:create",
    //   (
    //     _event,
    //     webviewInfo: { url: string; name: string },
    //     bounds?: { x: number; y: number; width: number; height: number }
    //   ) => {
    //     this.windowManager.createWebContentsView(webviewInfo, bounds);

    //     return { success: true };
    //   }
    // );

    ipcMain.handle("webview:destroy", () => {
      console.log("TODO: 🚀 ~ WebviewIPC ~ registerHandlers ~ webview:destroy:")
      // this.destroyWebContentsView();

      return { success: true };
    });

    ipcMain.handle("webview:hide",() => {
      // this.windowManager.hideWebContentsView();
    })

    // ipcMain.handle("webview:exists", () => {
    //   return { exists: this.windowManager.hasWebContentsView() };
    // });

    ipcMain.handle(
      "webview:setBounds",
      (_event, id:string, bounds: { x: number; y: number; width: number; height: number }) => {
        this.windowManager.updateWebViewBounds(id, bounds);
        return { success: true };
      }
    );
  }
}