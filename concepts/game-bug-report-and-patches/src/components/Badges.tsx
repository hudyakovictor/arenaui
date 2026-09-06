import type { Severity, Area } from '../data/bugs';
import { SEVERITY_LABEL, AREA_LABEL } from '../data/bugs';

export const SEV_STYLE: Record<Severity, string> = {
  critical: 'bg-rose-500/15 text-rose-300 border-rose-400/40',
  high: 'bg-amber-500/15 text-amber-300 border-amber-400/40',
  medium: 'bg-sky-500/15 text-sky-300 border-sky-400/40',
  low: 'bg-slate-500/15 text-slate-300 border-slate-400/40',
};

export const SEV_DOT: Record<Severity, string> = {
  critical: 'bg-rose-400',
  high: 'bg-amber-400',
  medium: 'bg-sky-400',
  low: 'bg-slate-400',
};

export function SeverityBadge({ s }: { s: Severity }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${SEV_STYLE[s]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${SEV_DOT[s]}`} />
      {SEVERITY_LABEL[s]}
    </span>
  );
}

export function AreaBadge({ a }: { a: Area }) {
  return (
    <span className="inline-flex items-center rounded border border-slate-600/60 bg-slate-800/40 px-2 py-0.5 font-mono text-[10px] text-slate-300">
      {AREA_LABEL[a]}
    </span>
  );
}

export function PatchChip({ id, onClick }: { id: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center rounded border border-cyan-400/40 bg-cyan-400/10 px-2 py-0.5 font-mono text-[10px] text-cyan-300 transition hover:bg-cyan-400/20"
    >
      ⤳ {id}
    </button>
  );
}
