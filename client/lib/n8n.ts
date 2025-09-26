import type { ChatMessage, ChatRequest, ChatResponse } from "@shared/api";

export async function sendMessageToAssistant(params: {
  message: string;
  history: ChatMessage[];
  onChunk?: (chunk: string) => void;
}): Promise<string> {
  const { message, history, onChunk } = params;
  const payload: ChatRequest = { message, history };

  const resp = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = resp.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = (await resp.json()) as ChatResponse;
    return data.reply ?? "";
  }

  // Fallback: try to stream text
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
}
