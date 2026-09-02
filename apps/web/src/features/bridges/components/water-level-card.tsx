import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";

import type { WaterLevelReading, WaterLevelThreshold } from "../types";
import { WaterLevelChart } from "./water-level-chart";

export function WaterLevelCard({
	readings,
	threshold,
	isLoading,
}: {
	readings: WaterLevelReading[];
	threshold: WaterLevelThreshold;
	isLoading: boolean;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Mực nước theo thời gian</CardTitle>
				<CardDescription>
					Biểu đồ mực nước gần đây và các ngưỡng cảnh báo
				</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Skeleton className="h-60 w-full" />
				) : (
					<WaterLevelChart readings={readings} threshold={threshold} />
				)}
			</CardContent>
		</Card>
	);
}
