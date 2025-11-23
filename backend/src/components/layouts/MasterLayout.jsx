import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const MasterLayout = () => {
  return (
    <>
      <main className="w-[100%] h-[100%] flex relative">
        <Sidebar className="h-[100%]" />
        <section className="w-[100%] h-[100%]">
          <Topbar />
          <section>
            <Outlet />
          </section>
        </section>
      </main>
    </>
  );
};

export default MasterLayout;
