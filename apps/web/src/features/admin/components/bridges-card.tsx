import { Button } from "@flood-bridge-alert/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import {
  Empty,
  EmptyDescription,
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
import { Copy, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SensorStatusBadge } from "@/features/bridges/components/status-badge";

import type { AdminBridge } from "../types";
import type { BridgeFormValues } from "./bridge-form";
import { BridgeFormDialog } from "./bridge-form-dialog";

export function BridgesCard({
  bridges,
  isLoading,
  createOpen,
  onCreateOpenChange,
  isCreating,
  onCreateSubmit,
  onEditLocation,
  onEditThreshold,
  onRequestDelete,
}: {
  bridges: AdminBridge[];
  isLoading: boolean;
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  isCreating: boolean;
  onCreateSubmit: (values: BridgeFormValues) => void;
  onEditLocation: (bridge: AdminBridge) => void;
  onEditThreshold: (bridge: AdminBridge) => void;
  onRequestDelete: (bridge: AdminBridge) => void;
}) {
  const copyBridgeId = async (bridge: AdminBridge) => {
    await navigator.clipboard.writeText(bridge.id);
    toast.success(`Đã sao chép ID cầu "${bridge.name}"`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Danh sách cầu</CardTitle>
          <CardDescription>Quản lý cầu tràn và ngưỡng cảnh báo</CardDescription>
        </div>
        <BridgeFormDialog
          open={createOpen}
          onOpenChange={onCreateOpenChange}
          isPending={isCreating}
          onSubmit={onCreateSubmit}
          trigger={
            <>
              <Plus className="h-4 w-4" />
              Thêm cầu
            </>
          }
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : bridges.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Chưa có cầu nào</EmptyTitle>
              <EmptyDescription>Bấm "Thêm cầu" để bắt đầu.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên cầu</TableHead>
                    <TableHead>Cảm biến</TableHead>
                    <TableHead>Ngưỡng</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bridges.map((bridge) => (
                    <TableRow key={bridge.id}>
                      <TableCell>
                        <div className="font-medium">{bridge.name}</div>
                        {bridge.location ? (
                          <div className="text-muted-foreground text-xs">
                            {bridge.location}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <SensorStatusBadge status={bridge.sensorStatus} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {bridge.threshold ? (
                          <>
                            An toàn ≤ {bridge.threshold.safeMax}m · Cảnh báo ≤{" "}
                            {bridge.threshold.warningMax}m
                          </>
                        ) : (
                          "Chưa cấu hình"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Sao chép ID cầu"
                          onClick={() => copyBridgeId(bridge)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Sửa vị trí"
                          onClick={() => onEditLocation(bridge)}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Sửa ngưỡng"
                          onClick={() => onEditThreshold(bridge)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Xóa cầu"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onRequestDelete(bridge)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 md:hidden">
              {bridges.map((bridge) => (
                <div key={bridge.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{bridge.name}</div>
                      {bridge.location ? (
                        <div className="text-muted-foreground text-xs">
                          {bridge.location}
                        </div>
                      ) : null}
                    </div>
                    <SensorStatusBadge status={bridge.sensorStatus} />
                  </div>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {bridge.threshold ? (
                      <>
                        An toàn ≤ {bridge.threshold.safeMax}m · Cảnh báo ≤{" "}
                        {bridge.threshold.warningMax}m
                      </>
                    ) : (
                      "Chưa cấu hình"
                    )}
                  </p>
                  <div className="mt-2 flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Sao chép ID cầu"
                      onClick={() => copyBridgeId(bridge)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Sửa vị trí"
                      onClick={() => onEditLocation(bridge)}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Sửa ngưỡng"
                      onClick={() => onEditThreshold(bridge)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Xóa cầu"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onRequestDelete(bridge)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
