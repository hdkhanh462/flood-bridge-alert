import { Toaster } from "@flood-bridge-alert/ui/components/sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Outlet } from "react-router";

import "./index.css";
import { PwaUpdateToast } from "./components/pwa-update-toast";
import { ThemeColorMeta } from "./components/theme-color-meta";
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
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <ThemeColorMeta />
        <Outlet />
        <Toaster richColors />
        <PwaUpdateToast />
      </ThemeProvider>
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </PersistQueryClientProvider>
  );
}
