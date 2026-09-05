import { env } from "@flood-bridge-alert/env/web";
import { Button } from "@flood-bridge-alert/ui/components/button";
import { Checkbox } from "@flood-bridge-alert/ui/components/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@flood-bridge-alert/ui/components/popover";
import { Separator } from "@flood-bridge-alert/ui/components/separator";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { usePwaStandalone } from "@/hooks/use-pwa-standalone";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

import { BridgeMuteButton } from "./bridge-mute-button";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationToggle() {
  const isStandalone = usePwaStandalone();
  const [supported, setSupported] = useState(false);
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const subscribed = endpoint !== null;

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSupported(true);
    navigator.serviceWorker.ready.then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription();
      setEndpoint(subscription?.endpoint ?? null);
    });
  }, []);

  const bridges = useQuery({
    ...orpc.bridge.list.queryOptions(),
    enabled: subscribed,
  });
  const interests = useQuery({
    ...orpc.pushSubscription.myInterests.queryOptions({
      input: { endpoint: endpoint ?? "" },
    }),
    enabled: subscribed,
  });
  const mutes = useQuery({
    ...orpc.pushSubscription.myMutes.queryOptions({
      input: { endpoint: endpoint ?? "" },
    }),
    enabled: subscribed,
  });

  const subscribeMutation = useMutation(
    orpc.pushSubscription.subscribe.mutationOptions({
      onSuccess: (_, variables) => {
        setEndpoint(variables.endpoint);
        toast.success("Đã bật thông báo");
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const unsubscribeMutation = useMutation(
    orpc.pushSubscription.unsubscribe.mutationOptions({
      onSuccess: () => {
        setEndpoint(null);
        setOpen(false);
        toast.success("Đã tắt thông báo");
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const updateInterestsMutation = useMutation(
    orpc.pushSubscription.updateInterests.mutationOptions({
      onSuccess: () => interests.refetch(),
      onError: (error) => toast.error(error.message),
    }),
  );
  const muteBridgeMutation = useMutation(
    orpc.pushSubscription.muteBridge.mutationOptions({
      onSuccess: () => mutes.refetch(),
      onError: (error) => toast.error(error.message),
    }),
  );
  const unmuteBridgeMutation = useMutation(
    orpc.pushSubscription.unmuteBridge.mutationOptions({
      onSuccess: () => mutes.refetch(),
      onError: (error) => toast.error(error.message),
    }),
  );

  const isSavingInterests =
    updateInterestsMutation.isPending ||
    muteBridgeMutation.isPending ||
    unmuteBridgeMutation.isPending;

  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  async function handleEnable() {
    setIsEnabling(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const { data: session } = await authClient.getSession();
      if (!session) {
        await authClient.signIn.anonymous();
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(env.VITE_VAPID_PUBLIC_KEY),
      });
      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

      await subscribeMutation.mutateAsync({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
    } catch {
      // onError của mutation đã hiện toast, chỉ cần chặn unhandled rejection ở đây.
    } finally {
      setIsEnabling(false);
    }
  }

  async function handleDisable() {
    setIsDisabling(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        setEndpoint(null);
        return;
      }

      const subscriptionEndpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await unsubscribeMutation.mutateAsync({ endpoint: subscriptionEndpoint });
    } catch {
      // onError của mutation đã hiện toast, chỉ cần chặn unhandled rejection ở đây.
    } finally {
      setIsDisabling(false);
    }
  }

  function toggleBridgeInterest(bridgeId: string, checked: boolean) {
    if (!endpoint) return;
    const current = interests.data?.bridgeIds ?? [];
    const next = checked
      ? [...current, bridgeId]
      : current.filter((id) => id !== bridgeId);
    updateInterestsMutation.mutate({ endpoint, bridgeIds: next });
  }

  function handleMuteBridge(bridgeId: string, hours: number) {
    if (!endpoint) return;
    muteBridgeMutation.mutate({ endpoint, bridgeId, hours });
  }

  function handleUnmuteBridge(bridgeId: string) {
    if (!endpoint) return;
    unmuteBridgeMutation.mutate({ endpoint, bridgeId });
  }

  if (!supported || !isStandalone) return null;

  if (!subscribed) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={isEnabling}
        onClick={handleEnable}
      >
        {isEnabling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        Bật thông báo
      </Button>
    );
  }

  const selectedBridgeIds = interests.data?.bridgeIds ?? [];
  const watchingAll = selectedBridgeIds.length === 0;

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant="outline" size="sm" />}>
          <Bell className="h-4 w-4" />
          Đã bật thông báo
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">Chỉ nhận thông báo cho cầu</p>
            {isSavingInterests ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : null}
          </div>
          <label
            htmlFor="interest-all"
            className="flex items-center gap-2 text-sm"
          >
            <Checkbox
              id="interest-all"
              checked={watchingAll}
              disabled={isSavingInterests}
              onCheckedChange={(checked) => {
                if (checked)
                  updateInterestsMutation.mutate({ endpoint, bridgeIds: [] });
              }}
            />
            Tất cả các cầu
          </label>
          <Separator />
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {bridges.data?.map((bridge) => {
              const mute = mutes.data?.mutes.find(
                (m) => m.bridgeId === bridge.id,
              );
              return (
                <div key={bridge.id} className="flex items-center gap-2">
                  <label
                    htmlFor={`interest-${bridge.id}`}
                    className="flex flex-1 items-center gap-2 text-sm"
                  >
                    <Checkbox
                      id={`interest-${bridge.id}`}
                      checked={selectedBridgeIds.includes(bridge.id)}
                      disabled={isSavingInterests}
                      onCheckedChange={(checked) =>
                        toggleBridgeInterest(bridge.id, checked === true)
                      }
                    />
                    {bridge.name}
                  </label>
                  <BridgeMuteButton
                    mutedUntil={mute ? new Date(mute.mutedUntil) : null}
                    disabled={isSavingInterests}
                    onMute={(hours) => handleMuteBridge(bridge.id, hours)}
                    onUnmute={() => handleUnmuteBridge(bridge.id)}
                  />
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Tắt thông báo"
        disabled={isDisabling}
        onClick={handleDisable}
      >
        {isDisabling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
