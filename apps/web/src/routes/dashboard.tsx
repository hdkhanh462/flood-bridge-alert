import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useDocumentTitle } from "@/hooks/use-document-title";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export default function Dashboard() {
	useDocumentTitle("Dashboard");
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();

	const privateData = useQuery(orpc.privateData.queryOptions());

	useEffect(() => {
		if (!session && !isPending) {
			navigate("/login");
		}
	}, [session, isPending, navigate]);

	if (isPending) {
		return (
			<div className="container mx-auto max-w-2xl px-4 py-10">
				<Skeleton className="h-32 w-full" />
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-2xl px-4 py-6 sm:py-10">
			<Card>
				<CardHeader>
					<CardTitle>Xin chào, {session?.user.name}</CardTitle>
					<CardDescription>{session?.user.email}</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						Trạng thái API:{" "}
						<span className="text-foreground">{privateData.data?.message}</span>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
