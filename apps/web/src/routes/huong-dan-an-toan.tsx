import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@flood-bridge-alert/ui/components/alert";
import { TriangleAlert } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { useDocumentTitle } from "@/hooks/use-document-title";

const GUIDES = [
	{
		status: "WARNING",
		items: [
			"Theo dõi sát diễn biến mực nước trước khi di chuyển qua cầu.",
			"Ưu tiên tìm đường đi khác nếu có thể, đặc biệt với xe máy, xe đạp.",
			"Không để trẻ em, người già tự đi qua cầu một mình.",
		],
	},
	{
		status: "DANGER",
		items: [
			"Tuyệt đối không di chuyển qua cầu, kể cả khi nhìn nước có vẻ chưa cao.",
			"Nước chảy xiết có thể cuốn trôi cả người và phương tiện dù mực nước không sâu.",
			"Thông báo cho người thân, hàng xóm về tình trạng cầu nếu có thể.",
			"Liên hệ chính quyền địa phương hoặc lực lượng cứu hộ nếu cần hỗ trợ khẩn cấp.",
		],
	},
];

export default function SafetyGuide() {
	useDocumentTitle("Hướng dẫn an toàn");
	return (
		<div className="container mx-auto max-w-3xl px-4 py-6 sm:py-10">
			<h1 className="mb-6 font-semibold text-2xl tracking-tight">
				Hướng dẫn an toàn khi qua cầu tràn
			</h1>
			<div className="grid gap-4">
				{GUIDES.map((guide) => (
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
		</div>
	);
}
