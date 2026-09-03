export type Coords = { lat: number; lng: number };

export type BridgeStatus = "SAFE" | "WARNING" | "DANGER";

export type BridgeMapMarker = {
  id: string;
  name: string;
  status?: string | null;
  location?: string | null;
  latestReading?: {
    level: number;
    recordedAt: string | Date;
  } | null;
  latitude: number;
  longitude: number;
};

export type WaterLevelReading = {
  level: number;
  recordedAt: string | Date;
};

export type WaterLevelThreshold = {
  safeMax: number;
  warningMax: number;
} | null;
