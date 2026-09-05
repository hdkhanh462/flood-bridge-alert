import { useEffect } from "react";

import { useTheme } from "@/components/theme-provider";

const THEME_COLORS = { light: "#ffffff", dark: "#0c0c0c" };

// next-themes chỉ đổi class trên <html>, không tự đồng bộ theme-color của
// PWA (status bar trên Android/Chrome) — nếu không có tag này, status bar
// giữ nguyên màu tĩnh khai báo trong manifest.json dù người dùng đổi theme.
//
// Chỉ cập nhật MỘT thẻ meta[theme-color] duy nhất (đã có sẵn trong
// index.html, được set giá trị đúng ngay từ đầu bằng inline script chặn
// render) — tuyệt đối không tạo thêm thẻ mới. Có nhiều thẻ theme-color cùng
// lúc từng khiến Android đọc nhầm giữa màu nền status bar và màu icon tương
// phản, gây ra hiện tượng nền đen + icon cũng tối theo (không đọc được).
export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute("content", THEME_COLORS[resolvedTheme]);
  }, [resolvedTheme]);

  return null;
}
