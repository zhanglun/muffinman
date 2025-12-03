import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIServiceManager } from '../../../services/ai-manager';
import { BrowserWindow } from 'electron';
import { AIService } from '../../../services/ai';

// 模拟 electron 模块
vi.mock('electron', () => {
  const BrowserWindowMock = {
    getAllWindows: vi.fn().mockReturnValue([]),
    fromId: vi.fn(),
    fromWebContents: vi.fn(),
  };

  const sessionMock = {
    webRequest: {
      onBeforeRequest: vi.fn(),
    },
  };

  const webContentsMock = {
    executeJavaScript: vi.fn().mockResolvedValue(undefined),
    send: vi.fn(),
  };

  const windowMock = {
    webContents: webContentsMock,
    on: vi.fn(),
    once: vi.fn(),
    destroy: vi.fn(),
    isDestroyed: vi.fn().mockReturnValue(false),
    setBounds: vi.fn(),
    getBounds: vi.fn().mockReturnValue({ x: 0, y: 0, width: 800, height: 600 }),
  };

  return {
    BrowserWindow: BrowserWindowMock,
    Session: {
      fromPartition: vi.fn().mockReturnValue(sessionMock),
    },
    webContents: webContentsMock,
    app: {
      getPath: vi.fn().mockReturnValue('/mock/path'),
    },
  };
});

describe('AIServiceManager', () => {
  let aiServiceManager: AIServiceManager;
  let mockMainWindow: any;

  beforeEach(() => {
    mockMainWindow = new BrowserWindow();
    aiServiceManager = new AIServiceManager(mockMainWindow);
  });

  it('应该正确初始化并注册默认服务', () => {
    const services = aiServiceManager.getServices();
    expect(services.size).toBeGreaterThan(0);
    
    // 检查是否注册了预期的服务
    expect(services.has('kimi')).toBeTruthy();
    expect(services.has('openai')).toBeTruthy();
    expect(services.has('claude')).toBeTruthy();
  });

  it('应该能够根据名称获取服务', () => {
    const kimiService = aiServiceManager.getService('kimi');
    expect(kimiService).not.toBeNull();
    expect(kimiService).toBeInstanceOf(AIService);
  });

  it('当服务不存在时应返回null', () => {
    const nonExistentService = aiServiceManager.getService('non-existent');
    expect(nonExistentService).toBeNull();
  });

  it('应该能够注册新服务', () => {
    const newServiceConfig = {
      id: 'test-service',
      name: 'Test Service',
      urls: ['https://test.example.com'],
    };

    aiServiceManager.registerService(newServiceConfig);
    const service = aiServiceManager.getService('test-service');
    expect(service).not.toBeNull();
  });
});