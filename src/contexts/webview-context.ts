import { createContext } from "@lit/context";

export type WebviewInfo = {
  url: string,
  name: string,
}

export type WebviewContextType = {
  current: WebviewInfo;
  setCurrent: (view: WebviewInfo) => void;
  getCurent: () => WebviewInfo;

  showWebview: boolean;
  setShowWebview: (show: boolean) => void;
};

export const WebviewContext = createContext<WebviewContextType>(Symbol('view-context'));
