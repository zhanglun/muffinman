import { css, CSSResult, html } from "lit";
import { customElement } from "lit/decorators.js";
import { BaseElement } from "./base-element";
import './layout';
import { provide } from "@lit/context";
import { WebviewContext } from "./contexts/webview-context";

@customElement("muffin-app")
export class MuffinApp extends BaseElement {

  @provide({ context: WebviewContext })
  webviewContext = {
    current: '',
    showWebview: false,
    setCurrent: (view: string) => {
      this.webviewContext = {
        ...this.webviewContext,
        current: view
      }
    },
    getCurent: () => {
      return this.webviewContext.current
    }
  };

  static styles: CSSResult[] = [css`
    :host {
      background-color: #f0f0f0;
      width: 100vw;
      height: 100vh;
    }
  `];

  render() {
    return html`<div>
      <muffin-layout></muffin-layout>
    </div>`;
  }
}


declare global {
  interface HTMLElementTagNameMap {
    "muffin-app": MuffinApp;
  }
}

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
