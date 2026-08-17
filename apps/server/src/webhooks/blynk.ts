import {
	BridgeNotFoundError,
	blynkWebhookInputSchema,
	ingestBlynkReading,
} from "@flood-bridge-alert/api/webhooks/blynk";
import { env } from "@flood-bridge-alert/env/server";
import { Router, type Router as RouterType } from "express";

export const blynkWebhookRouter: RouterType = Router();

blynkWebhookRouter.post("/blynk", async (req, res) => {
	const token = req.header("x-webhook-token");
	if (token !== env.BLYNK_WEBHOOK_TOKEN) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}

	const parsed = blynkWebhookInputSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten() });
		return;
	}

	try {
		const reading = await ingestBlynkReading(parsed.data);
		res.status(201).json(reading);
	} catch (error) {
		if (error instanceof BridgeNotFoundError) {
			res.status(404).json({ error: error.message });
			return;
		}
		throw error;
	}
});
