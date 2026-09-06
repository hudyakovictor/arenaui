import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";

export interface SlideDef {
  id: string;
  title: string;
  section: string;
  render: () => ReactNode;
}

export function Deck({ slides }: { slides: SlideDef[] }) {
  const [i, setI] = useState(0);
  const [menu, setMenu] = useState(false);
  const total = slides.length;

  const go = useCallback(
    (n: number) => {
      setI(Math.max(0, Math.min(total - 1, n)));
      setMenu(false);
    },
    [total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        go(i + 1);
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(i - 1);
      }
      if (e.key === "Home") go(0);
      if (e.key === "End") go(total - 1);
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go, total]);

  // Swipe on touch
  useEffect(() => {
    let x0 = 0;
    const s = (e: TouchEvent) => (x0 = e.touches[0].clientX);
    const en = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 70) go(dx < 0 ? i + 1 : i - 1);
    };
    window.addEventListener("touchstart", s);
    window.addEventListener("touchend", en);
    return () => {
      window.removeEventListener("touchstart", s);
      window.removeEventListener("touchend", en);
    };
  }, [i, go]);

  const slide = slides[i];
  const sections = Array.from(new Set(slides.map((s) => s.section)));

  return (
    <div className="grid-bg flex h-full min-h-screen flex-col lg:flex-row">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-bg/95 backdrop-blur p-5 transition-transform lg:static lg:w-72 lg:translate-x-0 lg:border-r lg:border-border lg:bg-inset/60",
          menu ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="font-display text-lg font-bold tracking-tight">
              SIGNAL <span className="text-accent">ARENA</span>
            </div>
            <div className="font-mono text-[11px] text-muted">аудит · 25 → 99</div>
          </div>
          <button onClick={() => setMenu(false)} className="lg:hidden rounded-lg border border-border px-3 py-2 text-sub" aria-label="Закрыть">
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-thin -mr-2 pr-2">
          {sections.map((sec) => (
            <div key={sec} className="mb-4">
              <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{sec}</div>
              {slides.map((s, idx) =>
                s.section === sec ? (
                  <button
                    key={s.id}
                    onClick={() => go(idx)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
                      idx === i ? "bg-accent/10 text-accent" : "text-sub hover:bg-hover hover:text-text",
                    )}
                  >
                    <span className={cn("font-mono text-[11px] w-5 shrink-0", idx === i ? "text-accent" : "text-muted")}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate">{s.title}</span>
                  </button>
                ) : null,
              )}
            </div>
          ))}
        </nav>
        <div className="mt-4 font-mono text-[10px] text-muted leading-relaxed">
          ← → или свайп — листать<br />
          Home / End — в начало / конец
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-h-screen flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-bg/80 px-4 py-3 backdrop-blur md:px-8">
          <button onClick={() => setMenu(true)} className="lg:hidden rounded-lg border border-border px-3 py-1.5 font-mono text-[12px] text-sub" aria-label="Меню">
            ☰
          </button>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{slide.section}</div>
          <div className="ml-auto flex items-center gap-2 font-mono text-[12px] text-sub">
            <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-muted">/</span>
            <span>{String(total).padStart(2, "0")}</span>
          </div>
        </header>
        <div className="h-0.5 w-full bg-inset">
          <div className="h-full bg-accent transition-all duration-500" style={{ width: `${((i + 1) / total) * 100}%` }} />
        </div>

        {/* Slide */}
        <section key={slide.id} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 md:px-10 md:py-10">
          <div className="mx-auto w-full max-w-6xl">{slide.render()}</div>
        </section>

        {/* Footer nav */}
        <footer className="sticky bottom-0 z-30 flex items-center justify-between border-t border-border bg-bg/85 px-4 py-3 backdrop-blur md:px-8">
          <button
            onClick={() => go(i - 1)}
            disabled={i === 0}
            className="min-h-11 rounded-xl border border-border px-4 py-2 text-[13px] text-sub transition hover:border-accent hover:text-accent disabled:opacity-30"
          >
            ← Назад
          </button>
          <div className="hidden md:block truncate px-4 text-[13px] text-sub">{slide.title}</div>
          <button
            onClick={() => go(i + 1)}
            disabled={i === total - 1}
            className="min-h-11 rounded-xl bg-accent px-5 py-2 text-[13px] font-semibold text-bg transition hover:brightness-110 disabled:opacity-30"
          >
            Далее →
          </button>
        </footer>
      </main>
    </div>
  );
}
