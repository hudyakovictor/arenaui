import type { CSSProperties, ReactNode } from "react";

export function Phone({
  children,
  title,
  caption,
  mechanic,
}: {
  children: ReactNode;
  title: string;
  caption: string;
  mechanic: string;
}) {
  return (
    <figure className="flex flex-col items-center gap-4">
      <div className="phone scanlines">{children}</div>
      <figcaption className="w-[390px]">
        <div className="font-mono text-[10px] tracking-[0.12em] text-primary">
          {mechanic}
        </div>
        <div className="mt-1 text-base font-bold text-text">{title}</div>
        <p className="mt-1 text-[13px] leading-snug text-sub">{caption}</p>
      </figcaption>
    </figure>
  );
}

export function TopBar({
  level = "L7",
  xp = 62,
  right,
  label = "УРОВЕНЬ 7",
  value = "1 240 / 1 800",
}: {
  level?: string;
  xp?: number;
  right?: ReactNode;
  label?: string;
  value?: string;
}) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border bg-elevated px-3.5">
      <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border border-primary font-mono text-[11px] font-bold text-primary">
        {level}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex justify-between font-mono text-[9px] text-muted">
          <span>{label}</span>
          <span>{value}</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full border border-border bg-inset">
          <i className="block h-full rounded-full bg-primary" style={{ width: `${xp}%` }} />
        </div>
      </div>
      {right ?? (
        <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-sub">
          <span className="text-warn">◈</span> 312 $SIG
        </div>
      )}
    </div>
  );
}

const navItems = [
  { k: "raid", l: "РЕЙД", i: "◇" },
  { k: "ghost", l: "ПРИЗРАК", i: "◌" },
  { k: "city", l: "ГОРОД", i: "▦" },
  { k: "more", l: "ЕЩЁ", i: "≡" },
];

export function BottomNav({ active }: { active: string }) {
  return (
    <div className="grid h-[60px] shrink-0 grid-cols-4 border-t border-border bg-elevated">
      {navItems.map((n) => {
        const on = n.k === active;
        return (
          <div
            key={n.k}
            className={`relative flex flex-col items-center justify-center gap-0.5 font-mono text-[8px] tracking-[0.05em] ${on ? "text-primary" : "text-muted"}`}
          >
            {on && <span className="absolute top-0 h-0.5 w-[22px] rounded-b bg-primary" />}
            <span className="text-[17px] leading-none">{n.i}</span>
            {n.l}
          </div>
        );
      })}
    </div>
  );
}

export function Chip({
  children,
  tone = "muted",
  style,
}: {
  children: ReactNode;
  tone?: "muted" | "primary" | "bad" | "good" | "warn" | "custom";
  style?: CSSProperties;
}) {
  const map = {
    muted: "border-border text-muted",
    primary: "border-primary text-primary",
    bad: "border-bad text-bad",
    good: "border-good text-good",
    warn: "border-warn text-warn",
    custom: "",
  };
  return (
    <span
      style={style}
      className={`inline-flex h-[22px] items-center whitespace-nowrap rounded-full border px-2 font-mono text-[9px] ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export function Btn({
  children,
  primary,
  ghost,
  danger,
  className = "",
}: {
  children: ReactNode;
  primary?: boolean;
  ghost?: boolean;
  danger?: boolean;
  className?: string;
}) {
  const base =
    "grid min-h-[44px] place-items-center rounded-[11px] border px-4 text-[13px] font-bold";
  const tone = primary
    ? "border-primary bg-primary text-[#03110f]"
    : danger
      ? "border-bad bg-bad/10 text-bad"
      : ghost
        ? "border-strong bg-transparent text-text"
        : "border-strong bg-elevated text-text";
  return <div className={`${base} ${tone} ${className}`}>{children}</div>;
}

export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-1 flex justify-between font-mono text-[8px] tracking-[0.06em] text-muted">
      <span>{children}</span>
      {right && <span>{right}</span>}
    </div>
  );
}

export function PaperCard({
  kicker,
  title,
  accent = "var(--color-primary)",
}: {
  kicker: string;
  title: string;
  accent?: string;
}) {
  return (
    <div className="paper rounded-[10px] px-3.5 py-2.5" style={{ borderLeft: `4px solid ${accent}` }}>
      <div className="font-mono text-[9px] font-bold tracking-[0.1em] text-ink/50">{kicker}</div>
      <h2 className="mt-0.5 text-[15px] font-bold leading-tight">{title}</h2>
    </div>
  );
}

// Deterministic pseudo candles for renders.
export function Candles({
  seed = 1,
  count = 26,
  className = "",
  decisionAt,
}: {
  seed?: number;
  count?: number;
  className?: string;
  decisionAt?: number;
}) {
  const items: { h: number; up: boolean }[] = [];
  let x = seed * 9301 + 49297;
  let price = 50;
  for (let i = 0; i < count; i++) {
    x = (x * 233280 + 12345) % 2147483647;
    const r = (x % 1000) / 1000;
    const d = (r - 0.48) * 22;
    price = Math.max(10, Math.min(90, price + d));
    items.push({ h: Math.abs(d) + 6, up: d >= 0 });
  }
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-x-3 inset-y-4 flex items-end justify-between gap-[3px]">
        {items.map((c, i) => (
          <span
            key={i}
            className={`relative block flex-1 ${c.up ? "bg-good" : "bg-bad"}`}
            style={{ height: `${c.h * 2.4}%`, maxWidth: 10 }}
          >
            <span className="absolute -top-1 -bottom-1 left-1/2 w-px -translate-x-1/2 bg-inherit" />
          </span>
        ))}
      </div>
      {decisionAt !== undefined && (
        <span
          className="pulse-ring absolute h-3.5 w-3.5 rounded-full border-2 border-primary"
          style={{ right: `${decisionAt}%`, top: "34%" }}
        />
      )}
    </div>
  );
}

export function Radar({
  values,
  size = 150,
  color = "var(--color-cognitive)",
  ghost,
}: {
  values: number[];
  size?: number;
  color?: string;
  ghost?: number[];
}) {
  const n = values.length;
  const c = size / 2;
  const r = c - 14;
  const pt = (v: number, i: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return `${c + Math.cos(a) * r * v},${c + Math.sin(a) * r * v}`;
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(v, i)).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon key={k} points={poly(values.map(() => k))} fill="none" stroke="var(--color-border)" strokeWidth="1" />
      ))}
      {values.map((_, i) => (
        <line key={i} x1={c} y1={c} x2={pt(1, i).split(",")[0]} y2={pt(1, i).split(",")[1]} stroke="var(--color-border)" />
      ))}
      {ghost && <polygon points={poly(ghost)} fill="rgba(147,163,188,.12)" stroke="var(--color-sub)" strokeDasharray="3 3" />}
      <polygon points={poly(values)} fill={`color-mix(in srgb, ${color} 22%, transparent)`} stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
