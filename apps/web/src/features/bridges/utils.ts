export function formatReadingTime(recordedAt: string | Date): string {
  const date = new Date(recordedAt);
  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const day = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
  return `${time} ${day}`;
}
