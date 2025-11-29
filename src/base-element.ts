import { customElement } from "lit/decorators.js";
import { LitElement, unsafeCSS } from "lit";
import globalStyles from "./style.css?inline";

@customElement("base-element")
export class BaseElement extends LitElement {
  static styles = [unsafeCSS(globalStyles)];
}

