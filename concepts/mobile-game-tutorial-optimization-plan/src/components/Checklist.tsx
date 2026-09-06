import { useMemo, useState } from 'react';
import { categories, factors, weightOf, type Priority } from '../data/factors';
import { cn } from '../utils/cn';

interface Props {
  done: Set<string>;
  toggle: (id: string) => void;
  setMany: (ids: string[], v: boolean) => void;
  reset: () => void;
}

const prioLabel: Record<Priority, string> = { 0: 'P0', 1: 'P1', 2: 'P2' };
const prioClass: Record<Priority, string> = {
  0: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  1: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  2: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
};

export function Checklist({ done, toggle, setMany, reset }: Props) {
  const [cat, setCat] = useState<number | 0>(0);
  const [prio, setPrio] = useState<Priority | -1>(-1);
  const [q, setQ] = useState('');
  const [hideDone, setHideDone] = useState(false);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return factors.filter(
      (f) =>
        (cat === 0 || f.cat === cat) &&
        (prio === -1 || f.p === prio) &&
        (!hideDone || !done.has(f.id)) &&
        (!s || f.t.toLowerCase().includes(s) || f.id.toLowerCase().includes(s)),
    );
  }, [cat, prio, q, hideDone, done]);

  const grouped = useMemo(() => {
    const m = new Map<number, typeof factors>();
    list.forEach((f) => {
      if (!m.has(f.cat)) m.set(f.cat, []);
      m.get(f.cat)!.push(f);
    });
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [list]);

  return (
    <section id="checklist" className="mx-auto max-w-6xl px-5 py-16">
      <header className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-300">Чек-лист</div>
        <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">{factors.length} факторов = {factors.length} действий</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Вес: P0 = 3, P1 = 2, P2 = 1. Отметки сохраняются в браузере и пересчитывают балл в шапке.
        </p>
      </header>

      {/* category chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Chip active={cat === 0} onClick={() => setCat(0)} color="#e2e8f0">
          Все · {factors.length}
        </Chip>
        {categories.map((c) => {
          const items = factors.filter((f) => f.cat === c.id);
          const d = items.filter((f) => done.has(f.id)).length;
          return (
            <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} color={c.color}>
              {c.icon} {c.short} · {d}/{items.length}
            </Chip>
          );
        })}
      </div>

      {/* controls */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск: seed, Zod, safe-area, M9…"
          className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/50 focus:outline-none"
        />
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs font-bold">
          {([-1, 0, 1, 2] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPrio(p)}
              className={cn(
                'rounded-lg px-3 py-1.5 transition',
                prio === p ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white',
              )}
            >
              {p === -1 ? 'Все' : prioLabel[p]}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
          <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} className="accent-cyan-300" />
          Скрыть закрытые
        </label>
        <button
          onClick={() => setMany(list.map((f) => f.id), true)}
          className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-400/20"
        >
          Отметить видимые ({list.length})
        </button>
        <button
          onClick={() => setMany(list.map((f) => f.id), false)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"
        >
          Снять видимые
        </button>
        <button onClick={reset} className="rounded-xl px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-400/10">
          Сбросить всё
        </button>
      </div>

      {grouped.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-500">Ничего не найдено</div>
      )}

      <div className="space-y-8">
        {grouped.map(([cid, items]) => {
          const c = categories.find((x) => x.id === cid)!;
          const all = factors.filter((f) => f.cat === cid);
          const d = all.filter((f) => done.has(f.id)).length;
          const wAll = all.reduce((s, f) => s + weightOf(f.p), 0);
          const wDone = all.filter((f) => done.has(f.id)).reduce((s, f) => s + weightOf(f.p), 0);
          return (
            <div key={cid} className="rounded-3xl border border-white/10 bg-slate-900/50">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <h3 className="text-lg font-black text-white">{c.name}</h3>
                    <div className="text-xs text-slate-400">
                      {d}/{all.length} закрыто · вклад в балл {((74 * wAll) / factors.reduce((s, f) => s + weightOf(f.p), 0)).toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="h-2 w-40 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(wDone / wAll) * 100}%`, background: c.color }} />
                </div>
              </div>
              <ul className="divide-y divide-white/5">
                {items.map((f) => {
                  const on = done.has(f.id);
                  return (
                    <li key={f.id}>
                      <label className={cn('flex cursor-pointer items-start gap-3 px-5 py-3 transition hover:bg-white/[0.03]', on && 'opacity-60')}>
                        <input type="checkbox" checked={on} onChange={() => toggle(f.id)} className="mt-1 h-4 w-4 shrink-0 accent-cyan-300" />
                        <span className="mt-0.5 shrink-0 font-mono text-[10px] text-slate-500">{f.id}</span>
                        <span className={cn('mt-0.5 shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold', prioClass[f.p])}>
                          {prioLabel[f.p]}
                        </span>
                        <span className={cn('text-sm text-slate-200', on && 'line-through')}>{f.t}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Chip({ active, onClick, color, children }: { active: boolean; onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
        active ? 'border-transparent text-slate-900' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
      )}
      style={active ? { background: color } : undefined}
    >
      {children}
    </button>
  );
}
