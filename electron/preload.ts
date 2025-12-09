import { ipcRenderer, contextBridge } from "electron";
import {
  CrossWebviewMessageDto,
  MessageDto,
  ServiceConfig,
} from "./services/types";
import { DOMManager } from "./injects/dom/dom-manager";
import { WindowManager } from "./managers/windows";
import { set } from "react-hook-form";

const domManager = new DOMManager();

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // You can expose other APTs you need here.
  // ...

  getServices: () => ipcRenderer.invoke("get-services"),
  switchToService: (
    serviceId: string,
    specificUrl: string | null = null,
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null = null
  ) => ipcRenderer.invoke("switch-to-service", serviceId, specificUrl, bounds),
  preloadService: (serviceId: string) =>
    ipcRenderer.invoke("preload-service", serviceId),
  registerService: (serviceConfig: ServiceConfig) =>
    ipcRenderer.invoke("register-service", serviceConfig),
  destroyService: (service: ServiceConfig) =>
    ipcRenderer.invoke("destroy-service", service),
  destroyAllService: () => ipcRenderer.invoke("destroy-all-service"),
  getServiceURLs: (serviceId: string) =>
    ipcRenderer.invoke("get-service-urls", serviceId),
  getServiceName: (serviceId: string) =>
    ipcRenderer.invoke("get-service-name", serviceId),
  getServiceID: (serviceId: string) =>
    ipcRenderer.invoke("get-service-id", serviceId),
  getServiceMainWindow: (serviceId: string) =>
    ipcRenderer.invoke("get-service-main-window", serviceId),

  sendMyWords: (messageDto: MessageDto) =>
    ipcRenderer.send("sendMyWords", messageDto),

  sendToWebview: (messageDto: MessageDto) =>
    ipcRenderer.invoke("webview:send-message", messageDto),

  /**
   * 嵌入到webview的方法
   */

  sendMessageFromWebview: (crossWebviewMessageDto: CrossWebviewMessageDto) =>
    ipcRenderer.invoke("webview:send-message-back", crossWebviewMessageDto),

  DOMManager: {
    getUserMessageDOM: () => {
      const result = domManager.getUserMessageDOM();
      console.log("🚀 ~ result:", result);
    },
  },

  WindowManager: {
    setMainViewToTop: () => {
      ipcRenderer.invoke("webview:set-main-view-to-top");
    },
    setChildViewToTop: (serviceId: string) => {
      ipcRenderer.invoke("webview:set-child-view-to-top", serviceId);
    }
  }
});
