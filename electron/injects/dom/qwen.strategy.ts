import { DOMManagerStrategy } from "./types";

export class QwenDOMManagerStrategy implements DOMManagerStrategy {
  getUserMessage(): { selector: string | null; text: string }[] {
    const list = Array.from(document.querySelectorAll("div.chat-user-message"));

    return list.map((item, index) => {
      return {
        selector: `:nth-child(${index + 1} of .chat-user-message)`,
        text: item.textContent,
      };
    });
  }

  getMessageById(selector: string): Element | null {
    const message = document.querySelector(selector);

    return message;
  }
}
