import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type ChatBubbleProps = {
  role: "user" | "assistant";
  children: ReactNode;
};

export function ChatBubble({ role, children }: ChatBubbleProps) {
  const isUser = role === "user";
  return (
    <div
      className={cn("w-full flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-white/5 text-foreground border border-white/10 rounded-bl-sm backdrop-blur",
        )}
      >
        {children}
      </div>
    </div>
  );
}
