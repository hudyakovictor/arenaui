import { useEffect, useState } from "react";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "../components/ui";
import CandleChart from "../components/CandleChart";
import { scenarios } from "../data/game";
import { cn } from "../utils/cn";

export default function Splash({ onEnter }: { onEnter: () => void }) {
  const [phase, setPhase] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 700);
    const t3 = setTimeout(() => setPhase(3), 1200);
    const iv = setInterval(() => setRev((r) => (r + 1) % 9), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(iv);
    };
  }, []);

  const enter = () => {
    setLeaving(true);
    setTimeout(onEnter, 420);
  };

  const sc = scenarios[0];

  return (
    <div className={cn("grid-bg noise relative flex min-h-[100dvh] flex-col items-center justify-between overflow-hidden bg-ink px-6 py-10 transition-all duration-500", leaving && "scale-105 opacity-0")}>
      {/* background chart */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1/3 opacity-30">
        <CandleChart candles={sc.candles} future={sc.future} revealed={rev} volumes={sc.volumes} level={sc.level} height={320} className="h-full rounded-none bg-transparent" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0a0b0d_85%)]" />

      <div className={cn("relative z-10 mt-6 flex items-center gap-2 transition-all duration-500", phase >= 1 ? "opacity-100" : "translate-y-3 opacity-0")}>
        <span className="tape">Season 01 · Шторм</span>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className={cn("transition-all duration-700", phase >= 1 ? "scale-100 opacity-100" : "scale-90 opacity-0")}>
          <div className="stencil text-[13px] tracking-[0.4em] text-acid">Signal</div>
          <div className="stencil acid-glow-text text-[74px] leading-[0.9] text-text sm:text-[96px]">ARENA</div>
          <div className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.35em] text-sub">Proof of Skill</div>
        </div>

        <div className={cn("mt-8 max-w-sm space-y-1 transition-all duration-500", phase >= 2 ? "opacity-100" : "translate-y-3 opacity-0")}>
          <p className="stencil text-lg text-text">Ты здесь ради денег.</p>
          <p className="text-sm text-sub">Именно поэтому ты уже в опасности.</p>
        </div>

        <div className={cn("mt-8 grid w-full max-w-sm grid-cols-3 gap-2 transition-all duration-500", phase >= 3 ? "opacity-100" : "translate-y-3 opacity-0")}>
          {[
            ["Улики", "найди сигнал"],
            ["Уверенность", "0/3 → решение"],
            ["Риск", "рынок ответит"],
          ].map(([a, b], i) => (
            <div key={a} className="card-inset px-3 py-2 text-left" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="font-display text-[10px] uppercase tracking-widest text-muted">0{i + 1}</div>
              <div className="font-display text-sm font-semibold uppercase text-text">{a}</div>
              <div className="text-[11px] text-sub">{b}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={cn("relative z-10 w-full max-w-sm space-y-3 transition-all duration-500", phase >= 3 ? "opacity-100" : "translate-y-3 opacity-0")}>
        <Button size="lg" full onClick={enter} className="animate-glow">
          Войти в систему <ArrowRight size={18} />
        </Button>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <ShieldAlert size={12} /> Не финрекомендация. Обучающая среда. Депозит — учебный.
        </div>
      </div>
    </div>
  );
}
