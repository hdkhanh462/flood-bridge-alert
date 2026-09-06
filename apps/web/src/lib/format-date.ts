export function formatDateTime(date: Date | string) {
  const d = new Date(date);
  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const day = d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${time} ${day}`;
}

export function formatShortDateTime(date: Date | string) {
  const d = new Date(date);
  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const day = d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
  return `${time} ${day}`;
}

export function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
