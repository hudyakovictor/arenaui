import { useEffect, useState } from "react";
import { tickerHeadlines } from "../data/game";
import { Button } from "../components/ui";
import { IconPlay } from "../components/icons";

export function Splash({ onEnter }: { onEnter: () => void }) {
  const [p, setP] = useState(0);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setP((v) => {
      if (v >= 100) { clearInterval(t); setReady(true); return 100; }
      return v + 4 + Math.random() * 8;
    }), 90);
    return () => clearInterval(t);
  }, []);

  const go = () => { setLeaving(true); setTimeout(onEnter, 320); };

  return (
    <div className={`scanline relative flex h-full min-h-dvh flex-col items-center justify-between overflow-hidden bg-ink px-6 py-10 transition-all duration-300 ${leaving ? "scale-105 opacity-0" : ""}`}>
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-acid/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-pink/10 blur-3xl" />

      <span className="tape">Не финрекомендация</span>

      <div className="splash-in flex flex-col items-center text-center">
        {/* Logo mark */}
        <div className="relative mb-6 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-3xl border-2 border-acid/70 rotate-6 shadow-acid" />
          <div className="absolute inset-0 rounded-3xl border border-line-strong -rotate-6 bg-surface" />
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="relative">
            <path d="M14 40v10M14 22v8" stroke="#ff4d5e" strokeWidth="3" strokeLinecap="round" />
            <rect x="9" y="30" width="10" height="10" rx="1.5" fill="#ff4d5e" />
            <path d="M32 14v6M32 44v8" stroke="#c8ff00" strokeWidth="3" strokeLinecap="round" />
            <rect x="27" y="20" width="10" height="24" rx="1.5" fill="#c8ff00" />
            <path d="M50 26v6M50 46v6" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
            <rect x="45" y="32" width="10" height="14" rx="1.5" fill="#4ade80" />
          </svg>
        </div>
        <h1 className="stencil drip relative text-[46px] leading-[0.9] text-text">
          Signal<br /><span className="text-acid acid-glow-text">Arena</span>
        </h1>
        <p className="mt-6 font-display text-[16px] font-semibold uppercase tracking-[0.2em] text-sub">Proof of Skill</p>
        <p className="mt-2 max-w-[280px] text-[14px] text-muted">Первая обучающая торговая арена GameFi 2.0. Ты здесь ради денег. Именно поэтому ты уже в опасности.</p>
      </div>

      <div className="w-full max-w-[320px]">
        {ready ? (
          <Button size="lg" className="glow-pulse w-full pop" onClick={go}><IconPlay size={20} /> Войти в Арену</Button>
        ) : (
          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-acid transition-[width] duration-150" style={{ width: `${Math.min(100, p)}%` }} />
            </div>
            <p className="mt-2 text-center font-display text-[12px] uppercase tracking-wider text-muted">
              {p < 35 ? "Печатаем панику…" : p < 70 ? "Пересчитываем твою ликвидность…" : "Будим кита…"}
            </p>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-0 w-full overflow-hidden border-t border-line/60 py-1.5">
        <div className="ticker flex w-max gap-10 whitespace-nowrap font-display text-[11px] uppercase tracking-wider text-muted">
          {[...tickerHeadlines, ...tickerHeadlines].map((h, i) => <span key={i}>{h}</span>)}
        </div>
      </div>
    </div>
  );
}
