import { useCallback, useState } from "react";

import type { Coords } from "../types";

type GeolocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "granted"; coords: Coords }
  | { status: "denied" }
  | { status: "unsupported" };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: "idle" });

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: "unsupported" });
      return;
    }
    setState({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "granted",
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      () => setState({ status: "denied" }),
    );
  }, []);

  return { state, request };
}
