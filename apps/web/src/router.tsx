import { createBrowserRouter, Navigate } from "react-router";

import AuthLayout from "./components/auth-layout";
import { ErrorBoundary } from "./components/error-boundary";
import MainLayout from "./components/main-layout";
import Root from "./root";
import {HomePage} from "./routes/_index";
import {AccountPage} from "./routes/account";
import {AdminPage} from "./routes/admin";
import {BridgesPage} from "./routes/bridges";
import {BridgeDetailPage} from "./routes/bridges.$id";
import {GuidesInstallPage} from "./routes/guides.install";
import {GuidesSafetyPage} from "./routes/guides.safety";
import {LoginPage} from "./routes/login";
import {RegisterPage} from "./routes/register";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "bridges", element: <BridgesPage /> },
          { path: "bridges/:id", element: <BridgeDetailPage /> },
          { path: "guides/safety", element: <GuidesSafetyPage /> },
          { path: "guides/install", element: <GuidesInstallPage /> },
          { path: "admin", element: <AdminPage /> },
          { path: "account", element: <AccountPage /> },
          { path: "dashboard", element: <Navigate to="/admin" replace /> },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
        ],
      },
    ],
  },
]);
