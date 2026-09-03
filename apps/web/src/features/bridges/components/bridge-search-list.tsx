import { Button } from "@flood-bridge-alert/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@flood-bridge-alert/ui/components/empty";
import { Input } from "@flood-bridge-alert/ui/components/input";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search, Waves } from "lucide-react";
import { useEffect, useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { orpc } from "@/utils/orpc";

import { BridgeCard } from "./bridge-card";

const PAGE_SIZE = 10;

export function BridgeSearchList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [debouncedSearch]);

  const bridges = useQuery({
    ...orpc.bridge.search.queryOptions({
      input: { query: debouncedSearch.trim() || undefined, limit, offset: 0 },
    }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="-translate-y-1/2 absolute top-1/2 left-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm cầu tràn theo tên..."
          className="pl-8"
        />
      </div>

      {bridges.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : bridges.isError ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Waves />
            </EmptyMedia>
            <EmptyTitle>Không thể tải danh sách cầu tràn</EmptyTitle>
            <EmptyDescription>
              Đã có lỗi khi kết nối máy chủ. Vui lòng thử lại.
            </EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={() => bridges.refetch()}>
            Thử lại
          </Button>
        </Empty>
      ) : bridges.data?.items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Waves />
            </EmptyMedia>
            {debouncedSearch.trim() ? (
              <>
                <EmptyTitle>Không tìm thấy cầu tràn nào</EmptyTitle>
                <EmptyDescription>Thử lại với từ khóa khác.</EmptyDescription>
              </>
            ) : (
              <>
                <EmptyTitle>Chưa có cầu tràn nào</EmptyTitle>
                <EmptyDescription>
                  Quản trị viên chưa thêm cầu tràn nào vào hệ thống.
                </EmptyDescription>
              </>
            )}
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {bridges.data?.items.map((bridge) => (
              <BridgeCard key={bridge.id} bridge={bridge} />
            ))}
          </div>
          {bridges.data?.hasMore ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setLimit((current) => current + PAGE_SIZE)}
                disabled={bridges.isFetching}
              >
                {bridges.isFetching ? "Đang tải..." : "Xem thêm"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
