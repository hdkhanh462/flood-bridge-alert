import { createBrowserRouter } from "react-router";

import { ErrorBoundary } from "./components/error-boundary";
import Root from "./root";
import Home from "./routes/_index";
import Admin from "./routes/admin";
import Bridges from "./routes/bridges";
import BridgeDetail from "./routes/bridges.$id";
import Dashboard from "./routes/dashboard";
import SafetyGuide from "./routes/huong-dan-an-toan";
import Login from "./routes/login";
import Todos from "./routes/todos";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Root />,
		errorElement: <ErrorBoundary />,
		children: [
			{ index: true, element: <Home /> },
			{ path: "bridges", element: <Bridges /> },
			{ path: "bridges/:id", element: <BridgeDetail /> },
			{ path: "huong-dan-an-toan", element: <SafetyGuide /> },
			{ path: "dashboard", element: <Dashboard /> },
			{ path: "todos", element: <Todos /> },
			{ path: "admin", element: <Admin /> },
			{ path: "login", element: <Login /> },
		],
	},
]);
