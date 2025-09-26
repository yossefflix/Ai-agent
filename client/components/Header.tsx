import { Button } from "@/components/ui/button";

export default function Header() {
  const onStartChat = () => {
    window.dispatchEvent(new CustomEvent("gaid-open-chat"));
  };
  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur">
          <a href="/" className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-inner">
              <div className="absolute inset-0 rounded-xl blur-[10px] bg-gradient-to-br from-cyan-400/60 to-violet-500/60" />
            </div>
            <span className="text-white font-semibold tracking-tight">
              G-AID
            </span>
          </a>
          <div className="flex items-center gap-2">
            <Button
              onClick={onStartChat}
              className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-md hover:from-cyan-400 hover:to-violet-400"
            >
              Start Chat
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
