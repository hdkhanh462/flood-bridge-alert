import { createBrowserRouter, Navigate } from "react-router";

import AuthLayout from "./components/auth-layout";
import { ErrorBoundary } from "./components/error-boundary";
import MainLayout from "./components/main-layout";
import Root from "./root";
import Home from "./routes/_index";
import Account from "./routes/account";
import Admin from "./routes/admin";
import Bridges from "./routes/bridges";
import BridgeDetail from "./routes/bridges.$id";
import GuidesInstall from "./routes/guides.install";
import GuidesSafety from "./routes/guides.safety";
import Login from "./routes/login";
import Register from "./routes/register";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: "bridges", element: <Bridges /> },
          { path: "bridges/:id", element: <BridgeDetail /> },
          { path: "guides/safety", element: <GuidesSafety /> },
          { path: "guides/install", element: <GuidesInstall /> },
          { path: "admin", element: <Admin /> },
          { path: "account", element: <Account /> },
          { path: "dashboard", element: <Navigate to="/admin" replace /> },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <Login /> },
          { path: "register", element: <Register /> },
        ],
      },
    ],
  },
]);
