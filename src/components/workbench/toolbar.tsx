import { useCurrentWebview } from "@/atoms/ai-services-atoms";

export const Toolbar = () => {
  const [currentWebview] = useCurrentWebview();
  const toggleToc = () => {
    console.log("🚀 ~ Toolbar ~ currentWebview:", currentWebview);

    if (currentWebview) {
      (window.ipcRenderer as any).sendToWebview({
        message: "toggle-toc",
        services: [{
          id: currentWebview.id,
          name: currentWebview.name,
          urls: currentWebview.urls,
        }],
      });
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="" onClick={toggleToc}>
          toc
        </div>
      </div>
    </div>
  );
};
