import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@flood-bridge-alert/ui/components/alert";
import { TriangleAlert } from "lucide-react";

import { StatusBadge } from "@/features/bridges/components/status-badge";
import { useDocumentTitle } from "@/hooks/use-document-title";

import { SAFETY_GUIDES } from "../constants";

export function SafetyView() {
	useDocumentTitle("Hướng dẫn an toàn");
	return (
		<>
			<h1 className="mb-6 font-semibold text-2xl tracking-tight">
				Hướng dẫn an toàn khi qua cầu tràn
			</h1>
			<div className="grid gap-4">
				{SAFETY_GUIDES.map((guide) => (
					<Alert
						key={guide.status}
						variant={guide.status === "DANGER" ? "destructive" : "default"}
					>
						<TriangleAlert />
						<AlertTitle className="mb-2 flex items-center gap-2">
							Khi cầu ở mức <StatusBadge status={guide.status} />
						</AlertTitle>
						<AlertDescription>
							<ul className="list-disc space-y-1 pl-5">
								{guide.items.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						</AlertDescription>
					</Alert>
				))}
			</div>
		</>
	);
}
