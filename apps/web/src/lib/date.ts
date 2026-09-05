// Tự ghép chuỗi thủ công thay vì dựa vào Intl.toLocaleString/toLocaleDateString
// cho phần day/month — một số trình duyệt chọn pattern khác (vd. "05-09" thay
// vì "05/09") khi format chỉ day+month (không kèm year) cho locale "vi-VN",
// gây hiển thị không đồng nhất giữa các thiết bị.
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** "21:29" */
export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** "21:29 05/09" */
export function formatShortDateTime(date: string | Date): string {
  const d = new Date(date);
  return `${formatTime(d)} ${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}

/** "21:29 05/09/2026" */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return `${formatShortDateTime(d)}/${d.getFullYear()}`;
}
