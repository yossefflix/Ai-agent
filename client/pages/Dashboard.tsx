import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [reply, setReply] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/chat/config");
        if (!res.ok) throw new Error("no server config");
        const data = (await res.json()) as { webhookUrl: string | null };
        setWebhookUrl(data.webhookUrl ?? "");
      } catch (e) {
        const fallback =
          (globalThis as any).__N8N_WEBHOOK__ ||
          (import.meta as any).env?.VITE_N8N_CHAT_WEBHOOK_URL ||
          "https://yossefflix2.app.n8n.cloud/webhook/ab05a77b-9a6e-4292-b9ea-e90e0c7d31ab";
        setWebhookUrl(fallback);
      }
    })();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setReply("");
    try {
      // Try server first
      let res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Hello from Dashboard", history: [] }),
      });
      if (!res.ok) throw new Error("api/chat unavailable");
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await res.json();
        setReply(
          typeof data.reply === "string" ? data.reply : JSON.stringify(data),
        );
      } else {
        setReply(await res.text());
      }
    } catch {
      // Direct webhook fallback
      try {
        const res2 = await fetch(webhookUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            message: "Hello from Dashboard",
            history: [],
          }),
          mode: "cors",
        });
        const ct2 = res2.headers.get("content-type") || "";
        if (ct2.includes("application/json")) {
          const data2 = await res2.json();
          setReply(
            typeof (data2 as any).reply === "string"
              ? (data2 as any).reply
              : JSON.stringify(data2),
          );
        } else {
          setReply(await res2.text());
        }
      } catch {
        setReply("Request failed. Check the webhook URL and network.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] max-w-3xl mx-auto px-4 pt-32">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <p className="mt-2 text-white/70">
        This page tests and confirms your n8n webhook connection for G-AID.
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <label className="text-sm text-white/70">Current webhook URL</label>
        <Input
          value={webhookUrl}
          readOnly
          className="mt-2 bg-white/5 text-white border-white/10"
        />
        <div className="mt-4 flex gap-2">
          <Button
            onClick={testConnection}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white"
          >
            {loading ? "Testing…" : "Test Connection"}
          </Button>
        </div>
        {reply && (
          <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-white/80">
            <div className="text-sm font-semibold mb-2">Reply</div>
            <pre className="whitespace-pre-wrap break-words text-sm">
              {reply}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
