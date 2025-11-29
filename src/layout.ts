import { css, CSSResult, html } from "lit";
import { customElement } from "lit/decorators.js";

import { BaseElement } from "./base-element";
import "./main";
import "./sidebar";

@customElement("muffin-layout")
export class MuffinLayout extends BaseElement {
  static styles: CSSResult[] = [
    css`
      :host {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;
      }
    `,
  ];

  render() {
    return html`
      <muffin-sidebar></muffin-sidebar>
      <muffin-main></muffin-main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "muffin-layout": MuffinLayout;
  }
}
