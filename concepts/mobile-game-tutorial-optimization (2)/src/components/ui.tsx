import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export function Slide({
  children,
  className,
  kicker,
  title,
  subtitle,
}: {
  children?: ReactNode;
  className?: string;
  kicker?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <section className={cn('mx-auto flex h-full w-full max-w-7xl flex-col px-5 py-6 sm:px-10 sm:py-8', className)}>
      {(kicker || title) && (
        <header className="mb-5 shrink-0 sm:mb-7">
          {kicker && (
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-300/80">{kicker}</div>
          )}
          {title && (
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl">{title}</h2>
          )}
          {subtitle && <p className="mt-2 max-w-3xl text-sm text-slate-400 sm:text-base">{subtitle}</p>}
        </header>
      )}
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

export function Card({
  children,
  className,
  accent,
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <div
      className={cn('relative rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm sm:p-5', className)}
      style={accent ? { boxShadow: `inset 3px 0 0 ${accent}` } : undefined}
    >
      {children}
    </div>
  );
}

export function Tag({ children, color, className }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider',
        className,
      )}
      style={{
        borderColor: color ? `${color}55` : 'rgba(255,255,255,0.15)',
        color: color ?? '#cbd5e1',
        background: color ? `${color}14` : 'rgba(255,255,255,0.04)',
      }}
    >
      {children}
    </span>
  );
}

export function StatusDot({ status }: { status: 0 | 1 | 2 }) {
  const map = {
    0: { bg: '#FF596D', label: 'нет' },
    1: { bg: '#FFB341', label: 'частично' },
    2: { bg: '#3BDE8A', label: 'есть' },
  } as const;
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
      <span className="h-2 w-2 rounded-full" style={{ background: map[status].bg, boxShadow: `0 0 8px ${map[status].bg}` }} />
      {map[status].label}
    </span>
  );
}

export function Bar({
  value,
  color = '#31D6C4',
  className,
  ghost,
}: {
  value: number;
  color?: string;
  className?: string;
  ghost?: number;
}) {
  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-white/10', className)}>
      {ghost !== undefined && (
        <div
          className="absolute inset-y-0 left-0 rounded-full border border-dashed border-white/25"
          style={{ width: `${ghost}%` }}
        />
      )}
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, background: color, boxShadow: `0 0 12px ${color}88` }}
      />
    </div>
  );
}

export function Score({ value, label, color = '#31D6C4', size = 'lg' }: { value: number; label: string; color?: string; size?: 'lg' | 'xl' }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn('font-mono font-bold leading-none tabular-nums', size === 'xl' ? 'text-7xl sm:text-9xl' : 'text-5xl sm:text-7xl')}
        style={{ color, textShadow: `0 0 40px ${color}66` }}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">{label}</div>
    </div>
  );
}

export function Code({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <pre
      className={cn(
        'overflow-x-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-[12px] leading-relaxed text-amber-200/90',
        className,
      )}
    >
      {children}
    </pre>
  );
}

export function Kpi({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className="font-mono text-2xl font-bold tabular-nums sm:text-3xl" style={{ color: color ?? '#fff' }}>
        {value}
      </div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </div>
  );
}
