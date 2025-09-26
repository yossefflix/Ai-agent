import type { RequestHandler } from "express";
import type { ChatRequest, ChatResponse } from "@shared/api";

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const body = req.body as ChatRequest | undefined;
    const message = body?.message?.toString() ?? "";
    const history = Array.isArray(body?.history) ? body!.history : [];

    if (!message) {
      res
        .status(400)
        .json({
          reply: "Please provide a message." satisfies ChatResponse["reply"],
        });
      return;
    }

    const envUrl = process.env.N8N_CHAT_WEBHOOK_URL?.toString();
    const defaultUrl =
      "https://yossefflix2.app.n8n.cloud/webhook/ab05a77b-9a6e-4292-b9ea-e90e0c7d31ab";
    const webhookUrl = envUrl || defaultUrl;

    if (webhookUrl) {
      const upstream = await fetch(webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, history }),
      });

      const contentType = upstream.headers.get("content-type") || "";

      // If upstream returns JSON with a reply field, forward it
      if (contentType.includes("application/json")) {
        const data = (await upstream.json()) as any;
        const reply: string =
          typeof data?.reply === "string" ? data.reply : JSON.stringify(data);
        res.status(200).json({ reply } as ChatResponse);
        return;
      }

      // Otherwise treat as text
      const text = await upstream.text();
      res.status(200).json({ reply: text } as ChatResponse);
      return;
    }

    // Fallback local assistant if no n8n URL configured
    const reply = generateLocalReply(message, history);
    res.status(200).json({ reply } as ChatResponse);
  } catch (err) {
    console.error("/api/chat error", err);
    res
      .status(500)
      .json({
        reply: "Sorry, something went wrong processing your message.",
      } as ChatResponse);
  }
};

function generateLocalReply(message: string, history: ChatRequest["history"]) {
  const lastUser = message.trim();
  const prefix = "G-AID";
  if (!lastUser) return `${prefix} is here. How can I help today?`;
  return `${prefix}: I received your message \"${lastUser}\". I can connect to your n8n workflows once you configure N8N_CHAT_WEBHOOK_URL.`;
}
