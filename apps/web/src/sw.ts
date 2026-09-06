/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import { createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare const self: ServiceWorkerGlobalScope;

// registerType: "autoUpdate" nên service worker mới phải tự activate ngay
// (không chờ message SKIP_WAITING từ người dùng).
self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

// Fallback mọi navigation request về index.html đã precache khi offline —
// nếu không có route này, mất mạng sẽ hiện màn hình lỗi mặc định của trình
// duyệt thay vì app shell (khiến dữ liệu đã cache trong TanStack Query
// persist ở localStorage cũng không có cơ hội render ra).
registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json() as { title: string; body: string };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/logo.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/bridges"));
});
