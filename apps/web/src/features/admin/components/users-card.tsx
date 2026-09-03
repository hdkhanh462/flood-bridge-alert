import { Badge } from "@flood-bridge-alert/ui/components/badge";
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

type AdminUser = {
  id: string;
  email: string;
  role?: string;
  banned?: boolean | null;
  isAnonymous?: boolean;
};

export function UsersCard({
  users,
  isLoading,
  isMutating,
  currentUserId,
  onToggleRole,
  onToggleBan,
}: {
  users: AdminUser[];
  isLoading: boolean;
  isMutating: boolean;
  currentUserId?: string;
  onToggleRole: (user: AdminUser) => void;
  onToggleBan: (user: AdminUser) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Người dùng</CardTitle>
        <CardDescription>
          Bao gồm cả người dùng ẩn danh (chỉ đăng ký nhận thông báo)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : users.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Chưa có người dùng nào</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const isSelf = user.id === currentUserId;
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">
                            {user.isAnonymous
                              ? "Người dùng ẩn danh"
                              : user.email}
                            {isSelf ? (
                              <span className="text-muted-foreground">
                                {" "}
                                (Bạn)
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                user.role === "admin" ? "default" : "secondary"
                              }
                            >
                              {user.role === "admin" ? "Admin" : "Người dùng"}
                            </Badge>
                            {user.banned ? (
                              <Badge variant="destructive">Đã khóa</Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="xs"
                            disabled={isMutating || isSelf}
                            title={
                              isSelf
                                ? "Không thể tự thay đổi vai trò của chính mình"
                                : undefined
                            }
                            onClick={() => onToggleRole(user)}
                          >
                            {user.role === "admin"
                              ? "Bỏ quyền admin"
                              : "Cấp quyền admin"}
                          </Button>{" "}
                          <Button
                            variant="outline"
                            size="xs"
                            disabled={isMutating || isSelf}
                            title={
                              isSelf
                                ? "Không thể tự khóa chính mình"
                                : undefined
                            }
                            onClick={() => onToggleBan(user)}
                          >
                            {user.banned ? "Mở khóa" : "Khóa"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 md:hidden">
              {users.map((user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <div key={user.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">
                        {user.isAnonymous ? "Người dùng ẩn danh" : user.email}
                        {isSelf ? (
                          <span className="text-muted-foreground">
                            {" "}
                            (Bạn)
                          </span>
                        ) : null}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {user.role === "admin" ? "Admin" : "Người dùng"}
                        </Badge>
                        {user.banned ? (
                          <Badge variant="destructive">Đã khóa</Badge>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        disabled={isMutating || isSelf}
                        title={
                          isSelf
                            ? "Không thể tự thay đổi vai trò của chính mình"
                            : undefined
                        }
                        onClick={() => onToggleRole(user)}
                      >
                        {user.role === "admin"
                          ? "Bỏ quyền admin"
                          : "Cấp quyền admin"}
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        disabled={isMutating || isSelf}
                        title={isSelf ? "Không thể tự khóa chính mình" : undefined}
                        onClick={() => onToggleBan(user)}
                      >
                        {user.banned ? "Mở khóa" : "Khóa"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
