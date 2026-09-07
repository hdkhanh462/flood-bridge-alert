import { useCallback, useState } from "react";

import type { Coords } from "../types";

type GeolocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "granted"; coords: Coords }
  | { status: "denied" }
  | { status: "unsupported" };

const CACHE_KEY = "bridges:last-known-location";
const CACHE_TTL_MS = 5 * 60 * 1000;

function readCache(): Coords | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { coords, timestamp } = JSON.parse(raw) as {
      coords: Coords;
      timestamp: number;
    };
    if (Date.now() - timestamp > CACHE_TTL_MS) return null;
    return coords;
  } catch {
    return null;
  }
}

function writeCache(coords: Coords) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ coords, timestamp: Date.now() }),
    );
  } catch {
    // sessionStorage có thể bị chặn (chế độ ẩn danh) — bỏ qua, chỉ mất phần cache.
  }
}

// Cache vị trí trong sessionStorage để mỗi lần vào lại trang cầu tràn trong
// cùng phiên (SPA điều hướng, hoặc reload) không phải xin quyền/định vị lại
// từ đầu — chỉ khi cache hết hạn (> 5 phút) mới gọi geolocation API thật.
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(() => {
    const cached = readCache();
    return cached ? { status: "granted", coords: cached } : { status: "idle" };
  });

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: "unsupported" });
      return;
    }
    setState({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        writeCache(coords);
        setState({ status: "granted", coords });
      },
      () => setState({ status: "denied" }),
    );
  }, []);

  return { state, request };
}
