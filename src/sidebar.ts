import { css, CSSResult, html } from "lit";
import { customElement } from "lit/decorators.js";
import { BaseElement } from "./base-element";
import "./components/list";

@customElement("muffin-sidebar")
export class MuffinSidebar extends BaseElement {
  static styles: CSSResult[] = [css`
    :host {
      width: 300px;
      height: 100%;
      background-color: #f0f0f0;
    }
  `];

  render() {
    return html`<div>
      <muffin-list></muffin-list>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "muffin-sidebar": MuffinSidebar;
  }
}
