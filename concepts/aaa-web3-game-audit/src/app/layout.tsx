import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web3 Game Audit Console — 50 анализов UI/UX и инженерии",
  description:
    "Интерактивная консоль аудита AAA Web3 игр: 50 автоматических анализов онбординга, транзакционного UX, game feel, безопасности, бэкенда и live-ops.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen antialiased">
        <div className="grid-bg pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />
        <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/70 backdrop-blur-xl">
          <nav aria-label="Основная навигация" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
            <Link href="/" className="group flex items-center gap-3">
              <span className="pulse-glow grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-cyan text-sm font-black text-bg">
                99
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold tracking-wide">WEB3 GAME AUDIT</span>
                <span className="block text-[11px] uppercase tracking-[0.22em] text-muted">Console · 50 analyses</span>
              </span>
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="rounded-lg px-3 py-1.5 text-muted transition hover:bg-surface-2 hover:text-text">
                Прогоны
              </Link>
              <Link href="/#new-run" className="rounded-lg bg-primary/15 px-3 py-1.5 font-semibold text-[#c4b5ff] ring-1 ring-primary/40 transition hover:bg-primary/25">
                + Новый аудит
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        <footer className="mx-auto max-w-7xl px-6 py-10 text-xs text-muted">
          Методология: 10 доменов × 5 эвристик = 50 анализов, взвешенных по severity (critical ×4, high ×3, medium ×2, low ×1).
        </footer>
      </body>
    </html>
  );
}
