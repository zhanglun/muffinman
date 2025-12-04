import { useEffect, useMemo, useRef } from "react";
import {
  useCurrentWebviewValue,
  useShowWebviewValue,
} from "../atoms/ai-services-atoms";

const throttle = (fn: () => void, delay: number) => {
  let timeoutId: number | null = null;
  let lastExec = 0;

  return () => {
    const now = Date.now();
    const invoke = () => {
      lastExec = Date.now();
      fn();
    };

    if (now - lastExec >= delay) {
      invoke();
    } else {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(invoke, delay - (now - lastExec));
    }
  };
};

const getBounds = (element: HTMLElement | null) => {
  if (!element) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  return {
    x: Math.round(rect.left),
    y: Math.round(rect.top),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
};

export const ChildViewBox = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentWebview = useCurrentWebviewValue();
  const showWebview = useShowWebviewValue();

  const updateBounds = async () => {
    if (!showWebview) {
      return;
    }

    if (!currentWebview) {
      return;
    }

    const bounds = getBounds(containerRef.current);

    if (!bounds) {
      return;
    }

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    try {
      await (window.ipcRenderer as any).invoke(
        "webview:setBounds",
        currentWebview.id,
        bounds
      );
    } catch (error) {
      console.error("Failed to update webview position:", error);
    }
  };

  const throttledUpdate = useMemo(
    () =>
      throttle(() => {
        void updateBounds();
      }, 16),
    [updateBounds]
  );

  useEffect(() => {
    const handleResize = () => throttledUpdate();
    const handleScroll = () => throttledUpdate();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    const resizeObserver =
      window.ResizeObserver && containerRef.current
        ? new ResizeObserver(() => throttledUpdate())
        : null;
    resizeObserver?.observe(containerRef.current as Element);

    const mutationObserver =
      window.MutationObserver && document.body
        ? new MutationObserver(() => throttledUpdate())
        : null;
    mutationObserver?.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [throttledUpdate]);

  useEffect(() => {
    const toggleWebview = async () => {
      if (showWebview && currentWebview) {
        await new Promise((resolve) => setTimeout(resolve, 50));

        const bounds = getBounds(containerRef.current);
        if (!bounds) {
          return;
        }

        try {
          // 使用新的 switchToService API，传入 bounds
          await (window.ipcRenderer as any).switchToService(
            currentWebview.id,
            currentWebview.url,
            bounds
          );

          // 确保 bounds 被设置
          throttledUpdate();
        } catch (error) {
          console.error("Failed to switch to service:", error);
        }
      } else {
        try {
          // 使用新的 hide API
          await (window.ipcRenderer as any).invoke("webview:hide");
        } catch (error) {
          console.error("Failed to hide webview:", error);
        }
      }
    };

    toggleWebview();
  }, [currentWebview, showWebview, throttledUpdate]);

  useEffect(() => {
    if (showWebview) {
      throttledUpdate();
    }
  }, [showWebview, throttledUpdate]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-[#1a1a1a] relative"
    >
      {!showWebview && (
        <div className="flex items-center justify-center w-full h-full text-[#888] text-sm">
          WebContentsView 将显示在这里
        </div>
      )}
    </div>
  );
};

export default ChildViewBox;
