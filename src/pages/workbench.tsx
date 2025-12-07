import { ChatButton } from "@/components/chat-button";
import ChildViewBox from "@/components/child-view-box";
import List from "@/components/list";

export const WorkBench = () => {
  return (
    <div className="layout-workbench w-full h-full">
      {/* 左侧固定宽度300px */}
      <div className="layout-workbench-sidebar bg-gray-100 p-4">
        <ChatButton />
        <List />
      </div>

      {/* 右侧自适应宽度 */}
      <div className="layout-workbench-header bg-gray-300 p-2">
        <div className="h-12 ">Header</div>
      </div>
      <div className="layout-workbench-view-area">
        <ChildViewBox />
      </div>
    </div>
  );
};
