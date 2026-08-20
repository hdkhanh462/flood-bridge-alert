import { Outlet } from "react-router";

import Header from "./header";

export default function MainLayout() {
	return (
		<div className="grid h-svh grid-rows-[auto_1fr]">
			<Header />
			<Outlet />
		</div>
	);
}
