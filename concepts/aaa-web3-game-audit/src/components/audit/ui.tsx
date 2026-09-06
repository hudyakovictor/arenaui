export const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pass: { label: "PASS", color: "text-success", bg: "bg-success/15 ring-success/40" },
  warn: { label: "WARN", color: "text-warn", bg: "bg-warn/15 ring-warn/40" },
  fail: { label: "FAIL", color: "text-danger", bg: "bg-danger/15 ring-danger/40" },
  manual: { label: "MANUAL", color: "text-manual", bg: "bg-manual/15 ring-manual/40" },
};

export const SEVERITY_META: Record<string, { label: string; cls: string }> = {
  critical: { label: "CRITICAL", cls: "bg-danger text-bg" },
  high: { label: "HIGH", cls: "bg-warn text-bg" },
  medium: { label: "MEDIUM", cls: "bg-primary/80 text-white" },
  low: { label: "LOW", cls: "bg-surface-2 text-muted ring-1 ring-line" },
};

export const RESOLUTION_META: Record<string, { label: string; cls: string }> = {
  open: { label: "Открыто", cls: "text-muted" },
  in_progress: { label: "В работе", cls: "text-cyan" },
  fixed: { label: "Исправлено", cls: "text-success" },
  accepted: { label: "Принят риск", cls: "text-manual" },
};

export function scoreColor(score: number): string {
  if (score >= 80) return "#3ddc97";
  if (score >= 55) return "#ffb347";
  if (score >= 30) return "#ff7a59";
  return "#ff4d6d";
}

export function scoreGrade(score: number): string {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "F";
}

export function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.manual;
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider ring-1 ${m.bg} ${m.color}`}>
      {m.label}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const m = SEVERITY_META[severity] ?? SEVERITY_META.low;
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider ${m.cls}`}>{m.label}</span>;
}

export function ScoreRing({ score, size = 140, label }: { score: number; size?: number; label?: string }) {
  const color = scoreColor(score);
  return (
    <div
      className="ring-score relative grid place-items-center rounded-full"
      style={{ width: size, height: size, ["--ring-value" as string]: score, ["--ring-color" as string]: color }}
      role="img"
      aria-label={`Оценка ${score} из 100`}
    >
      <div className="grid place-items-center rounded-full bg-surface" style={{ width: size - 18, height: size - 18 }}>
        <div className="text-center">
          <div className="font-mono text-4xl font-black leading-none" style={{ color }}>
            {score}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">{label ?? `grade ${scoreGrade(score)}`}</div>
        </div>
      </div>
    </div>
  );
}

export function Bar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5" aria-hidden="true">
      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${value}%`, background: color ?? scoreColor(value) }} />
    </div>
  );
}
