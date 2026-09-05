import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
} from "@flood-bridge-alert/ui/components/empty";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@flood-bridge-alert/ui/components/table";

import { StatusBadge } from "@/features/bridges/components/status-badge";
import { formatDateTime } from "@/lib/date";

export function AlertsCard({
  alerts,
  isLoading,
}: {
  alerts: {
    id: string;
    status: string;
    createdAt: string | Date;
    bridge: { name: string };
  }[];
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử cảnh báo gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : alerts.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Chưa có cảnh báo nào</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cầu</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{alert.bridge.name}</TableCell>
                      <TableCell>
                        <StatusBadge status={alert.status} />
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDateTime(alert.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 md:hidden">
              {alerts.map((alert) => (
                <div key={alert.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{alert.bridge.name}</span>
                    <StatusBadge status={alert.status} />
                  </div>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {formatDateTime(alert.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
