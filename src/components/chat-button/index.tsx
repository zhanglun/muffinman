import {
  mapServiceToWebviewInfo,
  useSetCurrentWebview,
  useSetShowWebview,
} from "@/atoms/ai-services-atoms";

export const ChatButton = () => {
  const service = {
    name: "kimi",
    id: "kimi",
    urls: ["https://kimi.ai/"],
  };

  const setCurrentWebview = useSetCurrentWebview();
  const setShowWebview = useSetShowWebview();
  const openChatWindow = () => {
    const viewInfo = mapServiceToWebviewInfo(service);
    setCurrentWebview(viewInfo);
    setShowWebview(true);
  };

  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={openChatWindow}
    >
      Start Chat
    </button>
  );
};
