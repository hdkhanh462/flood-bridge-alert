import { Toaster } from "@flood-bridge-alert/ui/components/sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Outlet } from "react-router";

import "./index.css";
import { ThemeProvider } from "./components/theme-provider";
import { persistOptions, queryClient } from "./utils/orpc";

export default function Root() {
	return (
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={persistOptions}
		>
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				disableTransitionOnChange
				storageKey="vite-ui-theme"
			>
				<Outlet />
				<Toaster richColors />
			</ThemeProvider>
			<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
		</PersistQueryClientProvider>
	);
}
