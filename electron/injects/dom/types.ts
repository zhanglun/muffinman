export interface DOMManagerStrategy {
  getUserMessage(): {selector: string | null; text: string}[];
  getMessageById(selector: string): Element | null;
}