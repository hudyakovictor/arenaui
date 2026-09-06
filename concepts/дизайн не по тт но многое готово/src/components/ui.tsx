import { useEffect, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { IconX } from "./icons";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "gold" | "outline"; size?: "md" | "lg" | "sm" };
export function Button({ className, variant = "primary", size = "md", ...p }: BtnProps) {
  return (
    <button
      className={cn(
        "press inline-flex items-center justify-center gap-2 rounded-2xl font-display font-bold uppercase tracking-wide",
        size === "lg" && "h-14 px-6 text-[18px]",
        size === "md" && "h-12 px-5 text-[16px]",
        size === "sm" && "h-9 px-3 text-[13px] rounded-xl",
        variant === "primary" && "bg-acid text-ink shadow-[0_6px_0_#7fa300,0_0_20px_rgba(200,255,0,0.25)] active:shadow-[0_2px_0_#7fa300] active:translate-y-[3px]",
        variant === "gold" && "bg-gold text-ink shadow-[0_6px_0_#a8831f] active:shadow-[0_2px_0_#a8831f] active:translate-y-[3px]",
        variant === "danger" && "bg-bad text-white shadow-[0_6px_0_#9a1f2b] active:shadow-[0_2px_0_#9a1f2b] active:translate-y-[3px]",
        variant === "ghost" && "bg-elevated text-text border border-line-strong",
        variant === "outline" && "border-2 border-acid text-acid bg-transparent",
        className,
      )}
      {...p}
    />
  );
}

export function Card({ className, acid, gold, cyan, bad, children, ...p }: HTMLAttributes<HTMLDivElement> & { acid?: boolean; gold?: boolean; cyan?: boolean; bad?: boolean }) {
  return (
    <div
      className={cn(
        "card p-4",
        acid && "border-acid/70 shadow-[0_0_0_1px_rgba(200,255,0,0.45),0_0_18px_rgba(200,255,0,0.18)]",
        gold && "border-gold/70 shadow-[0_0_0_1px_rgba(245,197,66,0.4),0_0_16px_rgba(245,197,66,0.15)]",
        cyan && "border-cyan/70 shadow-[0_0_0_1px_rgba(69,224,208,0.4),0_0_16px_rgba(69,224,208,0.15)]",
        bad && "border-bad/70 shadow-[0_0_0_1px_rgba(255,77,94,0.4),0_0_16px_rgba(255,77,94,0.15)]",
        className,
      )}
      {...p}
    >
      {children}
    </div>
  );
}

export function Chip({ active, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "press h-9 rounded-full border-2 px-4 font-display text-[14px] font-semibold uppercase whitespace-nowrap",
        active ? "border-acid text-acid shadow-acid-soft bg-acid/5" : "border-line-strong text-sub",
        className,
      )}
      {...p}
    />
  );
}

export function Tag({ className, color = "bg-elevated text-sub", children }: { className?: string; color?: string; children: ReactNode }) {
  return <span className={cn("inline-block rounded px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider", color, className)}>{children}</span>;
}

export function Avatar({ emoji, size = 40, ring, className }: { emoji: string; size?: number; ring?: string; className?: string }) {
  return (
    <div style={{ width: size, height: size, fontSize: size * 0.5 }} className={cn("flex shrink-0 items-center justify-center rounded-full border-2 bg-elevated", ring ?? "border-line-strong", className)}>
      {emoji}
    </div>
  );
}

export function Bar({ pct, color = "bg-acid", className, animate }: { pct: number; color?: string; className?: string; animate?: boolean }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-line", className)}>
      <div className={cn("h-full rounded-full transition-[width] duration-700 ease-out", color, animate && "bar-fill")} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("font-display text-[12px] font-bold uppercase tracking-[0.14em] text-muted", className)}>{children}</p>;
}

export function Sheet({ open, onClose, title, children, full }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; full?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-ink/75 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn("sheet-in relative w-full rounded-t-3xl border-t border-line-strong bg-bg", full ? "h-[96%]" : "max-h-[88%]")}>
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-line-strong" />
        <div className="flex items-center justify-between px-4 pt-2 pb-2">
          <p className="stencil text-[20px] text-text">{title}</p>
          <button onClick={onClose} className="press flex h-9 w-9 items-center justify-center rounded-full bg-elevated text-sub"><IconX size={18} /></button>
        </div>
        <div className={cn("overflow-y-auto px-4 pb-8", full ? "h-[calc(100%-64px)]" : "max-h-[calc(88dvh-72px)]")}>{children}</div>
      </div>
    </div>
  );
}

export function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-[60] flex justify-center px-4">
      <div className="pop rounded-2xl border border-acid bg-ink/95 px-4 py-3 text-center font-display text-[15px] font-semibold uppercase text-acid shadow-acid-soft">{msg}</div>
    </div>
  );
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="card-inset p-3 text-center">
      <p className={cn("stencil text-[22px] leading-none text-text", tone)}>{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}

export function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= n ? "#f5c542" : "none"} stroke={i <= n ? "#f5c542" : "#454b55"} strokeWidth="2">
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.6L12 17.4 6.1 20.6l1.2-6.6L2.5 9.4l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
}
