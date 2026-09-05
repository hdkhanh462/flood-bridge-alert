import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@flood-bridge-alert/ui/components/table";

import { formatDateTime } from "@/lib/date";

import { StatusBadge } from "./status-badge";

export function AlertHistoryCard({
  alerts,
  isLoading,
}: {
  alerts: { id: string; status: string; createdAt: string | Date }[];
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử cảnh báo</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Đang tải...</p>
        ) : alerts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Chưa có cảnh báo nào cho cầu này.
          </p>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
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
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <StatusBadge status={alert.status} />
                  <span className="text-muted-foreground text-sm">
                    {formatDateTime(alert.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
