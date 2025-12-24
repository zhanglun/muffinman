import { DOMManagerStrategy } from "./types";

export class KimiDOMManagerStrategy implements DOMManagerStrategy {
  getUserMessage(): { selector: string | null; text: string }[] {
    const list = Array.from(
      document.querySelectorAll("div.chat-content-item-user .user-content")
    );

    return list.map((item, index) => {
      return {
        selector: `:nth-child(${index + 1} of .chat-content-item-user)`,
        text: item.textContent,
      };
    });
  }

  getMessageById(selector: string): Element | null {
    const message = document.querySelector(selector);

    return message;
  }
}
