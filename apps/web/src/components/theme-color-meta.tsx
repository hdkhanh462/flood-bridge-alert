import { useEffect } from "react";

import { useTheme } from "@/components/theme-provider";

const THEME_COLORS = { light: "#ffffff", dark: "#0c0c0c" };

// next-themes chỉ đổi class trên <html>, không tự đồng bộ theme-color của
// PWA (status bar trên Android/Chrome) — nếu không có tag này, status bar
// giữ nguyên màu tĩnh khai báo trong manifest.json dù người dùng đổi theme.
export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"][data-dynamic]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      meta.setAttribute("data-dynamic", "true");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", THEME_COLORS[resolvedTheme]);
  }, [resolvedTheme]);

  return null;
}
