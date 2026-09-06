import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import type { Severity } from "../data/audit";
import { severityLabel } from "../data/audit";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("font-mono text-[11px] tracking-[0.2em] uppercase text-accent", className)}>
      {children}
    </div>
  );
}

export function Title({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("font-display text-2xl md:text-4xl font-semibold leading-tight text-text", className)}>
      {children}
    </h2>
  );
}

export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sub text-base md:text-lg leading-relaxed max-w-3xl", className)}>{children}</p>;
}

export function Card({ children, className, accent }: { children: ReactNode; className?: string; accent?: string }) {
  return (
    <div
      className={cn("rounded-2xl border border-border bg-surface/80 backdrop-blur p-4 md:p-5", className)}
      style={accent ? { borderColor: accent + "55", boxShadow: `inset 3px 0 0 ${accent}` } : undefined}
    >
      {children}
    </div>
  );
}

export function SeverityBadge({ s }: { s: Severity }) {
  const map: Record<Severity, string> = {
    critical: "bg-bad/15 text-bad border-bad/40",
    high: "bg-warn/15 text-warn border-warn/40",
    medium: "bg-info/15 text-info border-info/40",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] tracking-wider uppercase", map[s])}>
      {severityLabel(s)}
    </span>
  );
}

export function Chip({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "accent" | "good" | "bad" | "warn" }) {
  const map = {
    muted: "border-border text-sub",
    accent: "border-accent/40 text-accent bg-accent/10",
    good: "border-good/40 text-good bg-good/10",
    bad: "border-bad/40 text-bad bg-bad/10",
    warn: "border-warn/40 text-warn bg-warn/10",
  };
  return <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px]", map[tone])}>{children}</span>;
}

export function Code({ children }: { children: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-inset p-3 font-mono text-[12px] leading-relaxed text-warn/90 scrollbar-thin whitespace-pre-wrap">
      {children}
    </pre>
  );
}

export function Stat({ label, value, tone = "text" }: { label: string; value: string; tone?: "text" | "accent" | "good" | "bad" | "warn" }) {
  const c = { text: "text-text", accent: "text-accent", good: "text-good", bad: "text-bad", warn: "text-warn" }[tone];
  return (
    <div className="rounded-xl border border-border bg-inset/70 px-4 py-3">
      <div className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <div className={cn("font-display text-2xl md:text-3xl font-semibold mt-1", c)}>{value}</div>
    </div>
  );
}
