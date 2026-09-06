import { Badge } from "@flood-bridge-alert/ui/components/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flood-bridge-alert/ui/components/card";
import { Skeleton } from "@flood-bridge-alert/ui/components/skeleton";
import { cn } from "@flood-bridge-alert/ui/lib/utils";
import { CheckCircle2, OctagonAlert, TriangleAlert } from "lucide-react";
import type { ComponentProps } from "react";

const VARIANT_ICONS = {
  success: CheckCircle2,
  warning: TriangleAlert,
  destructive: OctagonAlert,
} as const;

const VARIANT_ICON_CLASSES = {
  success: "bg-green-600/10 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  warning: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  destructive: "bg-destructive/10 text-destructive",
} as const;

export function StatCard({
  label,
  variant,
  value,
  isLoading,
}: {
  label: string;
  variant: keyof typeof VARIANT_ICONS;
  value: number;
  isLoading: boolean;
}) {
  const Icon = VARIANT_ICONS[variant];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardDescription>
            <Badge variant={variant as ComponentProps<typeof Badge>["variant"]}>
              {label}
            </Badge>
          </CardDescription>
          <CardTitle className="font-semibold text-3xl">
            {isLoading ? <Skeleton className="h-9 w-12" /> : value}
          </CardTitle>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            VARIANT_ICON_CLASSES[variant],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
    </Card>
  );
}
