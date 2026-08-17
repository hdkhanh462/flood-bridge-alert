Dưới đây là mô tả sơ lược theo hướng **Web App Turborepo**, chỉ tập trung vào **Frontend + Backend**, không bao gồm phần thiết bị vật lý/firmware ESP32.

### 1. 👨‍🌾 Người dân

| Tính năng                        | Mô tả sơ lược                                                                                                                                            |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Xem trạng thái cầu tràn** 🔴   | Hiển thị trạng thái hiện tại của từng cầu tràn theo các mức **An toàn / Cảnh báo / Nguy hiểm**, giúp người dân nhanh chóng biết có nên đi qua hay không. |
| **Xem mực nước hiện tại** 🔴     | Hiển thị mực nước mới nhất từ hệ thống cảm biến, kèm thời gian cập nhật gần nhất.                                                                        |
| **Nhận Push Notification** 🔴    | Gửi thông báo đến trình duyệt khi mực nước vượt ngưỡng hoặc trạng thái cầu thay đổi sang mức cảnh báo/nguy hiểm.                                         |
| **Xem biểu đồ mực nước** 🟡      | Biểu diễn biến động mực nước theo thời gian để người dân theo dõi xu hướng tăng/giảm.                                                                    |
| **Xem lịch sử cảnh báo** 🟡      | Cho phép xem các lần cảnh báo trước đây, bao gồm thời gian, cầu và mức độ cảnh báo.                                                                      |
| **Chọn cầu/khu vực quan tâm** 🟢 | Người dân có thể chọn các cầu hoặc khu vực muốn theo dõi để chỉ nhận thông báo liên quan.                                                                |
| **Xem hướng dẫn an toàn** 🟢     | Cung cấp các hướng dẫn xử lý khi cầu tràn ở trạng thái cảnh báo/nguy hiểm và các khuyến cáo an toàn.                                                     |

### 2. ⚙️ Quản trị viên

| Tính năng                                         | Mô tả sơ lược                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Đăng nhập quản trị** 🟡                         | Cung cấp cơ chế xác thực để truy cập khu vực quản trị và bảo vệ các chức năng cấu hình hệ thống.       |
| **Xem danh sách cầu** 🟡                          | Hiển thị danh sách các cầu tràn, thông tin khu vực, trạng thái hiện tại và thời gian cập nhật dữ liệu. |
| **Cấu hình ngưỡng cảnh báo** 🟡                   | Cho phép thiết lập các ngưỡng mực nước tương ứng với **An toàn / Cảnh báo / Nguy hiểm** cho từng cầu.  |
| **Xem trạng thái ESP32/cảm biến** 🟡              | Hiển thị trạng thái kết nối, thời gian gửi dữ liệu cuối cùng và tình trạng hoạt động của cảm biến.     |
| **Xem lịch sử cảnh báo** 🟡                       | Cho phép quản trị viên tra cứu các cảnh báo đã phát sinh, thời gian, mức độ và cầu liên quan.          |
| **Quản lý người dùng/thiết bị nhận thông báo** 🟢 | Quản lý tài khoản người dùng, subscription Web Push và các cầu/khu vực mà người dùng đăng ký theo dõi. |

### 3. 🖥️ Backend

| Tính năng                                  | Mô tả sơ lược                                                                                                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Nhận dữ liệu IoT** 🔴                    | Cung cấp API/endpoint để tiếp nhận dữ liệu mực nước và trạng thái cảm biến từ hệ thống IoT/Blynk.                                                                                          |
| **Kiểm tra dữ liệu** 🔴                    | Validate dữ liệu đầu vào, kiểm tra kiểu dữ liệu, timestamp, giá trị bất thường và xác định dữ liệu có hợp lệ hay không.                                                                    |
| **Xác định An toàn/Cảnh báo/Nguy hiểm** 🔴 | So sánh mực nước với ngưỡng đã cấu hình để xác định trạng thái hiện tại của cầu.                                                                                                           |
| **Lưu lịch sử dữ liệu** 🟡                 | Lưu các bản ghi mực nước theo thời gian để phục vụ biểu đồ, thống kê và truy vấn lịch sử.                                                                                                  |
| **Lưu lịch sử cảnh báo** 🟡                | Lưu lại các lần chuyển trạng thái/cảnh báo để phục vụ tra cứu và thống kê.                                                                                                                 |
| **Gửi Web Push** 🔴                        | Khi phát sinh sự kiện cần thông báo, Backend gửi Push Notification đến các subscription phù hợp.                                                                                           |
| **Chống gửi cảnh báo lặp** 🟡              | Tránh gửi nhiều notification giống nhau liên tục khi hệ thống tiếp tục nhận dữ liệu ở cùng một trạng thái. Có thể chỉ gửi khi trạng thái thay đổi hoặc sau một khoảng thời gian nhất định. |

### 4. 🏗️ Gợi ý cấu trúc Web App trong Turborepo

Có thể tổ chức Monorepo theo hướng:

```text
apps/
├── web/                 # Frontend cho người dân
├── admin/               # Frontend quản trị
└── api/                 # Backend API

packages/
├── ui/                  # Shared UI components
├── types/               # Shared TypeScript types
├── config/              # Shared configuration
├── validation/          # Schema/validation dùng chung
└── database/            # ORM, schema, database utilities
```

**Luồng dữ liệu chính:**

```text
IoT / Blynk
     │
     ▼
 Backend API
     │
     ├── Validate dữ liệu
     ├── Xác định trạng thái cầu
     ├── Lưu dữ liệu
     ├── Lưu lịch sử cảnh báo
     │
     ├──────────────► Web App
     │                  └─ Trạng thái + mực nước + biểu đồ
     │
     └──────────────► Web Push
                        └─ Thông báo người dân
```

Với phạm vi **MVP**, nên ưu tiên hoàn thiện 3 nhóm cốt lõi: **hiển thị trạng thái/mực nước → Backend xử lý trạng thái → Web Push cảnh báo**. Các chức năng biểu đồ, lịch sử, quản trị nâng cao có thể triển khai sau khi luồng dữ liệu realtime đã ổn định.
