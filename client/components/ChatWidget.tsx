import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "./ChatBubble";
import { sendMessageToAssistant } from "@/lib/n8n";
import type { ChatMessage } from "@shared/api";

export default function ChatWidget() {
  const [open, setOpen] = useState(true);
  const { pathname } = useLocation();
  if (pathname === "/") return null;
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "assistant",
      content: "Ask me anything — I’ll guide you in real time.",
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("gaid-open-chat", onOpen as any);
    return () => window.removeEventListener("gaid-open-chat", onOpen as any);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const historyForSend = useMemo(() => messages, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setSending(true);

    let assistantIndex: number | null = null;
    try {
      const reply = await sendMessageToAssistant({
        message: text,
        history: historyForSend,
        onChunk: (chunk) => {
          setMessages((prev) => {
            if (assistantIndex == null) {
              assistantIndex = prev.length;
              return [...prev, { role: "assistant", content: chunk }];
            }
            const copy = prev.slice();
            const prevMsg = copy[assistantIndex];
            copy[assistantIndex] = {
              ...prevMsg,
              content: prevMsg.content + chunk,
            };
            return copy;
          });
        },
      });
      if (assistantIndex == null) {
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Sorry, I couldn’t reach the assistant. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-6 z-40">
      <div className="mx-auto w-full max-w-2xl px-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-xl">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Real-time chat
            </div>
            <Button
              variant="ghost"
              onClick={() => setOpen((o) => !o)}
              className="text-white/80 hover:bg-white/10"
            >
              {open ? "Hide" : "Chat"}
            </Button>
          </div>
          {open && (
            <div className="px-3 pb-3">
              <div className="h-[320px] rounded-2xl border border-white/10 bg-black/20">
                <ScrollArea className="h-full w-full p-3">
                  <div className="flex flex-col gap-3">
                    {messages.map((m, i) => (
                      <ChatBubble key={i} role={m.role as any}>
                        {m.content}
                      </ChatBubble>
                    ))}
                    <div ref={endRef} />
                  </div>
                </ScrollArea>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type your message…"
                  className="bg-white/5 text-white placeholder:text-white/50 border-white/10"
                />
                <Button
                  onClick={handleSend}
                  disabled={sending}
                  className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white"
                >
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
