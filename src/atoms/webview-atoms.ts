import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

export type WebviewInfo = {
  url: string,
  name: string,
}

// 定义 atoms
export const currentWebviewAtom = atom<WebviewInfo>({
  url: '',
  name: '',
});

export const showWebviewAtom = atom<boolean>(false);

// React hooks 用于在 React 组件中使用
export const useCurrentWebview = () => useAtom(currentWebviewAtom);
export const useCurrentWebviewValue = () => useAtomValue(currentWebviewAtom);
export const useSetCurrentWebview = () => useSetAtom(currentWebviewAtom);

export const useShowWebview = () => useAtom(showWebviewAtom);
export const useShowWebviewValue = () => useAtomValue(showWebviewAtom);
export const useSetShowWebview = () => useSetAtom(showWebviewAtom);

// 为了兼容原有的类型定义，保留这个类型（虽然不再需要）
export type WebviewContextType = {
  current: WebviewInfo;
  setCurrent: (view: WebviewInfo) => void;
  getCurent: () => WebviewInfo;
  showWebview: boolean;
  setShowWebview: (show: boolean) => void;
};
