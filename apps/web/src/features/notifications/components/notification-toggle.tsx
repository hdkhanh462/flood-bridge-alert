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
import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

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

  const subscribeMutation = useMutation(
    orpc.pushSubscription.subscribe.mutationOptions({
      onSuccess: (_, variables) => setEndpoint(variables.endpoint),
    }),
  );
  const unsubscribeMutation = useMutation(
    orpc.pushSubscription.unsubscribe.mutationOptions({
      onSuccess: () => {
        setEndpoint(null);
        setOpen(false);
      },
    }),
  );
  const updateInterestsMutation = useMutation(
    orpc.pushSubscription.updateInterests.mutationOptions({
      onSuccess: () => interests.refetch(),
    }),
  );

  async function handleEnable() {
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

    subscribeMutation.mutate({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    });
  }

  async function handleDisable() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      setEndpoint(null);
      return;
    }

    const subscriptionEndpoint = subscription.endpoint;
    await subscription.unsubscribe();
    unsubscribeMutation.mutate({ endpoint: subscriptionEndpoint });
  }

  function toggleBridgeInterest(bridgeId: string, checked: boolean) {
    if (!endpoint) return;
    const current = interests.data?.bridgeIds ?? [];
    const next = checked
      ? [...current, bridgeId]
      : current.filter((id) => id !== bridgeId);
    updateInterestsMutation.mutate({ endpoint, bridgeIds: next });
  }

  if (!supported) return null;

  if (!subscribed) {
    return (
      <Button variant="outline" size="sm" onClick={handleEnable}>
        <Bell className="h-4 w-4" />
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
          <p className="font-medium text-sm">Chỉ nhận thông báo cho cầu</p>
          <label
            htmlFor="interest-all"
            className="flex items-center gap-2 text-sm"
          >
            <Checkbox
              id="interest-all"
              checked={watchingAll}
              onCheckedChange={(checked) => {
                if (checked)
                  updateInterestsMutation.mutate({ endpoint, bridgeIds: [] });
              }}
            />
            Tất cả các cầu
          </label>
          <Separator />
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {bridges.data?.map((bridge) => (
              <label
                key={bridge.id}
                htmlFor={`interest-${bridge.id}`}
                className="flex items-center gap-2 text-sm"
              >
                <Checkbox
                  id={`interest-${bridge.id}`}
                  checked={selectedBridgeIds.includes(bridge.id)}
                  onCheckedChange={(checked) =>
                    toggleBridgeInterest(bridge.id, checked === true)
                  }
                />
                {bridge.name}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Tắt thông báo"
        onClick={handleDisable}
      >
        <BellOff className="h-4 w-4" />
      </Button>
    </div>
  );
}
