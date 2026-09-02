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
          <Table>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <StatusBadge status={alert.status} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleString("vi-VN")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
