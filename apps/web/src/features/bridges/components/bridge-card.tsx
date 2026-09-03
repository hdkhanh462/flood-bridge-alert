import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import { Link } from "react-router";

import { StatusBadge } from "./status-badge";
import { formatReadingTime } from "../utils";

export function BridgeCard({
  bridge,
}: {
  bridge: {
    id: string;
    name: string;
    location: string | null;
    latestReading: {
      level: number;
      status: string;
      recordedAt: string | Date;
    } | null;
  };
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>
            <Link to={`/bridges/${bridge.id}`} className="hover:underline">
              {bridge.name}
            </Link>
          </CardTitle>
          {bridge.location ? (
            <CardDescription>{bridge.location}</CardDescription>
          ) : null}
        </div>
        <StatusBadge status={bridge.latestReading?.status} />
      </CardHeader>
      <CardContent>
        {bridge.latestReading ? (
          <p className="text-muted-foreground text-sm">
            Mực nước:{" "}
            <span className="font-medium text-foreground">
              {bridge.latestReading.level} m
            </span>{" "}
            · {formatReadingTime(bridge.latestReading.recordedAt)}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">
            Chưa nhận được dữ liệu mực nước.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
