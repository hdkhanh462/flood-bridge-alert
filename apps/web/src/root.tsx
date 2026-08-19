import { Toaster } from "@flood-bridge-alert/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet } from "react-router";

import "./index.css";
import Header from "./components/header";
import { ThemeProvider } from "./components/theme-provider";
import { queryClient } from "./utils/orpc";

export default function Root() {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				disableTransitionOnChange
				storageKey="vite-ui-theme"
			>
				<div className="grid h-svh grid-rows-[auto_1fr]">
					<Header />
					<Outlet />
				</div>
				<Toaster richColors />
			</ThemeProvider>
			<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
		</QueryClientProvider>
	);
}
