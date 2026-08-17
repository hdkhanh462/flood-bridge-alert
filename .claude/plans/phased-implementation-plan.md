# Phased Implementation Plan — Flood Bridge Alert

Dựa trên `first-plan.md`, đã đối chiếu với stack thực tế của template:
Express 5 + oRPC (`apps/server`, `packages/api`), Prisma + Postgres (`packages/db`),
better-auth chưa có role (`packages/auth`), React Router 8 framework mode + vite-plugin-pwa
đã setup sẵn (`apps/web`), env qua `@t3-oss/env-core` (`packages/env`).

## Ghi chú kiến trúc

- Không tạo `apps/api` riêng — dùng `apps/server` (Express host) + `packages/api` (oRPC routers) có sẵn.
- Admin nên là route-group `/admin/*` trong cùng app `web`, bảo vệ bằng role/session, thay vì app thứ 3.
- Webhook nhận dữ liệu Blynk là route Express thuần (`POST /webhooks/blynk`), tách khỏi `/rpc` của oRPC,
  vì đây là endpoint gọi từ bên ngoài (Blynk/ESP32) — giúp mock/test dễ bằng curl/Postman.
- `better-auth` cần thêm field `role` vào model `User` hoặc dùng admin plugin để phân quyền admin.

## Phase 1 — Data model nền tảng

Thiết kế & migrate Prisma schema: `Bridge` (cầu/khu vực), `Threshold` (ngưỡng an toàn/cảnh báo/nguy hiểm
theo cầu), `WaterLevelReading` (lịch sử mực nước), `AlertHistory` (lịch sử cảnh báo), thêm `role` vào `User`.

✅ Verify: `db:push` chạy sạch, Prisma Studio thấy đủ bảng.

## Phase 2 — Webhook/ingestion stub (làm sớm để mock test)

Tạo `POST /webhooks/blynk` trong `apps/server` (Express route, không qua oRPC), validate payload bằng zod,
lưu `WaterLevelReading` thô. Chưa cần tích hợp Blynk thật — chỉ cần route nhận + validate + lưu, test bằng
curl/Postman/mock script.

✅ Verify: gửi mock POST → thấy record trong DB.

## Phase 3 — Logic xác định trạng thái + chống lặp cảnh báo

Service so sánh reading với `Threshold` → set trạng thái An toàn/Cảnh báo/Nguy hiểm, chỉ ghi `AlertHistory`
khi trạng thái đổi hoặc quá khoảng thời gian nhất định (debounce). Gắn logic này ngay sau khi webhook lưu reading.

✅ Verify: unit test cho hàm xác định trạng thái + test không bắn cảnh báo lặp khi trạng thái không đổi.

## Phase 4 — oRPC routers công khai cho Frontend

Thêm router `station`/`bridge` (list, current status, current water level) trong `packages/api`.

✅ Verify: gọi qua oRPC client từ web, trả đúng dữ liệu.

## Phase 5 — Web App người dân (MVP 🔴)

Route hiển thị trạng thái các cầu + mực nước hiện tại (React Router route mới, dùng React Query/oRPC có sẵn).

✅ Verify: chạy `dev:web`, xem UI hiển thị đúng dữ liệu mock.

## Phase 6 — Web Push (MVP 🔴)

Thêm VAPID keys vào `packages/env`, bảng `PushSubscription`, API subscribe/unsubscribe, service worker
(mở rộng từ vite-plugin-pwa có sẵn) để nhận push, job gửi push khi `AlertHistory` mới được tạo (nối tiếp Phase 3).

✅ Verify: subscribe trên trình duyệt, trigger mock alert → nhận được notification thật.

## Phase 7 — Trang quản trị (🟡)

Thêm role/admin guard, route `/admin`: đăng nhập, danh sách cầu, cấu hình ngưỡng, trạng thái cảm biến
(last-seen từ Phase 2), lịch sử cảnh báo.

✅ Verify: chỉ user có role admin truy cập được, CRUD ngưỡng ảnh hưởng đúng đến Phase 3.

## Phase 8 — Nâng cao (🟡/🟢)

Biểu đồ mực nước theo thời gian, lịch sử cảnh báo cho người dân, chọn cầu/khu vực quan tâm (filter
subscription theo bridge), hướng dẫn an toàn (nội dung tĩnh), quản lý user/thiết bị cho admin.
