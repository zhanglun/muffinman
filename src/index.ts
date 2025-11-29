import { css, CSSResult, html } from "lit";
import { customElement } from "lit/decorators.js";
import { BaseElement } from "./base-element";
import './layout';

@customElement("muffin-app")
export class MuffinApp extends BaseElement {

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
