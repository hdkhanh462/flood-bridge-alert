import { Badge } from "@flood-bridge-alert/ui/components/badge";
import { Button } from "@flood-bridge-alert/ui/components/button";
import { cn } from "@flood-bridge-alert/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BarChart3, Bell, Users } from "lucide-react";
import type { ComponentType } from "react";
import { Link } from "react-router";

import { useDocumentTitle } from "@/hooks/use-document-title";
import { orpc } from "@/utils/orpc";

import { StatCard } from "./stat-card";

const FEATURES = [
  {
    to: "/bridges",
    icon: BarChart3,
    title: "Giám sát mực nước",
    description: "Cập nhật mực nước tại các cầu tràn theo thời gian thực.",
    card: "bg-sky-50 border-sky-100 dark:bg-sky-950/30 dark:border-sky-900/50",
    iconWrap: "bg-sky-200/70 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  },
  {
    to: "/guides/install",
    icon: Bell,
    title: "Cảnh báo kịp thời",
    description: "Thông báo khi mực nước vượt ngưỡng nguy hiểm.",
    card: "bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50",
    iconWrap:
      "bg-amber-200/70 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  },
  {
    to: "/guides/safety",
    icon: Users,
    title: "Vì cộng đồng an toàn",
    description: "Sáng kiến của học sinh THPT Phủ Thông.",
    card: "bg-green-50 border-green-100 dark:bg-green-950/30 dark:border-green-900/50",
    iconWrap:
      "bg-green-200/70 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  },
] satisfies {
  to: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  card: string;
  iconWrap: string;
}[];

export function HomeView() {
  useDocumentTitle("Cầu An");
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());
  const bridges = useQuery(orpc.bridge.list.queryOptions());

  // Trong lúc cache persist (localStorage) đang được khôi phục lúc khởi động,
  // isFetching bị chặn nên isLoading tính ra false dù data vẫn chưa có gì —
  // nếu không chờ isFetched, số liệu cầu tràn sẽ chớp sai về "0" một khoảnh
  // khắc thay vì hiện dữ liệu cache lần trước. healthCheck thì ngược lại:
  // không persist (xem orpc.ts) nên luôn phản ánh đúng kết nối hiện tại, isLoading
  // gốc là đủ.
  const isBridgesResolving =
    bridges.isLoading || (!bridges.data && !bridges.isFetched);

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
    <>
      {/* Hero: thêm ảnh nền bằng <img className="absolute inset-0 -z-10 h-full w-full object-cover" />
          đặt trước lớp phủ gradient bên dưới. */}
      <section className="relative isolate overflow-hidden bg-linear-to-br from-sky-800 via-sky-700 to-emerald-700">
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/50 via-black/20 to-transparent" />
        <div className="container mx-auto flex min-h-105 flex-col items-start justify-center gap-4 px-4 py-16 text-white sm:min-h-135">
          <Badge
            variant={healthCheck.data ? "success" : "outline"}
            className={cn(
              "border-transparent bg-white dark:bg-white",
              healthCheck.data
                ? "text-green-700 dark:text-green-700"
                : "text-gray-800 dark:text-gray-800",
            )}
          >
            {healthCheck.isLoading
              ? "Đang kiểm tra kết nối..."
              : healthCheck.data
                ? "Hệ thống đang hoạt động"
                : "Không thể kết nối máy chủ"}
          </Badge>
          <h1 className="font-bold text-5xl tracking-tight sm:text-7xl">
            SafeBridge <span className="text-cyan-400">IoT</span>
          </h1>
          <p className="font-semibold text-2xl sm:text-4xl">
            Cảnh báo sớm – Vững bước an toàn
          </p>
          <p className="max-w-xl text-base text-white/90 sm:text-lg">
            Hệ thống giám sát và cảnh báo mực nước tại các cầu tràn ứng dụng
            công nghệ IoT, góp phần bảo vệ tính mạng và kết nối những hành trình
            an toàn cho cộng đồng.
          </p>
          <Button
            size="lg"
            className="mt-2 h-12 w-full bg-blue-600 px-6 text-base text-white hover:bg-blue-700 sm:w-auto"
            nativeButton={false}
            render={<Link to="/bridges" />}
          >
            <BarChart3 className="h-4 w-4" />
            Xem mực nước trực tiếp
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <section className="grid gap-4 py-8 md:grid-cols-3">
          {FEATURES.map(
            ({ to, icon: Icon, title, description, card, iconWrap }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "group flex items-start gap-4 rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md",
                  card,
                )}
              >
                <div
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-full",
                    iconWrap,
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{title}</h2>
                  <p className="text-muted-foreground text-sm">{description}</p>
                </div>
                <span
                  className={cn(
                    "mt-auto flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full",
                    iconWrap,
                  )}
                >
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ),
          )}
        </section>

        <section className="mx-auto max-w-3xl py-12 text-center">
          <h2 className="font-bold text-3xl text-sky-900 dark:text-sky-200">
            Về SafeBridge
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-sky-400" />
          <p className="mt-4 text-muted-foreground">
            SafeBridge là dự án ứng dụng công nghệ IoT để giám sát và cảnh báo
            mực nước tại các cầu tràn, nhằm giảm thiểu rủi ro, hỗ trợ người dân
            và học sinh di chuyển an toàn.
          </p>
        </section>

        <section className="grid gap-4 pb-16 sm:grid-cols-3">
          <StatCard
            label="An toàn"
            variant="success"
            value={counts.SAFE}
            isLoading={isBridgesResolving}
          />
          <StatCard
            label="Cảnh báo"
            variant="warning"
            value={counts.WARNING}
            isLoading={isBridgesResolving}
          />
          <StatCard
            label="Nguy hiểm"
            variant="destructive"
            value={counts.DANGER}
            isLoading={isBridgesResolving}
          />
        </section>
      </div>
    </>
  );
}
