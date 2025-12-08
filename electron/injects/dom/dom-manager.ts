import { DOMManagerStrategy } from "./types";
import { KimiDOMManagerStrategy } from "./kimi.strategy";
import { DeepSeekDOMManagerStrategy } from "./deepseek.strategy";
import { QwenDOMManagerStrategy } from "./qwen.strategy";
import { DefaultDOMManagerStrategy } from "./default.strategy";

export class DOMManager {
  // 一个辅助方法，根据当前环境动态判断 webview 类型
  private getCurrentWebViewType(): string {
    // 这里根据你的实际情况获取类型，例如：
    // 1. 从 window 对象上预先设置的属性获取 (需要主进程配合)
    // return (window as any).__WEBVIEW_TYPE__;
    // 2. 从 URL 解析
    const url = window.location.href;
    if (url.includes("kimi")) return "kimi";
    if (url.includes("deepseek")) return "deepseek";
    // 3. 从其他标识符解析，比如页面标题、特定 DOM 元素等
    // ...
    return "default";
  }

  // 根据类型获取对应策略实例的辅助方法
  private getStrategyForType(type: string): DOMManagerStrategy {
    switch (type.toLowerCase()) {
      case "kimi":
        return new KimiDOMManagerStrategy();
      case "deepseek":
        return new DeepSeekDOMManagerStrategy();
      case "qwen":
        return new QwenDOMManagerStrategy();
      default:
        return new DefaultDOMManagerStrategy();
    }
  }

  // 统一的对外 API
  getUserMessageDOM(): void {
    const strategy = this.getStrategy();
    const elements = strategy.getUserMessage();

    return elements;
  }

  getStrategy(): DOMManagerStrategy {
    const currentType = this.getCurrentWebViewType();

    return this.getStrategyForType(currentType);
  }
}
