function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function formatTime(date: Date | string) {
  const d = new Date(date);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatShortDateTime(date: Date | string) {
  const d = new Date(date);
  return `${formatTime(d)} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

export function formatDateTime(date: Date | string) {
  const d = new Date(date);
  return `${formatShortDateTime(d)}/${d.getFullYear()}`;
}
