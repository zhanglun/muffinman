import { ChatToc } from "./chat-toc"
import { Toolbar } from "./toolbar"

export const WorkbenchHeader = () => {
  return <div className="flex gap-2">
    <ChatToc />
    <Toolbar />
  </div>
}