import { useCurrentWebview } from "@/atoms/ai-services-atoms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect } from "react";

export function ChatToc() {
  const [currentWebview] = useCurrentWebview();

  const handleOpenChange = async (open: boolean) => {
    if (currentWebview) {
      if (open) {
        (window.ipcRenderer as any).WindowManager.setMainViewToTop();
        const a = await (window.ipcRenderer as any).sendToWebview({
          message: "toggle-toc",
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
    };

    (window.ipcRenderer as any).onReceivedMessage(handleMessage);
  }, []);

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Dimensions</h4>
            <p className="text-muted-foreground text-sm">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Max. width</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight">Max. height</Label>
              <Input
                id="maxHeight"
                defaultValue="none"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}