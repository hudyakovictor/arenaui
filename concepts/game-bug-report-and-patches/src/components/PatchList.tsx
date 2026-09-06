import { useEffect, useMemo, useRef, useState } from 'react';
import { patches } from '../data/patches';
import { bugs } from '../data/bugs';
import DiffView, { CopyButton } from './DiffView';
import { SeverityBadge } from './Badges';

export default function PatchList({
  focusId,
  onOpenBug,
}: {
  focusId: string | null;
  onOpenBug: (id: string) => void;
}) {
  const [active, setActive] = useState<string>(focusId ?? patches[0].id);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (focusId) {
      setActive(focusId);
      refs.current[focusId]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusId]);

  const patch = patches.find(p => p.id === active) ?? patches[0];
  const fixed = useMemo(() => bugs.filter(b => patch.fixes.includes(b.id)), [patch]);
  const allDiffs = useMemo(() => patches.map(p => `# ${p.id} — ${p.title}\n${p.diff}`).join('\n\n'), []);

  const download = () => {
    const blob = new Blob([allDiffs], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'arena20-patches.diff';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-[#0C1323] p-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">{patches.length} патчей</span>
          <button onClick={download} className="font-mono text-[11px] text-cyan-300 hover:underline">
            ↓ скачать все .diff
          </button>
        </div>
        <div className="max-h-[70vh] space-y-1 overflow-y-auto pr-1">
          {patches.map(p => {
            const on = p.id === active;
            const worst = bugs.filter(b => p.fixes.includes(b.id)).map(b => b.severity);
            const sev = worst.includes('critical') ? 'critical' : worst.includes('high') ? 'high' : worst.includes('medium') ? 'medium' : 'low';
            return (
              <button
                key={p.id}
                ref={el => {
                  refs.current[p.id] = el;
                }}
                onClick={() => setActive(p.id)}
                className={`flex w-full flex-col gap-1 rounded-lg border p-3 text-left transition ${
                  on ? 'border-cyan-400/60 bg-cyan-400/5' : 'border-slate-700/70 bg-[#0C1323] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-mono text-[11px] ${on ? 'text-cyan-300' : 'text-slate-400'}`}>{p.id}</span>
                  <SeverityBadge s={sev} />
                </div>
                <span className="text-[12.5px] leading-snug text-slate-200">{p.title}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="space-y-4">
        <div className="rounded-lg border border-slate-700/70 bg-[#0C1323] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-mono text-[11px] text-cyan-300">{patch.id}</div>
              <h2 className="text-lg font-semibold text-slate-100">{patch.title}</h2>
            </div>
            <CopyButton text={patch.diff} label="Копировать diff" />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-slate-300">{patch.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {patch.files.map(f => (
              <span key={f} className="rounded border border-slate-700 bg-[#060A12] px-2 py-0.5 font-mono text-[10.5px] text-slate-400">
                {f}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Закрывает</span>
            {fixed.map(b => (
              <button
                key={b.id}
                onClick={() => onOpenBug(b.id)}
                className="inline-flex items-center gap-1.5 rounded border border-slate-600/60 px-2 py-0.5 font-mono text-[10.5px] text-slate-300 transition hover:border-cyan-400/50 hover:text-cyan-200"
                title={b.title}
              >
                {b.id} <span className="max-w-[220px] truncate text-slate-500">{b.title}</span>
              </button>
            ))}
          </div>
        </div>
        <DiffView diff={patch.diff} />
        <p className="font-mono text-[10.5px] leading-relaxed text-slate-500">
          Диффы написаны относительно ветки main; строки с «...» обозначают неизменённый код. Применять как ориентир при ручном переносе — из-за однострочного форматирования исходников{' '}
          <code>git apply</code> не отработает без переформатирования.
        </p>
      </main>
    </div>
  );
}
