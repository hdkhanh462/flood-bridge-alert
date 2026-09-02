import { Badge } from "@flood-bridge-alert/ui/components/badge";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import type { ComponentProps } from "react";

export function StatCard({
	label,
	variant,
	value,
	isLoading,
}: {
	label: string;
	variant: ComponentProps<typeof Badge>["variant"];
	value: number;
	isLoading: boolean;
}) {
	return (
		<Card>
			<CardHeader>
				<CardDescription>
					<Badge variant={variant}>{label}</Badge>
				</CardDescription>
				<CardTitle className="font-semibold text-3xl">
					{isLoading ? <Skeleton className="h-9 w-12" /> : value}
				</CardTitle>
			</CardHeader>
		</Card>
	);
}
