import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@flood-bridge-alert/ui/components/card";

import { useDocumentTitle } from "@/hooks/use-document-title";

const GUIDES = [
	{
		status: "Cảnh báo",
		className: "border-l-4 border-l-yellow-500",
		items: [
			"Theo dõi sát diễn biến mực nước trước khi di chuyển qua cầu.",
			"Ưu tiên tìm đường đi khác nếu có thể, đặc biệt với xe máy, xe đạp.",
			"Không để trẻ em, người già tự đi qua cầu một mình.",
		],
	},
	{
		status: "Nguy hiểm",
		className: "border-l-4 border-l-red-500",
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
		<div className="container mx-auto max-w-3xl px-4 py-6">
			<h1 className="mb-4 font-semibold text-2xl">
				Hướng dẫn an toàn khi qua cầu tràn
			</h1>
			<div className="grid gap-4">
				{GUIDES.map((guide) => (
					<Card key={guide.status} className={guide.className}>
						<CardHeader>
							<CardTitle>Khi cầu ở mức "{guide.status}"</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="list-disc space-y-1 pl-5 text-sm">
								{guide.items.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
