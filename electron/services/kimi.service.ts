import { BrowserWindow } from "electron";
import { ServiceConfig } from "./types";
import { KimiAdapter } from "../adapters/kimi.adapter";
import { AIService } from "./ai";

export class KimiService extends AIService {
  public kimiAdapter: KimiAdapter | null = null;

  constructor(config: ServiceConfig, mainWindow: BrowserWindow) {
    super(config, mainWindow);
  }

  async show(specificUrl?: string | null): Promise<void> {
    await super.show(specificUrl);

    // 初始化Kimi适配器，确保传递正确的 webContents 对象
    if (this.currentWebView && !this.kimiAdapter) {
      this.kimiAdapter = new KimiAdapter(this.currentWebView);
    }
  }

  async sendMessage(message: string): Promise<void> {
    if (this.kimiAdapter) {
      await this.kimiAdapter.sendMessage(message);
    } else {
      throw new Error("Kimi adapter is not initialized");
    }
  }

  async getLatestReply(): Promise<string> {
    if (this.kimiAdapter) {
      return await this.kimiAdapter.getLatestReply();
    } else {
      throw new Error("Kimi adapter is not initialized");
    }
  }
}