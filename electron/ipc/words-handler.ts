import { ipcMain } from 'electron';
import { AIServiceManager } from '../services/ai-manager';
import { WindowManager } from '../managers/windows';
import { MessageDto } from '../services/types';


export class WordsIPC {
  private aiServiceManager: AIServiceManager | null = null;
  private windowManager: WindowManager;

  constructor(windowManager: WindowManager) {
    this.windowManager = windowManager;
    this.registerHandlers();
  }

  public setAIServiceManager(manager: AIServiceManager) {
    this.aiServiceManager = manager;
  }

  private registerHandlers() {
    ipcMain.on("sendMyWords", async (_event, dto: MessageDto) => {
      console.log("Received words from renderer:", dto);

      // 处理接收到的文字，转发给指定的 AI 服务
      if (this.aiServiceManager && dto.services && dto.services.length > 0) {
        for (const s of dto.services) {
          const service = this.aiServiceManager!.getService(s.id);

          if (service) {
            // 确保服务已显示(初始化)后再发送消息
            if (!service.isLoaded) {
              await service.show();
            }

            await service.sendMessage(dto);
          }
        }
      } else if (this.aiServiceManager) {
        // 如果没有指定服务，默认发送给所有已加载的服务
        const services = this.aiServiceManager.getServices();
        for (const [_, service] of services) {
          if (service.isLoaded) {
            await service.sendMessage(dto);
          }
        }
      }
    });
  }
}