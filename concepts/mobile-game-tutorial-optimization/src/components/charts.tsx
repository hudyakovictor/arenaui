import { useEffect, useState } from "react";
import type { Category } from "../data/audit";

function useAnimatedNumber(target: number, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = v;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setV(from + (target - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return v;
}

export function ScoreRing({ value, size = 180, label, color }: { value: number; size?: number; label?: string; color?: string }) {
  const v = useAnimatedNumber(value);
  const r = (size - 18) / 2;
  const c = 2 * Math.PI * r;
  const tone = color ?? (value < 40 ? "#ff596d" : value < 75 ? "#ffb341" : "#3bde8a");
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1f2a44" strokeWidth={10} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tone}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * v) / 100}
          style={{ filter: `drop-shadow(0 0 8px ${tone}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display font-bold leading-none" style={{ fontSize: size * 0.28, color: tone }}>
          {Math.round(v)}
        </div>
        {label && <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">{label}</div>}
      </div>
    </div>
  );
}

export function CategoryBars({ cats, mode }: { cats: Category[]; mode: "now" | "both" }) {
  return (
    <div className="space-y-2.5">
      {cats.map((c, i) => (
        <div key={c.id} className="grid grid-cols-[minmax(0,140px)_1fr_auto] md:grid-cols-[minmax(0,220px)_1fr_auto] items-center gap-3">
          <div className="truncate text-[13px] text-sub">
            <span className="mr-2 font-mono text-muted">{c.icon}</span>
            {c.short}
            <span className="ml-1.5 font-mono text-[10px] text-muted">·{c.factors}</span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-inset border border-border">
            {mode === "both" && (
              <div
                className="anim-grow absolute inset-y-0 left-0 rounded-full bg-good/25"
                style={{ width: `${c.target}%`, animationDelay: `${i * 40}ms` }}
              />
            )}
            <div
              className="anim-grow absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${c.now}%`,
                background: c.now < 30 ? "#ff596d" : c.now < 60 ? "#ffb341" : "#3bde8a",
                animationDelay: `${i * 40 + 100}ms`,
              }}
            />
          </div>
          <div className="w-20 text-right font-mono text-[12px]">
            <span className="text-bad">{c.now}</span>
            {mode === "both" && (
              <>
                <span className="text-muted"> → </span>
                <span className="text-good">{c.target}</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Radar({ cats, size = 320 }: { cats: Category[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 42;
  const n = cats.length;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * R * (v / 100), cy + Math.sin(a) * R * (v / 100)] as const;
  };
  const poly = (key: "now" | "target") => cats.map((c, i) => pt(i, c[key]).join(",")).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
      {[25, 50, 75, 100].map((lvl) => (
        <polygon
          key={lvl}
          points={cats.map((_, i) => pt(i, lvl).join(",")).join(" ")}
          fill="none"
          stroke="#1f2a44"
          strokeWidth={1}
        />
      ))}
      {cats.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#1f2a44" strokeWidth={1} />;
      })}
      <polygon points={poly("target")} fill="rgba(59,222,138,0.12)" stroke="#3bde8a" strokeWidth={1.5} strokeDasharray="4 3" />
      <polygon points={poly("now")} fill="rgba(255,89,109,0.18)" stroke="#ff596d" strokeWidth={2} />
      {cats.map((c, i) => {
        const [x, y] = pt(i, 118);
        return (
          <text key={c.id} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#9aa6bd" fontSize={10} fontFamily="JetBrains Mono, monospace">
            {c.short}
          </text>
        );
      })}
    </svg>
  );
}

export function MiniBar({ value, max = 100, color = "#31d6c4" }: { value: number; max?: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-inset">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
  );
}
