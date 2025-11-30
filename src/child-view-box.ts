import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { WebviewContext } from "./contexts/webview-context";
import type { WebviewContextType } from "./contexts/webview-context";
import { consume } from "@lit/context";

@customElement("child-view-box")
export class ChildViewBox extends LitElement {
  @consume({ context: WebviewContext, subscribe: true })
  @property({ attribute: false })
  public viewContext?: WebviewContextType;

  connectedCallback() {
    super.connectedCallback();
    // 监听窗口大小变化
    this.handleResize = this.updatePositionThrottled;
    window.addEventListener("resize", this.handleResize);

    // 监听滚动事件（包括窗口滚动和父元素滚动）
    this.handleScroll = this.updatePositionThrottled;
    window.addEventListener("scroll", this.handleScroll, true);

    // 使用 ResizeObserver 监听自身大小变化
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updatePositionThrottled();
      });
      this.resizeObserver.observe(this);
    }

    // 使用 MutationObserver 监听父元素变化
    if (window.MutationObserver) {
      this.mutationObserver = new MutationObserver(() => {
        this.updatePosition();
      });
      // 监听整个文档的变化
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.handleResize) {
      window.removeEventListener("resize", this.handleResize);
    }
    if (this.handleScroll) {
      window.removeEventListener("scroll", this.handleScroll, true);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private handleResize: (() => void) | null = null;
  private handleScroll: (() => void) | null = null;

  private updatePositionThrottled = this.throttle(() => {
    this.updatePosition();
  }, 16); // 约 60fps

  private throttle(func: () => void, delay: number) {
    let timeoutId: number | null = null;
    let lastExecTime = 0;
    return () => {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func();
        lastExecTime = currentTime;
      } else {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(() => {
          func();
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  private async updatePosition() {
    if (!this.viewContext?.showWebview) return;

    // 等待下一帧，确保 DOM 已更新
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const rect = this.getBoundingClientRect();
    const position = {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };

    // 发送位置信息到主进程
    try {
      await window.ipcRenderer.invoke("webview:setBounds", position);
    } catch (error) {
      console.error("Failed to update webview position:", error);
    }
  }

  updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    if (changedProperties.has("viewContext")) {
      // 更新组件的内容
      // 当 showView 状态改变时，更新位置
      setTimeout(() => {
        this.updatePosition();
      }, 0);
    }
  }

  render() {
    return html`
      <div class="placeholder ${this.viewContext?.showWebview ? "hidden" : ""}">
        WebContentsView 将显示在这里
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 600px;
      border-radius: 8px;
      overflow: hidden;
      background: #1a1a1a;
      position: relative;
      margin-top: 20px;
    }

    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #888;
      font-size: 14px;
    }

    .placeholder.hidden {
      display: none;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "child-view-box": ChildViewBox;
  }
}
