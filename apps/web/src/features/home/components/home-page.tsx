import { Badge } from "@flood-bridge-alert/ui/components/badge";
import { Button } from "@flood-bridge-alert/ui/components/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { useDocumentTitle } from "@/hooks/use-document-title";
import { orpc } from "@/utils/orpc";

export function HomePage() {
	useDocumentTitle("flood-bridge-alert");
	const healthCheck = useQuery(orpc.healthCheck.queryOptions());
	const bridges = useQuery(orpc.bridge.list.queryOptions());

	const counts: Record<string, number> = {
		SAFE: 0,
		WARNING: 0,
		DANGER: 0,
		unknown: 0,
	};
	for (const bridge of bridges.data ?? []) {
		const status = bridge.latestReading?.status;
		if (status) {
			counts[status] += 1;
		} else {
			counts.unknown += 1;
		}
	}

	return (
		<div className="container mx-auto max-w-4xl px-4 py-10 sm:py-16">
			<section className="mb-10 flex flex-col items-start gap-4">
				<Badge variant={healthCheck.data ? "success" : "outline"}>
					{healthCheck.isLoading
						? "Đang kiểm tra kết nối..."
						: healthCheck.data
							? "Hệ thống đang hoạt động"
							: "Không thể kết nối máy chủ"}
				</Badge>
				<h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
					Cảnh báo cầu tràn theo thời gian thực
				</h1>
				<p className="max-w-2xl text-lg text-muted-foreground">
					Theo dõi mực nước và trạng thái an toàn của các cầu tràn trong khu
					vực, nhận thông báo ngay khi có thay đổi để chủ động phòng tránh nguy
					hiểm.
				</p>
				<div className="flex flex-wrap gap-3 pt-2">
					<Button nativeButton={false} render={<Link to="/bridges" />}>
						Xem trạng thái cầu tràn
						<ArrowRight className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						nativeButton={false}
						render={<Link to="/huong-dan-an-toan" />}
					>
						Hướng dẫn an toàn
					</Button>
				</div>
			</section>

			<section className="grid gap-4 sm:grid-cols-3">
				<Card>
					<CardHeader>
						<CardDescription>
							<Badge variant="success">An toàn</Badge>
						</CardDescription>
						<CardTitle className="font-semibold text-3xl">
							{bridges.isLoading ? (
								<Skeleton className="h-9 w-12" />
							) : (
								counts.SAFE
							)}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>
							<Badge variant="warning">Cảnh báo</Badge>
						</CardDescription>
						<CardTitle className="font-semibold text-3xl">
							{bridges.isLoading ? (
								<Skeleton className="h-9 w-12" />
							) : (
								counts.WARNING
							)}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>
							<Badge variant="destructive">Nguy hiểm</Badge>
						</CardDescription>
						<CardTitle className="font-semibold text-3xl">
							{bridges.isLoading ? (
								<Skeleton className="h-9 w-12" />
							) : (
								counts.DANGER
							)}
						</CardTitle>
					</CardHeader>
				</Card>
			</section>
		</div>
	);
}
