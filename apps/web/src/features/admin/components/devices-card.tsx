import {
  Card,
  CardContent,
  CardDescription,
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

import { formatDateTime } from "@/lib/date";

export function DevicesCard({
  devices,
  isLoading,
}: {
  devices: {
    id: string;
    createdAt: string | Date;
    user: { email: string; isAnonymous?: boolean | null };
    bridges: { id: string; name: string }[];
  }[];
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thiết bị nhận thông báo</CardTitle>
        <CardDescription>
          Danh sách push subscription đã đăng ký
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : devices.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Chưa có thiết bị nào đăng ký</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Khu vực quan tâm</TableHead>
                    <TableHead className="text-right">Ngày đăng ký</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        {device.user.isAnonymous
                          ? "Ẩn danh"
                          : device.user.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {device.bridges.length === 0
                          ? "Tất cả các cầu"
                          : device.bridges
                              .map((bridge) => bridge.name)
                              .join(", ")}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDateTime(device.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 md:hidden">
              {devices.map((device) => (
                <div key={device.id} className="rounded-md border p-3">
                  <p className="font-medium">
                    {device.user.isAnonymous ? "Ẩn danh" : device.user.email}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {device.bridges.length === 0
                      ? "Tất cả các cầu"
                      : device.bridges.map((bridge) => bridge.name).join(", ")}
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {formatDateTime(device.createdAt)}
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
