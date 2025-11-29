import "./style.css";
import "./child-view-box";
import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("muffin-main")
export class MuffinMain extends LitElement {
  private showWebview = false;

  async toggleWebview() {
    this.showWebview = !this.showWebview;
    this.requestUpdate();

    try {
      // 等待 DOM 更新
      await this.updateComplete;

      if (this.showWebview) {
        // 更新 child-view-box 的 showView 状态
        const childViewBox = this.shadowRoot?.querySelector(
          "child-view-box"
        ) as any;
        if (childViewBox) {
          childViewBox.showView = true;
          // 等待 child-view-box 更新并获取位置
          await new Promise((resolve) => setTimeout(resolve, 50));
          const rect = childViewBox.getBoundingClientRect();
          const bounds = {
            x: Math.round(rect.left),
            y: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
          // 创建 WebContentsView 并传入位置信息
          await window.ipcRenderer.invoke("webview:create", bounds);
        }
      } else {
        // 更新 child-view-box 的 showView 状态
        const childViewBox = this.shadowRoot?.querySelector(
          "child-view-box"
        ) as any;
        if (childViewBox) {
          childViewBox.showView = false;
        }
        // 销毁 WebContentsView
        await window.ipcRenderer.invoke("webview:destroy");
      }
    } catch (error) {
      console.error("Failed to toggle webview:", error);
      // 如果出错，恢复状态
      this.showWebview = !this.showWebview;
      this.requestUpdate();
    }
  }

  async connectedCallback() {
    super.connectedCallback();
    // 检查 WebContentsView 是否已存在
    try {
      const result = await window.ipcRenderer.invoke("webview:exists");
      this.showWebview = result.exists;
      this.requestUpdate();
    } catch (error) {
      console.error("Failed to check webview status:", error);
    }
  }

  render() {
    return html`
      <div>
        <div class="card">
          <button id="counter" type="button"></button>
          <button
            @click=${this.toggleWebview}
            type="button"
            style="margin-left: 10px;"
          >
            ${this.showWebview ? "隐藏" : "显示"} DeepSeek WebView
          </button>
        </div>
        <child-view-box></child-view-box>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "muffin-main": MuffinMain;
  }
}
