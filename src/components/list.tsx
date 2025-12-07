import { useEffect, useState } from "react";
import {
  useSetCurrentWebview,
  useSetShowWebview,
  mapServiceToWebviewInfo,
} from "../atoms/ai-services-atoms";
import { ServiceConfig } from "../../electron/services/types";
import { Button } from "./ui/button";

const List = () => {
  const setCurrentWebview = useSetCurrentWebview();
  const setShowWebview = useSetShowWebview();
  const [services, setServices] = useState<ServiceConfig[]>([]);

  const handleSelect = (service: ServiceConfig) => {
    const viewInfo = mapServiceToWebviewInfo(service);
    console.log("🚀 ~ handleSelect ~ viewInfo:", viewInfo)
    setCurrentWebview(viewInfo);
    setShowWebview(true);
  };

  useEffect(() => {
    (window.ipcRenderer as any)
      .getServices()
      .then((services: ServiceConfig[]) => {
        setServices(services);
      });
  }, []);

  return (
    <div className="flex gap-1 flex-wrap">
      {services.map((item) => (
        <Button
          key={item.name}
          className="list-row cursor-pointer"
          onClick={() => handleSelect(item)}
        >
          {item.name}
        </Button>
      ))}
    </div>
  );
};

export { List };
export default List;
