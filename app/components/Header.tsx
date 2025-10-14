// app/components/Header.tsx
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-beige">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
        {/* This is the white bar */}
        <div className="h-14 bg-white border-b border-brown/40 shadow-[0_1px_0_rgba(92,32,25,0.10)]
                        rounded-b-xl flex items-center justify-between">
          <Link href="/" className="font-extrabold tracking-tight">
            MVP<span className="text-gold">.</span>
          </Link>

          <nav className="text-sm">
            <Link href="/models" className="px-3 py-1 rounded hover:bg-brown/5">
              Models
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
