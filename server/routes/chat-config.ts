import type { RequestHandler } from "express";

export const handleChatConfig: RequestHandler = (_req, res) => {
  const envUrl = process.env.N8N_CHAT_WEBHOOK_URL?.toString() || null;
  const defaultUrl =
    "https://yossefflix2.app.n8n.cloud/webhook/ab05a77b-9a6e-4292-b9ea-e90e0c7d31ab";
  res.status(200).json({ webhookUrl: envUrl || defaultUrl });
};
