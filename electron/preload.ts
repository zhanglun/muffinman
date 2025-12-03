import { ipcRenderer, contextBridge } from 'electron'
import { ServiceConfig } from './services/types'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...

  getServices: () => ipcRenderer.invoke('get-services'),
  switchToService: (serviceId: string, specificUrl: string | null = null, bounds: { x: number; y: number; width: number; height: number } | null = null) => ipcRenderer.invoke('switch-to-service', serviceId, specificUrl, bounds),
  preloadService: (serviceId: string) => ipcRenderer.invoke('preload-service', serviceId),
  registerService: (serviceConfig: ServiceConfig) => ipcRenderer.invoke('register-service', serviceConfig),
  destroyService: (serviceId: string) => ipcRenderer.invoke('destroy-service', serviceId),
  getServiceURLs: (serviceId: string) => ipcRenderer.invoke('get-service-urls', serviceId),
  getServiceName: (serviceId: string) => ipcRenderer.invoke('get-service-name', serviceId),
  getServiceID: (serviceId: string) => ipcRenderer.invoke('get-service-id', serviceId),
  getServiceMainWindow: (serviceId: string) => ipcRenderer.invoke('get-service-main-window', serviceId),

  sendMyWords: (words: string) => ipcRenderer.send('sendMyWords', words),
})
