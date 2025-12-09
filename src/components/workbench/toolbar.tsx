import { useCurrentWebview } from "@/atoms/ai-services-atoms";

export const Toolbar = () => {
  const [currentWebview] = useCurrentWebview();
  const toggleToc = () => {
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="" onClick={toggleToc}>
          show
        </div>
      </div>
    </div>
  );
};
