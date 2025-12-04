import { ipcMain } from 'electron';
import { AIServiceManager } from '../services/ai-manager';
import { AIService } from '../services/ai';
import { ServiceConfig } from '../services/types';
import { WindowManager } from '../managers/windows';

export class AIIPC {
  private aiServiceManager: AIServiceManager | null = null;
  private windowManager: WindowManager;

  constructor(windowManager: WindowManager) {
    this.windowManager = windowManager;
    this.init();
  }

  public setAIServiceManager(manager: AIServiceManager) {
    this.aiServiceManager = manager;
  }

  private init() {
    ipcMain.handle("get-services", async () => {
      if (!this.aiServiceManager) return [];

      const services: ServiceConfig[] = [];

      this.aiServiceManager.getServices().forEach((service: AIService) => {
        services.push({
          id: service.id,
          name: service.name,
          urls: service.urls,
        });
      });
      return services;
    });

    ipcMain.handle(
      "switch-to-service",
      async (_event, serviceId, specificUrl = null, bounds?: {
        x: number,
        y: number,
        width: number,
        height: number,
      }) => {
        if (this.aiServiceManager) {
          const service = await this.aiServiceManager.switchToService(
            serviceId,
            specificUrl,
            bounds
          );
          return { success: true, service: service.id };
        }
        return { success: false, error: "Service manager not initialized" };
      }
    );

    ipcMain.handle("preload-service", async (_event, serviceId) => {
      if (this.aiServiceManager) {
        this.aiServiceManager.preloadService(serviceId);
        return { success: true };
      }
      return { success: false };
    });

    ipcMain.handle("register-service", async (_event, serviceConfig) => {
      if (this.aiServiceManager) {
        // 动态注册新服务
        const newServiceId = serviceConfig.name.toLowerCase().replace(/\s+/g, "-");
        const config = {
          id: newServiceId,
          name: serviceConfig.name,
          domains: [new URL(serviceConfig.url).hostname],
          urls: [serviceConfig.url],
        };

        this.aiServiceManager.registerService(config);
        return { success: true, serviceId: newServiceId };
      }
      return { success: false };
    });

    ipcMain.handle("destroy-service", async (_event, serviceConfig) => {
      if (this.aiServiceManager) {
        this.aiServiceManager.destroyService(serviceConfig.id);
        return { success: true };
      }
      return { success: false };
    })
  }
}