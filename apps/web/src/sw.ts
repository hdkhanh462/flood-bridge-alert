/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

// registerType: "prompt" gửi message này khi người dùng bấm "Tải lại" ở toast
// cập nhật — thiếu listener này thì service worker mới không bao giờ
// activate (skipWaiting), nên cơ chế cập nhật không có tác dụng.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

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
