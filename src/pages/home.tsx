import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export const Home = () => {
  const [inputValue, setInputValue] = useState("");

  const sendMyWords = () => {
    console.log("🚀 ~ sendMyWords ~ inputValue:", inputValue);
    if (inputValue.trim()) {
      (window as any).ipcRenderer?.sendMyWords({
        message: inputValue,
        services: [
          {
            id: "kimi",
          }
        ], // 可以指定要发送到哪些服务
      });
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-1/2">
        <h1 className="text-2xl font-bold">Do you konw the muffin man ?</h1>
        <Textarea
          placeholder="hhhh"
          className="w-full"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <div>
          <Button onClick={sendMyWords}>Submit</Button>
        </div>
      </div>
    </div>
  );
};
