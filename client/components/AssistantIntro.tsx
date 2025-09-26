export default function AssistantIntro() {
  return (
    <div className="relative text-center max-w-3xl mx-auto px-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-wide text-white/80 backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
        Live • Smart Assistant
      </div>
      <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-white to-violet-300">
        Welcome to G-AID – Your Smart Assistant Hub
      </h1>
    </div>
  );
}
