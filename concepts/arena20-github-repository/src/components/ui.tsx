import { useEffect, useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "../utils/cn";

/* ---------- Buttons ---------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "acid" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  full?: boolean;
};

export function Button({ variant = "acid", size = "md", full, className, children, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={cn(
        "press inline-flex items-center justify-center gap-2 rounded-2xl font-display font-semibold uppercase tracking-wide transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
        size === "sm" && "h-9 px-3 text-xs",
        size === "md" && "h-12 px-5 text-sm",
        size === "lg" && "h-14 px-6 text-base",
        variant === "acid" && "bg-acid text-ink shadow-[0_0_0_1px_#c8ff00,0_0_18px_rgba(200,255,0,0.35)] hover:bg-[#d6ff33]",
        variant === "ghost" && "bg-elevated text-text border border-line hover:bg-hover",
        variant === "outline" && "bg-transparent text-text border border-line-strong hover:border-acid hover:text-acid",
        variant === "danger" && "bg-bad text-white shadow-[0_0_18px_rgba(255,77,94,0.35)] hover:bg-[#ff6572]",
        full && "w-full",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ---------- Tag ---------- */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.08em]", className)}>
      {children}
    </span>
  );
}

/* ---------- Progress ---------- */
export function Progress({ value, className, color = "bg-acid", track = "bg-ink" }: { value: number; className?: string; color?: string; track?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full", track, className)}>
      <div className={cn("h-full rounded-full transition-all duration-500 ease-out", color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

/* ---------- Section headline (tabloid style) ---------- */
export function Headline({ kicker, title, sub, className }: { kicker?: string; title: string; sub?: string; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      {kicker && <div className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-acid">{kicker}</div>}
      <h1 className="stencil text-[26px] leading-[1.05] text-text sm:text-[30px]">{title}</h1>
      {sub && <p className="text-[13px] leading-snug text-sub">{sub}</p>}
    </div>
  );
}

/* ---------- Modal with fullscreen expand ---------- */
export function Modal({
  open,
  onClose,
  title,
  kicker,
  children,
  expandable = false,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  kicker?: string;
  children: ReactNode;
  expandable?: boolean;
  footer?: ReactNode;
}) {
  const [full, setFull] = useState(false);
  useEffect(() => {
    if (!open) setFull(false);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative flex flex-col overflow-hidden bg-surface border border-line shadow-2xl transition-all duration-300 animate-slide-in",
          full ? "h-[100dvh] w-full rounded-none" : "max-h-[92dvh] w-full max-w-[560px] rounded-t-3xl sm:rounded-3xl"
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            {kicker && <div className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-acid">{kicker}</div>}
            {title && <div className="stencil truncate text-xl">{title}</div>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {expandable && (
              <button onClick={() => setFull((f) => !f)} className="press rounded-xl border border-line bg-elevated p-2 text-sub hover:text-acid" title={full ? "Свернуть" : "Развернуть"}>
                {full ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            )}
            <button onClick={onClose} className="press rounded-xl border border-line bg-elevated p-2 text-sub hover:text-bad" title="Закрыть">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className={cn("flex-1 overflow-y-auto px-5 py-4", full && "mx-auto w-full max-w-3xl")}>{children}</div>
        {footer && <div className="border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Toast ---------- */
export function Toast({ message, tone = "acid" }: { message: string | null; tone?: "acid" | "bad" | "gold" }) {
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div
        className={cn(
          "animate-pop rounded-2xl border px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide shadow-2xl",
          tone === "acid" && "border-acid/60 bg-ink text-acid",
          tone === "bad" && "border-bad/60 bg-ink text-bad",
          tone === "gold" && "border-gold/60 bg-ink text-gold"
        )}
      >
        {message}
      </div>
    </div>
  );
}

/* ---------- Stat chip ---------- */
export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="card-inset px-3 py-2">
      <div className="font-display text-[10px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className={cn("font-display text-lg font-semibold leading-tight", tone)}>{value}</div>
    </div>
  );
}

/* ---------- Animated number ---------- */
export function useCountUp(target: number, duration = 700) {
  const [v, setV] = useState(target);
  useEffect(() => {
    const from = v;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return v;
}
