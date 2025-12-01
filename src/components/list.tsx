import { MouseEvent, useCallback } from "react";
import {
  useSetCurrentWebview,
  useSetShowWebview,
  WebviewInfo,
} from "../atoms/webview-atoms";

const items: WebviewInfo[] = [
  {
    name: "Kimi",
    url: "https://www.kimi.com/",
  },
  {
    name: "Qwen",
    url: "https://chat.qwen.ai",
  },
  {
    name: "DeepSeek",
    url: "https://chat.deepseek.com",
  },
  {
    name: "Doubao",
    url: "https://www.doubao.com/chat/",
  },
  // {
  //   name: "Gemini",
  //   url: "https://chat.gemini.com",
  // },
  // {
  //   name: "Claude",
  //   url: "https://claude.ai/new",
  // },
  // {
  //   name: "Grok",
  //   url: "https://chat.grok.com",
  // },
  // {
  //   name: "Perplexity",
  //   url: "https://chat.perplexity.com",
  // },
];

const List = () => {
  const setCurrentWebview = useSetCurrentWebview();
  const setShowWebview = useSetShowWebview();

  const handleSelect = useCallback(
    (item: WebviewInfo) => {
      setCurrentWebview(item);
      setShowWebview(true);
    },
    [setCurrentWebview, setShowWebview]
  );

  const onItemClick = (item: WebviewInfo) => (event: MouseEvent<HTMLLIElement>) => {
    event.preventDefault();
    handleSelect(item);
  };

  return (
      <ul className="list bg-base-100 rounded-box shadow-md">
        {items.map((item) => (
          <li
            key={item.name}
            className="list-row cursor-pointer"
            onClick={onItemClick(item)}
          >
            <div>{item.name}</div>
            <div className="text-xs uppercase font-semibold opacity-60">
              {item.url}
            </div>
          </li>
        ))}
      </ul>
  );
};

export { List };
export default List;
