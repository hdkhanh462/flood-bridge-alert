import { env } from "@flood-bridge-alert/env/web";
import { Button } from "@flood-bridge-alert/ui/components/button";
import { useMutation } from "@tanstack/react-query";
import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";

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
	const [subscribed, setSubscribed] = useState(false);

	useEffect(() => {
		if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
		setSupported(true);
		navigator.serviceWorker.ready.then(async (registration) => {
			const subscription = await registration.pushManager.getSubscription();
			setSubscribed(subscription !== null);
		});
	}, []);

	const subscribeMutation = useMutation(
		orpc.pushSubscription.subscribe.mutationOptions({
			onSuccess: () => setSubscribed(true),
		}),
	);
	const unsubscribeMutation = useMutation(
		orpc.pushSubscription.unsubscribe.mutationOptions({
			onSuccess: () => setSubscribed(false),
		}),
	);

	async function handleEnable() {
		const permission = await Notification.requestPermission();
		if (permission !== "granted") return;

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
			setSubscribed(false);
			return;
		}

		const endpoint = subscription.endpoint;
		await subscription.unsubscribe();
		unsubscribeMutation.mutate({ endpoint });
	}

	if (!supported) return null;

	return subscribed ? (
		<Button variant="outline" size="sm" onClick={handleDisable}>
			<BellOff className="h-4 w-4" />
			Tắt thông báo
		</Button>
	) : (
		<Button variant="outline" size="sm" onClick={handleEnable}>
			<Bell className="h-4 w-4" />
			Bật thông báo
		</Button>
	);
}
