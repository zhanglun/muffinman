import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import type { ServiceConfig } from "../../electron/services/types";

export type WebviewInfo = {
  id: string;
  name: string;
  url: string;      // 当前实际使用的 URL（通常是 urls[0]）
  urls: string[];   // 该服务的所有 URL
};

// 定义 atoms
export const currentWebviewAtom = atom<WebviewInfo | null>({
  id: "",
  name: "",
  url: "",
  urls: [],
});

export const showWebviewAtom = atom<boolean>(false);

// React hooks 用于在 React 组件中使用
export const useCurrentWebview = () => useAtom(currentWebviewAtom);
export const useCurrentWebviewValue = () => useAtomValue(currentWebviewAtom);
export const useSetCurrentWebview = () => useSetAtom(currentWebviewAtom);

export const useShowWebview = () => useAtom(showWebviewAtom);
export const useShowWebviewValue = () => useAtomValue(showWebviewAtom);
export const useSetShowWebview = () => useSetAtom(showWebviewAtom);

// 为了方便从 ServiceConfig 映射到 WebviewInfo
export const mapServiceToWebviewInfo = (service: ServiceConfig): WebviewInfo => {
  const primaryUrl = service.urls[0] ?? "";
  return {
    id: service.id,
    name: service.name,
    url: primaryUrl,
    urls: service.urls,
  };
};

// 旧类型仍然保留（如果外部还在引用）
export type WebviewContextType = {
  current: WebviewInfo;
  setCurrent: (view: WebviewInfo) => void;
  getCurent: () => WebviewInfo;
  showWebview: boolean;
  setShowWebview: (show: boolean) => void;
};
