import { Button } from "@flood-bridge-alert/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@flood-bridge-alert/ui/components/dropdown-menu";
import { cn } from "@flood-bridge-alert/ui/lib/utils";
import { BellOff } from "lucide-react";

import { formatTime } from "@/lib/date";

const MUTE_DURATION_OPTIONS = [
  { label: "Tắt 1 giờ", hours: 1 },
  { label: "Tắt 4 giờ", hours: 4 },
  { label: "Tắt 24 giờ", hours: 24 },
];

export function BridgeMuteButton({
  mutedUntil,
  disabled,
  onMute,
  onUnmute,
}: {
  mutedUntil: Date | null;
  disabled?: boolean;
  onMute: (hours: number) => void;
  onUnmute: () => void;
}) {
  const isMuted = mutedUntil != null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            className={cn(isMuted && "text-amber-600 hover:text-amber-600")}
            aria-label={
              isMuted
                ? `Đã tắt thông báo đến ${formatTime(mutedUntil)}`
                : "Tạm tắt thông báo cho cầu này"
            }
          />
        }
      >
        <BellOff className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {MUTE_DURATION_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.hours}
            onClick={() => onMute(option.hours)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
        {isMuted ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onUnmute}>
              Bỏ tắt
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
