import { NavLink } from "react-router";
import LandingPage from "../../../landing/components/pages/LandingPage";
import { LANDING_URL, TRES_CHANCHITOS_URL } from "../../libs/consts";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between flex-wrap bg-indigo-500 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <span className="font-semibold text-xl tracking-tight">
          Game Portfolio
        </span>
      </div>
      <div className="block lg:hidden">
        <button className="flex items-center px-3 py-2 border rounded text-indigo-200 border-indigo-400 hover:text-white hover:border-white">
          <svg
            className="fill-current h-3 w-3"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <div className="text-sm lg:flex-grow">
          <NavLink
            to={LANDING_URL}
            className="block mt-4 lg:inline-block lg:mt-0 text-indigo-200 hover:text-white mr-4"
          >
            Inicio
          </NavLink>
          <NavLink
            to={TRES_CHANCHITOS_URL}
            className="block mt-4 lg:inline-block lg:mt-0 text-indigo-200 hover:text-white mr-4"
          >
            Tres Chanchitos
          </NavLink>
        </div>
        {/* <div>
          <a
            href="#"
            className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-indigo-500 hover:bg-white mt-4 lg:mt-0"
          >
            Button
          </a>
        </div> */}
      </div>
    </nav>
  );
}
