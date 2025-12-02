import { MouseEvent, useCallback, useEffect, useState } from "react";
import {
  useSetCurrentWebview,
  useSetShowWebview,
  mapServiceToWebviewInfo,
} from "../atoms/ai-services-atoms";
import { ServiceConfig } from "../../electron/services/types";

const List = () => {
  const setCurrentWebview = useSetCurrentWebview();
  const setShowWebview = useSetShowWebview();
  const [services, setServices] = useState<ServiceConfig[]>([]);

  const handleSelect = useCallback(
    (service: ServiceConfig) => {
      const viewInfo = mapServiceToWebviewInfo(service);
      setCurrentWebview(viewInfo);
      setShowWebview(true);
    },
    [setCurrentWebview, setShowWebview]
  );

  const onItemClick =
    (item: ServiceConfig) => (event: MouseEvent<HTMLLIElement>) => {
      event.preventDefault();
      handleSelect(item);
    };

  useEffect(() => {
    (window.ipcRenderer as any)
      .getServices()
      .then((services: ServiceConfig[]) => {
        setServices(services);
      });
  }, []);

  return (
    <ul className="list bg-base-100 rounded-box shadow-md">
      {services.map((item) => (
        <li
          key={item.name}
          className="list-row cursor-pointer"
          onClick={onItemClick(item)}
        >
          <div>{item.name}</div>
          <div className="text-xs uppercase font-semibold opacity-60">
            {item.urls[0]}
          </div>
        </li>
      ))}
    </ul>
  );
};

export { List };
export default List;
