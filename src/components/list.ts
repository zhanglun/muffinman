import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { BaseElement } from "../base-element";

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
  @state() private items = items;

  private _selectItem(item: any) {
    console.log(item);
  }

  render() {
    return html`<div>
      <ul class="list bg-base-100 rounded-box shadow-md">
        ${this.items.map((item) => {
          return html`<li class="list-row" @click=${() => this._selectItem(item)}>
            <div>${item.name}</div>
            <div class="text-xs uppercase font-semibold opacity-60">${item.url}</div>
          </li>`;
        })}
      </ul>
    </div>`;
  }
}
