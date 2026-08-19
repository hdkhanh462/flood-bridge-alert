import { env } from "@flood-bridge-alert/env/web";
import { adminClient, anonymousClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

function getServerUrl(url: string) {
	const normalized = url.endsWith("/") ? url.slice(0, -1) : url;
	if (!normalized.startsWith("/")) {
		return normalized;
	}
	return `${window.location.origin}${normalized}`;
}
export const authClient = createAuthClient({
	// better-auth derives its route-matching base from this URL's path, so the
	// public auth path must equal the server-side mount (/api/auth everywhere)
	baseURL: new URL("/api/auth", getServerUrl(env.VITE_SERVER_URL)).toString(),
	plugins: [adminClient(), anonymousClient()],
});
