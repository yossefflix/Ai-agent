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
        const data = (await res.json()) as { webhookUrl: string | null };
        setWebhookUrl(data.webhookUrl ?? "");
      } catch (e) {
        setWebhookUrl("");
      }
    })();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setReply("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Hello from Dashboard", history: [] }),
      });
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await res.json();
        setReply(
          typeof data.reply === "string" ? data.reply : JSON.stringify(data),
        );
      } else {
        setReply(await res.text());
      }
    } catch (e) {
      setReply("Request failed. Check the webhook URL and network.");
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
