import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@flood-bridge-alert/ui/components/alert";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@flood-bridge-alert/ui/components/tabs";
import { Info, MoreVertical, Share, SquarePlus } from "lucide-react";

import { useDocumentTitle } from "@/hooks/use-document-title";

const ANDROID_STEPS = [
	"Mở trang web này bằng trình duyệt Chrome.",
	'Chạm vào biểu tượng menu (3 chấm dọc) ở góc trên bên phải.',
	'Chọn "Cài đặt ứng dụng" hoặc "Thêm vào Màn hình chính".',
	"Xác nhận để hoàn tất. Biểu tượng ứng dụng sẽ xuất hiện trên màn hình chính.",
];

const IOS_STEPS = [
	"Mở trang web này bằng trình duyệt Safari.",
	'Chạm vào biểu tượng Chia sẻ (hình vuông có mũi tên hướng lên) ở thanh công cụ.',
	'Cuộn xuống và chọn "Thêm vào MH chính" (Add to Home Screen).',
	'Chạm "Thêm" ở góc trên bên phải để hoàn tất.',
];

function InstallSteps({ steps }: { steps: string[] }) {
	return (
		<ol className="list-decimal space-y-2 pl-5">
			{steps.map((step) => (
				<li key={step}>{step}</li>
			))}
		</ol>
	);
}

export default function InstallGuide() {
	useDocumentTitle("Cài đặt");
	return (
		<div className="container mx-auto max-w-3xl px-4 py-6 sm:py-10">
			<h1 className="mb-2 font-semibold text-2xl tracking-tight">
				Cài đặt ứng dụng
			</h1>
			<p className="mb-6 text-muted-foreground text-sm">
				Cài đặt flood-bridge-alert lên màn hình chính để mở nhanh và nhận
				thông báo như một ứng dụng thông thường.
			</p>

			<Tabs defaultValue="android">
				<TabsList className="mb-4">
					<TabsTrigger value="android">Android</TabsTrigger>
					<TabsTrigger value="ios">iOS</TabsTrigger>
				</TabsList>

				<TabsContent value="android">
					<Alert className="mb-4">
						<MoreVertical />
						<AlertTitle>Trên Chrome (Android)</AlertTitle>
						<AlertDescription>
							<InstallSteps steps={ANDROID_STEPS} />
						</AlertDescription>
					</Alert>
				</TabsContent>

				<TabsContent value="ios">
					<Alert className="mb-4">
						<Share />
						<AlertTitle>Trên Safari (iOS)</AlertTitle>
						<AlertDescription>
							<InstallSteps steps={IOS_STEPS} />
						</AlertDescription>
					</Alert>
					<Alert variant="default">
						<Info />
						<AlertTitle>Lưu ý</AlertTitle>
						<AlertDescription>
							Trên iOS, chỉ Safari hỗ trợ cài đặt ứng dụng lên màn hình chính —
							Chrome hoặc trình duyệt khác trên iOS chưa hỗ trợ tính năng này.
						</AlertDescription>
					</Alert>
				</TabsContent>
			</Tabs>

			<div className="mt-6 flex items-start gap-2 text-muted-foreground text-sm">
				<SquarePlus className="mt-0.5 h-4 w-4 shrink-0" />
				<p>
					Nếu không thấy tùy chọn cài đặt, hãy đảm bảo bạn đang dùng phiên bản
					trình duyệt mới nhất và trang đã tải xong hoàn toàn.
				</p>
			</div>
		</div>
	);
}
