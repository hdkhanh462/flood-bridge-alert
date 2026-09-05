const LOCALE = "vi-VN";

/** "21:29" */
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "21:29 05/09" */
export function formatShortDateTime(date: string | Date): string {
  const d = new Date(date);
  const time = formatTime(d);
  const day = d.toLocaleDateString(LOCALE, { day: "2-digit", month: "2-digit" });
  return `${time} ${day}`;
}

/** "21:29 05/09/2026" */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString(LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
