import { createContext } from "@lit/context";

export type ViewContextType = {
  view: string;
  setView: (view: string) => void;
  getView: () => string;
};

export const ViewContext = createContext<ViewContextType>(Symbol('view-context'));
