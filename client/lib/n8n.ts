import type { ChatMessage, ChatRequest, ChatResponse } from "@shared/api";

const DEFAULT_WEBHOOK =
  (globalThis as any).__N8N_WEBHOOK__ ||
  (import.meta as any).env?.VITE_N8N_CHAT_WEBHOOK_URL ||
  "https://yossefflix2.app.n8n.cloud/webhook/ab05a77b-9a6e-4292-b9ea-e90e0c7d31ab";

export async function sendMessageToAssistant(params: {
  message: string;
  history: ChatMessage[];
  onChunk?: (chunk: string) => void;
}): Promise<string> {
  const { message, history, onChunk } = params;
  const payload: ChatRequest = { message, history };

  // Try server endpoint first
  try {
    const resp = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) throw new Error(`api/chat failed: ${resp.status}`);

    const contentType = resp.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = (await resp.json()) as ChatResponse;
      return data.reply ?? "";
    }

    const reader = resp.body?.getReader();
    if (!reader) {
      const text = await resp.text();
      if (onChunk) onChunk(text);
      return text;
    }

    const decoder = new TextDecoder();
    let done = false;
    let final = "";
    while (!done) {
      const result = await reader.read();
      done = !!result.done;
      const chunk = decoder.decode(result.value || new Uint8Array(), {
        stream: !done,
      });
      if (chunk) {
        final += chunk;
        onChunk?.(chunk);
      }
    }
    return final;
  } catch (_e) {
    // Fallback: direct to webhook for static hosting (e.g., GitHub Pages)
    const resp = await fetch(DEFAULT_WEBHOOK, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      mode: "cors",
    });
    const ct = resp.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = (await resp.json()) as any;
      const reply: string =
        typeof data?.reply === "string" ? data.reply : JSON.stringify(data);
      return reply;
    }
    const text = await resp.text();
    return text;
  }
}
