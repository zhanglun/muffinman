import { Textarea } from "@/components/ui/textarea"

export const Home = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-1/2">
        <h1 className="text-2xl font-bold">Do you konw the muffin man ?</h1>
        <Textarea placeholder="hhhh" className="w-full"/>
      </div>
    </div>
  );
};