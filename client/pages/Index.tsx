import { DemoResponse } from "@shared/api";
import { useEffect, useState } from "react";

import AssistantIntro from "@/components/AssistantIntro";
import Chat from "@/components/ChatPanel";

export default function Index() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500/30 to-violet-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto h-[50vh] max-w-6xl bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-white/10 to-transparent blur-2xl" />
      </div>

      <main className="mx-auto max-w-6xl px-4">
        <div className="pt-36">
          <AssistantIntro />
          <div className="mt-12">
            <p className="text-center text-white/80">
              Start your journey with G-AID today and let the smart assistant
              guide you!
            </p>
            <div className="mt-8">
              {/* Centered chat interface */}
              <Chat />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
