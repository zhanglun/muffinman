import { DOMManagerStrategy } from "./types";

export class DefaultDOMManagerStrategy implements DOMManagerStrategy {
  getUserMessage(): { selector: string | null; text: string }[] {
    const list = Array.from(document.querySelectorAll("div[data-um-id]"));

    return list.map((item) => {
      return {
        selector: item.getAttribute("data-um-id"),
        text: item.textContent,
      };
    });
  }

  getMessageById(selector: string): Element | null {
    const message = document.querySelector(selector);

    return message;
  }
}
