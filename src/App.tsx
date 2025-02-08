import { RouterProvider, createBrowserRouter } from "react-router";

import LandingPage from "./modules/landing/components/pages/LandingPage";
import TresChanchitosPage from "./modules/tres-chanchitos/components/pages/TresChanchitosPage";
import GlobalLayout from "./modules/common/components/templates/GlobalLayout";
import { LANDING_URL, TRES_CHANCHITOS_URL } from "./modules/common/libs/consts";

const router = createBrowserRouter([
  {
    path: "/",
    element: <GlobalLayout />,
    // errorElement: <ErrorPage />,
    children: [
      {
        path: LANDING_URL,
        element: <LandingPage />,
      },
      {
        path: TRES_CHANCHITOS_URL,
        element: <TresChanchitosPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
