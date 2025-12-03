import { ChatButton } from "@/components/chat-button";
import ChildViewBox from "@/components/child-view-box";

export const WorkBench = () => {
  return (
    <div className="flex w-full h-full">
      {/* 左侧固定宽度300px */}
      <div className="w-[200px] bg-gray-100 p-4">
        <ChatButton />
      </div>

      {/* 右侧自适应宽度 */}
      <div className="flex-1 bg-white p-4">
        <ChildViewBox />
      </div>
    </div>
  );
};