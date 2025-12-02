import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { Main } from "./main";

export const Layout = () => {
  return (
    <div>
      {/* <Header /> */}
      <Sidebar />
      <Main />
    </div>
  )
};