import type { AppRouterClient } from "@flood-bridge-alert/api/routers/index";
import { env } from "@flood-bridge-alert/env/web";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				gcTime: ONE_DAY_MS,
			},
		},
		queryCache: new QueryCache({
			onError: (error, query) => {
				toast.error(`Error: ${error.message}`, {
					action: {
						label: "retry",
						onClick: () => {
							query.invalidate();
						},
					},
				});
			},
		}),
	});
}

export const queryClient = createQueryClient();

// Persist fetched query data to localStorage so previously loaded bridge
// status/alerts still render (as stale data) when the device goes offline.
export const persistOptions = {
	persister: createSyncStoragePersister({ storage: window.localStorage }),
	maxAge: ONE_DAY_MS,
};

function getServerUrl(url: string) {
	const normalized = url.endsWith("/") ? url.slice(0, -1) : url;
	if (!normalized.startsWith("/")) {
		return normalized;
	}
	return `${window.location.origin}${normalized}`;
}
export const link = new RPCLink({
	url: `${getServerUrl(env.VITE_SERVER_URL)}/rpc`,
	fetch(url, options) {
		return fetch(url, {
			...options,
			credentials: "include",
		});
	},
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
