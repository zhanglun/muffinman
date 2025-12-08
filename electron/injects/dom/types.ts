export interface DOMManagerStrategy {
  getUserMessage(): {selector: string | null; text: string}[];
}