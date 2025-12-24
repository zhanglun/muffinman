import { DOMManagerStrategy } from "./types";

export class DeepSeekDOMManagerStrategy implements DOMManagerStrategy {
  getUserMessage(): {selector: string | null; text: string}[] {
    const list = Array.from(document.querySelectorAll('div[data-um-id]'));
    console.log("🚀 ~ DeepSeekDOMManagerStrategy ~ getUserMessage ~ list:", list)

    return list.map(item => {
      return {
        selector: `[data-um-id="${item.getAttribute('data-um-id')}"]`,
        text: item.textContent
      }
    })
  }

  getMessageById(selector: string): Element | null {
    const message = document.querySelector(selector);

    return message;
  }
}
