import { Hero } from './components/Hero';
import { Roadmap } from './components/Roadmap';
import { Checklist } from './components/Checklist';
import { Brief } from './components/Brief';
import { useDone } from './hooks/useDone';
import { categories, factors } from './data/factors';

const quickWinIds = [
  'F002', 'F016', 'F026', 'F029', 'F030', 'F031', 'F034', 'F051', 'F076', 'F082',
  'F083', 'F084', 'F126', 'F127', 'F151', 'F152', 'F153', 'F201', 'F202', 'F226',
];

export default function App() {
  const { done, toggle, setMany, reset, score, total, count } = useDone();
  const quick = factors.filter((f) => quickWinIds.includes(f.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-300 selection:text-slate-900">
      {/* sticky score bar */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2.5">
          <div className="flex items-center gap-2 text-sm font-black tracking-tight text-white">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-amber-300 to-pink-500" />
            SIGNAL ARENA · 25 → 99
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden h-1.5 w-40 overflow-hidden rounded-full bg-white/10 sm:block">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 transition-all duration-500"
                style={{ width: `${score}%` }}
              />
            </div>
            <div className="font-mono text-sm font-black tabular-nums text-white">
              {score.toFixed(1)} <span className="text-slate-500">/ 100</span>
            </div>
            <div className="hidden text-xs text-slate-400 sm:block">
              {count}/{total}
            </div>
          </div>
        </div>
      </div>

      <Hero score={score} count={count} total={total} />

      {/* categories overview */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">14 направлений</div>
        <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">Куда идут 350 действий</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const items = factors.filter((f) => f.cat === c.id);
            const d = items.filter((f) => done.has(f.id)).length;
            const p0 = items.filter((f) => f.p === 0).length;
            return (
              <a
                key={c.id}
                href="#checklist"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{c.icon}</span>
                  <span className="font-mono text-xs text-slate-500">
                    {d}/{items.length}
                  </span>
                </div>
                <div className="mt-3 font-bold text-white">{c.name}</div>
                <div className="mt-1 text-xs text-slate-400">{p0} критичных P0</div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full" style={{ width: `${(d / items.length) * 100}%`, background: c.color }} />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* quick wins */}
      <section className="mx-auto max-w-6xl px-5 pb-6">
        <div className="rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-400/10 via-transparent to-cyan-300/10 p-6 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">Первые 20 действий</div>
              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Максимум баллов за первые 2 недели</h2>
            </div>
            <button
              onClick={() => setMany(quickWinIds, true)}
              className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-amber-200"
            >
              Отметить все 20
            </button>
          </div>
          <ol className="mt-6 grid gap-2 md:grid-cols-2">
            {quick.map((f, i) => {
              const c = categories.find((x) => x.id === f.cat)!;
              const on = done.has(f.id);
              return (
                <li key={f.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2.5 hover:border-white/15">
                    <input type="checkbox" checked={on} onChange={() => toggle(f.id)} className="mt-1 accent-amber-300" />
                    <span className="font-mono text-xs font-black text-amber-300">{String(i + 1).padStart(2, '0')}</span>
                    <span className={on ? 'text-sm text-slate-400 line-through' : 'text-sm text-slate-200'}>
                      <span className="mr-1.5 rounded px-1 text-[10px] font-bold" style={{ background: `${c.color}22`, color: c.color }}>
                        {c.short}
                      </span>
                      {f.t}
                    </span>
                  </label>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <Roadmap />
      <Checklist done={done} toggle={toggle} setMany={setMany} reset={reset} />
      <Brief />

      <footer className="border-t border-white/5 px-5 py-10 text-center text-xs text-slate-500">
        План составлен по коду репозитория hudyakovictor/arena20: phaser/ (12 сцен, M1–M15), backend/aibackend (36 роутов, автотест контента),
        README, USERFLOW, ART_SPEC. Веса факторов: P0 = 3, P1 = 2, P2 = 1.
      </footer>
    </div>
  );
}
