import { BrowserWindow, Session } from "electron"
import { ServiceConfig } from "./types"
import { AIService } from "./ai"


// AI 服务管理器
export class AIServiceManager {
  private mainWindow: BrowserWindow
  private services: Map<string, any>
  private currentService: any | null

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.services = new Map()
    this.currentService = null
    this.setupDefaultServices()
  }

  setupDefaultServices(): void {
    const serviceConfigs: ServiceConfig[] = [
      {
        id: 'kimi',
        name: 'Kimi',
        urls: [
          'https://www.kimi.com/',
        ],
      },
      {
        id: 'qwen',
        name: 'Qwen',
        urls: [
          'https://chat.qwen.ai',
        ],
      },
      {
        id: 'deepseek',
        name: 'DeepSeek',
        urls: [
          'https://chat.deepseek.com',
        ],
      },
      {
        id: 'openai',
        name: 'OpenAI',
        urls: [
          'https://chat.openai.com/',
          'https://chat.openai.com/?model=gpt-4'
        ],
      },
      {
        id: 'claude',
        name: 'Claude',
        urls: [
          'https://claude.ai/',
          'https://claude.ai/new'
        ],
      },
      {
        id: 'gemini',
        name: 'Gemini',
        urls: [
          'https://gemini.google.com/'
        ],
      }
    ]

    serviceConfigs.forEach(config => {
      this.registerService(config)
    })
  }

  registerService(config: ServiceConfig) {
    const service = new AIService(config, this.mainWindow)
    this.services.set(config.id, service)
  }

  getServices(): Map<string, AIService> {
    return this.services
  }

  setupServiceSession(serviceSession: Session, domains: string[]): void {
    // 为特定域名优化缓存策略
    serviceSession.webRequest.onBeforeRequest((details: any, callback: (details: any) => void) => {
      const url = new URL(details.url as string)

      // AI 聊天网站通常有大量的实时通信，对静态资源进行缓存
      if (domains.includes(url.hostname)) {
        if (details.url.includes('/_next/static/') || details.url.includes('.css') || details.url.includes('.js')) {
          // 延长静态资源缓存时间
          callback({
            cancel: false,
            requestHeaders: {
              ...details.requestHeaders,
              'Cache-Control': 'max-age=3600'
            }
          })
          return
        }
      }
      callback({ cancel: false })
    })
  }

  // 切换到指定服务
  async switchToService(serviceId: string, specificUrl: string | null = null): Promise<any> {
    if (this.currentService && this.currentService.id === serviceId) {
      // 已经是当前服务，只需要切换 URL（如果指定了）
      if (specificUrl) {
        return await this.currentService.switchToURL(specificUrl)
      }
      return this.currentService
    }

    // 隐藏所有服务的所有 webview
    this.services.forEach((service: any) => {
      service.hide()
    })

    // 显示新服务
    const service = this.services.get(serviceId) as any
    if (!service) {
      throw new Error(`Service ${serviceId} not found`)
    }

    this.currentService = service
    await service.show(specificUrl)

    return service
  }

  // 获取服务的所有 URL
  getServiceURLs(serviceId: string): string[] {
    const service = this.services.get(serviceId) as any
    return service ? service.getURLs() : []
  }

  // 预加载服务
  preloadService(serviceId: string): void {
    const service = this.services.get(serviceId) as any
    if (service && !service.isLoaded) {
      service.preload()
    }
  }

  // 设置当前 webview 的 bounds
  async setCurrentWebViewBounds(bounds: {
    x: number
    y: number
    width: number
    height: number
  }): Promise<boolean> {
    if (this.currentService && this.currentService.currentWebView) {
      this.currentService.currentWebView.setBounds(bounds)
      return true
    }
    return false
  }

  // 隐藏当前服务
  async hideCurrentService(): Promise<void> {
    if (this.currentService) {
      this.currentService.hide()
    }
  }
}