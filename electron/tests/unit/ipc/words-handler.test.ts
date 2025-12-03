import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WordsIPC } from '../../../ipc/words-handler';
import { ipcMain } from 'electron';
import { AIServiceManager } from '../../../services/ai-manager';
import { AIService } from '../../../services/ai';
import { KimiService } from '../../../services/kimi.service';

// 模拟 electron 模块
vi.mock('electron', () => {
  const ipcMainMock = {
    on: vi.fn(),
    off: vi.fn(),
    handle: vi.fn(),
  };

  const BrowserWindowMock = {
    getAllWindows: vi.fn().mockReturnValue([]),
    fromId: vi.fn(),
    fromWebContents: vi.fn(),
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
  };

  return {
    ipcMain: ipcMainMock,
    BrowserWindow: BrowserWindowMock,
    app: {
      getPath: vi.fn().mockReturnValue('/mock/path'),
    },
  };
});

// 模拟服务类
vi.mock('../../../services/ai-manager', () => {
  return {
    AIServiceManager: vi.fn().mockImplementation(() => {
      return {
        getService: vi.fn(),
        getServices: vi.fn().mockReturnValue(new Map()),
      };
    }),
  };
});

vi.mock('../../../services/ai', () => {
  return {
    AIService: vi.fn().mockImplementation(() => {
      return {
        sendMessage: vi.fn().mockResolvedValue(undefined),
        show: vi.fn().mockResolvedValue(undefined),
        isLoaded: false,
      };
    }),
  };
});

vi.mock('../../../services/kimi.service', () => {
  return {
    KimiService: vi.fn().mockImplementation(() => {
      return {
        sendMessage: vi.fn().mockResolvedValue(undefined),
        show: vi.fn().mockResolvedValue(undefined),
        isLoaded: false,
      };
    }),
  };
});

describe('WordsIPC', () => {
  let wordsIPC: WordsIPC;
  let aiServiceManager: AIServiceManager;
  let mockMainWindow: any;

  beforeEach(() => {
    // 创建实例
    wordsIPC = new WordsIPC();
    mockMainWindow = { webContents: {} }; // 模拟主窗口
    aiServiceManager = new AIServiceManager(mockMainWindow);
    
    // 设置 AI Service Manager
    wordsIPC.setAIServiceManager(aiServiceManager);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确注册 IPC 处理程序', () => {
    expect(ipcMain.on).toHaveBeenCalledWith('sendMyWords', expect.any(Function));
  });

  it('应该能够在设置 AI Service Manager 后处理消息', () => {
    // 模拟已经注册了 kimi 服务
    const kimiService = new KimiService({ id: 'kimi', name: 'Kimi', urls: [] }, mockMainWindow);
    vi.spyOn(aiServiceManager, 'getService').mockImplementation((name: string) => {
      if (name === 'kimi') return kimiService;
      return null;
    });
    
    const sendMessageSpy = vi.spyOn(kimiService, 'sendMessage');
    
    // 模拟触发 IPC 事件
    const ipcCallback = (ipcMain.on as any).mock.calls.find(
      call => call[0] === 'sendMyWords'
    )[1];
    
    const mockEvent = {};
    const testMessage = 'Hello, world!';
    const testData = {
      words: testMessage,
      services: ['kimi']
    };
    ipcCallback(mockEvent, testData);
    
    // 验证是否调用了 kimi 服务的 sendMessage 方法
    expect(sendMessageSpy).toHaveBeenCalledWith(testMessage);
  });

  it('应该在服务未加载时先加载服务再发送消息', async () => {
    const kimiService = new KimiService({ id: 'kimi', name: 'Kimi', urls: [] }, mockMainWindow);
    kimiService.isLoaded = false; // 服务未加载
    
    vi.spyOn(aiServiceManager, 'getService').mockImplementation((name: string) => {
      if (name === 'kimi') return kimiService;
      return null;
    });
    
    const showSpy = vi.spyOn(kimiService, 'show').mockResolvedValue(undefined);
    const sendMessageSpy = vi.spyOn(kimiService, 'sendMessage').mockResolvedValue(undefined);
    
    // 模拟触发 IPC 事件
    const ipcCallback = (ipcMain.on as any).mock.calls.find(
      call => call[0] === 'sendMyWords'
    )[1];
    
    const mockEvent = {};
    const testMessage = 'Hello, world!';
    const testData = {
      words: testMessage,
      services: ['kimi']
    };
    
    await ipcCallback(mockEvent, testData);
    
    // 验证是否调用了 show 和 sendMessage 方法
    expect(showSpy).toHaveBeenCalled();
    expect(sendMessageSpy).toHaveBeenCalledWith(testMessage);
  });

  it('当没有指定服务时应该发送给所有已加载的服务', async () => {
    const kimiService = new KimiService({ id: 'kimi', name: 'Kimi', urls: [] }, mockMainWindow);
    const openAiService = new AIService({ id: 'openai', name: 'OpenAI', urls: [] }, mockMainWindow);
    
    kimiService.isLoaded = true;  // 已加载
    openAiService.isLoaded = false; // 未加载
    
    const servicesMap = new Map([
      ['kimi', kimiService],
      ['openai', openAiService]
    ]);
    
    vi.spyOn(aiServiceManager, 'getServices').mockReturnValue(servicesMap);
    
    const kimiSendMessageSpy = vi.spyOn(kimiService, 'sendMessage').mockResolvedValue(undefined);
    const openAiSendMessageSpy = vi.spyOn(openAiService, 'sendMessage').mockResolvedValue(undefined);
    
    // 模拟触发 IPC 事件
    const ipcCallback = (ipcMain.on as any).mock.calls.find(
      call => call[0] === 'sendMyWords'
    )[1];
    
    const mockEvent = {};
    const testMessage = 'Hello, world!';
    const testData = {
      words: testMessage,
      services: [] // 没有指定服务
    };
    
    await ipcCallback(mockEvent, testData);
    
    // 验证只调用了已加载服务的 sendMessage 方法
    expect(kimiSendMessageSpy).toHaveBeenCalledWith(testMessage);
    expect(openAiSendMessageSpy).not.toHaveBeenCalled();
  });

  it('当AI服务管理器未设置时不应执行任何操作', () => {
    // 创建一个新的 WordsIPC 实例但不设置 AI Service Manager
    const wordsIPCWithoutManager = new WordsIPC();
    
    // 模拟触发 IPC 事件
    const ipcCallback = (ipcMain.on as any).mock.calls.find(
      call => call[0] === 'sendMyWords'
    )[1];
    
    const mockEvent = {};
    const testMessage = 'Hello, world!';
    const testData = {
      words: testMessage,
      services: ['kimi']
    };
    
    // 应该不会抛出异常
    expect(() => {
      ipcCallback(mockEvent, testData);
    }).not.toThrow();
  });

  it('当指定的服务不存在时应跳过该服务', async () => {
    // 模拟服务管理器返回null表示服务不存在
    vi.spyOn(aiServiceManager, 'getService').mockReturnValue(null);
    
    // 模拟触发 IPC 事件
    const ipcCallback = (ipcMain.on as any).mock.calls.find(
      call => call[0] === 'sendMyWords'
    )[1];
    
    const mockEvent = {};
    const testMessage = 'Hello, world!';
    const testData = {
      words: testMessage,
      services: ['nonexistent'] // 不存在的服务
    };
    
    // 应该不会抛出异常
    expect(() => {
      ipcCallback(mockEvent, testData);
    }).not.toThrow();
  });
});