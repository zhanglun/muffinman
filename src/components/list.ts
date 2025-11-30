import { html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BaseElement } from "../base-element";
import { consume } from "@lit/context";
import { WebviewContext } from "../contexts/webview-context";
import type { WebviewContextType } from "../contexts/webview-context";

const items = [
  {
    name: "Qwen",
    url: "https://chat.qwen.ai",
  },
  {
    name: "DeepSeek",
    url: "https://chat.deepseek.com",
  },
  {
    name: "Gemini",
    url: "https://chat.gemini.com",
  },
  {
    name: "Claude",
    url: "https://chat.claude.com",
  },
  {
    name: "Grok",
    url: "https://chat.grok.com",
  },
  {
    name: "Perplexity",
    url: "https://chat.perplexity.com",
  },
];

@customElement("muffin-list")
export class MuffinList extends BaseElement {
  @consume({ context: WebviewContext, subscribe: true })
  @property({ attribute: false})
  public viewContext?: WebviewContextType;

  @state() private items = items;

  private _selectItem(item: any) {
    this.viewContext?.setCurrent(item)
    this.viewContext?.setShowWebview(true);
  }

  protected updated(_changedProperties: PropertyValues): void {
    console.log(this.viewContext?.current);
  }

  render() {
    return html`<div>
      <ul class="list bg-base-100 rounded-box shadow-md">
        ${this.items.map((item) => {
          return html`<li class="list-row" @click=${() => this._selectItem(item)}>
            <div>${item.name}</div>
            <div>${this.viewContext?.current.name}</div>
            <div class="text-xs uppercase font-semibold opacity-60">${item.url}</div>
          </li>`;
        })}
      </ul>
    </div>`;
  }
}
