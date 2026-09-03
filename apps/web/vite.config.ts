import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      port: Number(env.PORT) || 3000,
    },
    plugins: [
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.ts",
        manifest: {
          name: "Cầu An",
          short_name: "Cầu An",
          description: "Cầu An - PWA Application",
          theme_color: "#0c0c0c",
        },
        pwaAssets: { disabled: false, config: true },
        devOptions: { enabled: true, type: "module" },
      }),
    ],
  };
});
