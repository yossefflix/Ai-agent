export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10/ bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-white/50">
        © {new Date().getFullYear()} G-AID.
      </div>
    </footer>
  );
}
