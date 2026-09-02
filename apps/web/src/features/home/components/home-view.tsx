import { Badge } from "@flood-bridge-alert/ui/components/badge";
import { Button } from "@flood-bridge-alert/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { useDocumentTitle } from "@/hooks/use-document-title";
import { orpc } from "@/utils/orpc";

import { StatCard } from "./stat-card";

export function HomeView() {
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
    <>
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
            render={<Link to="/guides/safety" />}
          >
            Hướng dẫn an toàn
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="An toàn"
          variant="success"
          value={counts.SAFE}
          isLoading={bridges.isLoading}
        />
        <StatCard
          label="Cảnh báo"
          variant="warning"
          value={counts.WARNING}
          isLoading={bridges.isLoading}
        />
        <StatCard
          label="Nguy hiểm"
          variant="destructive"
          value={counts.DANGER}
          isLoading={bridges.isLoading}
        />
      </section>
    </>
  );
}
