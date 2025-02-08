import { Outlet } from "react-router";
import Navbar from "../organisms/Navbar";

export default function GlobalLayout() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col">
          <Navbar />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
