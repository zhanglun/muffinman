import { useCurrentWebview } from "@/atoms/ai-services-atoms";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import styles from "./style.module.css";

export function ChatToc() {
  const [currentWebview] = useCurrentWebview();
  const [messageList, setMessageList] = useState([]);

  const handleOpenChange = async (open: boolean) => {
    if (currentWebview) {
      if (open) {
        (window.ipcRenderer as any).WindowManager.setMainViewToTop();
        const a = await (window.ipcRenderer as any).sendMessageToChildView({
          message: "toggle-toc",
          action: 'get-message-list',
          services: [
            {
              id: currentWebview.id,
              name: currentWebview.name,
              urls: currentWebview.urls,
            },
          ],
        });
        console.log(a);
      } else {
        (window.ipcRenderer as any).WindowManager.setChildViewToTop(
          currentWebview.id
        );
      }
    }
  };

  useEffect(() => {
    // 添加正确的事件监听清理机制
    const handleMessage = (value) => {
      console.log("🚀 ~ ChatToc ~ value:", value);
      const { action, payload } = value;

      if (action === "get-message-list") {
        setMessageList(payload.list);
      }
    };

    (window.ipcRenderer as any).onReceivedMessage(handleMessage);
  }, []);

  const handleMessageClick = (message: any) => {
    console.log("🚀 ~ ChatToc ~ message:", message);
    if (currentWebview) {
      (window.ipcRenderer as any).sendMessageToChildView({
        message: "message card clicked",
        action: 'scroll-to-message',
        services: [{
          id: currentWebview.id,
          name: currentWebview.name,
          urls: currentWebview.urls,
        }],
        payload: {
          ...message,
        }
      })
    }

  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">对话记录</h4>
          </div>
          <div className={styles.messageList}>
            {messageList.map((message, index) => (
              <div className={styles.messageCard} key={index} onClick={() => handleMessageClick(message)}>
                <div className={styles.messageContent}>{index} - {message.text}</div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
