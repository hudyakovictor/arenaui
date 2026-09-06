import { useEffect, useMemo, useRef, useState } from 'react';
import { bugs, type Severity, type Area, SEVERITY_LABEL, AREA_LABEL } from '../data/bugs';
import { AreaBadge, PatchChip, SeverityBadge } from './Badges';

const SEVS: Severity[] = ['critical', 'high', 'medium', 'low'];
const AREAS: Area[] = ['arena', 'engine', 'state', 'config', 'scenes', 'backend'];

export default function BugList({
  focusId,
  onOpenPatch,
}: {
  focusId: string | null;
  onOpenPatch: (id: string) => void;
}) {
  const [sev, setSev] = useState<Set<Severity>>(new Set(SEVS));
  const [area, setArea] = useState<Area | 'all'>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set(focusId ? [focusId] : []));
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!focusId) return;
    setOpen(s => new Set([...s, focusId]));
    setTimeout(() => refs.current[focusId]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }, [focusId]);

  const list = useMemo(
    () =>
      bugs.filter(
        b =>
          sev.has(b.severity) &&
          (area === 'all' || b.area === area) &&
          (q.trim() === '' || (b.title + b.description + b.file + b.id).toLowerCase().includes(q.toLowerCase())),
      ),
    [sev, area, q],
  );

  const toggle = (id: string) =>
    setOpen(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-700/70 bg-[#0C1323] p-3">
        <div className="flex flex-wrap items-center gap-2">
          {SEVS.map(s => {
            const on = sev.has(s);
            return (
              <button
                key={s}
                onClick={() =>
                  setSev(prev => {
                    const n = new Set(prev);
                    n.has(s) ? n.delete(s) : n.add(s);
                    return n;
                  })
                }
                className={`rounded border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition ${
                  on ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-200' : 'border-slate-700 text-slate-500'
                }`}
              >
                {SEVERITY_LABEL[s]} · {bugs.filter(b => b.severity === s).length}
              </button>
            );
          })}
          <span className="mx-1 h-5 w-px bg-slate-700" />
          <select
            value={area}
            onChange={e => setArea(e.target.value as Area | 'all')}
            className="rounded border border-slate-700 bg-[#060A12] px-2 py-1 font-mono text-[11px] text-slate-200"
          >
            <option value="all">все модули</option>
            {AREAS.map(a => (
              <option key={a} value={a}>
                {AREA_LABEL[a]}
              </option>
            ))}
          </select>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="поиск: restart, seed, purchase…"
            className="min-w-[200px] flex-1 rounded border border-slate-700 bg-[#060A12] px-2 py-1 font-mono text-[11px] text-slate-200 placeholder:text-slate-600"
          />
          <button
            onClick={() => setOpen(open.size === list.length ? new Set() : new Set(list.map(b => b.id)))}
            className="rounded border border-slate-700 px-2.5 py-1 font-mono text-[11px] text-slate-400 hover:text-slate-200"
          >
            {open.size === list.length ? 'свернуть все' : 'раскрыть все'}
          </button>
        </div>
      </div>

      <div className="font-mono text-[11px] text-slate-500">
        показано {list.length} из {bugs.length}
      </div>

      <div className="space-y-2">
        {list.map(b => {
          const isOpen = open.has(b.id);
          return (
            <div
              key={b.id}
              ref={el => {
                refs.current[b.id] = el;
              }}
              className={`rounded-lg border bg-[#0C1323] transition ${
                focusId === b.id ? 'border-cyan-400/60 shadow-[0_0_0_1px_rgba(49,214,196,0.3)]' : 'border-slate-700/70'
              }`}
            >
              <button onClick={() => toggle(b.id)} className="flex w-full items-start gap-3 p-3 text-left">
                <span className="mt-0.5 w-9 shrink-0 font-mono text-[11px] text-slate-500">{b.id}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-100">{b.title}</div>
                  <div className="mt-1 truncate font-mono text-[10.5px] text-slate-500">{b.file}</div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                  <SeverityBadge s={b.severity} />
                  <AreaBadge a={b.area} />
                </div>
                <span className={`mt-1 font-mono text-xs text-slate-500 transition ${isOpen ? 'rotate-90' : ''}`}>▶</span>
              </button>
              {isOpen && (
                <div className="border-t border-slate-800 px-3 pb-3 pt-3 md:pl-[60px]">
                  <Row k="Что не так">{b.description}</Row>
                  <Row k="Последствие">{b.impact}</Row>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Патч</span>
                    {b.patchId ? (
                      <PatchChip id={b.patchId} onClick={() => onOpenPatch(b.patchId!)} />
                    ) : (
                      <span className="font-mono text-[11px] text-slate-500">— техдолг, описан в отчёте (раздел 6)</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="mb-2 grid gap-1 md:grid-cols-[110px_1fr]">
      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">{k}</span>
      <p className="text-[13px] leading-relaxed text-slate-300">{children}</p>
    </div>
  );
}
