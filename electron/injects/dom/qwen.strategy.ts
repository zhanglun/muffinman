import { DOMManagerStrategy } from "./types";

export class QwenDOMManagerStrategy implements DOMManagerStrategy {
  getUserMessage(): {selector: string | null; text: string}[] {
    const list = Array.from(document.querySelectorAll('div.chat-user-message'));

    return list.map(item => {
      return {
        selector: item.getAttribute('data-um-id'),
        text: item.textContent
      }
    })
  }
}
