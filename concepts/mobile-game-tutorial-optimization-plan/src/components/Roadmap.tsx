import { sprints } from '../data/sprints';
import { categories } from '../data/factors';

export function Roadmap() {
  return (
    <section id="roadmap" className="mx-auto max-w-6xl px-5 py-16">
      <header className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Дорожная карта</div>
        <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">7 спринтов, каждый со своим gate</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Порядок не случайный: сначала то, что даёт максимум баллов на единицу усилия и разблокирует всё
          остальное — единый движок и мост к API. Без них любой контент и UX повисают в воздухе.
        </p>
      </header>

      {/* score curve */}
      <div className="mb-10 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wider text-slate-400">
          <span>Целевой балл после спринта</span>
          <span>25 → 99</span>
        </div>
        <div className="flex items-end gap-2">
          {[{ n: -1, target: 25, title: 'Сейчас' }, ...sprints].map((s) => (
            <div key={s.n} className="flex flex-1 flex-col items-center gap-2">
              <div className="font-mono text-sm font-bold text-white">{s.target}</div>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-amber-500/40 via-pink-500/50 to-cyan-400/70"
                style={{ height: `${s.target * 1.4}px` }}
              />
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                {s.n < 0 ? 'старт' : `S${s.n}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ol className="relative space-y-6 border-l border-white/10 pl-6 md:pl-10">
        {sprints.map((s) => (
          <li key={s.n} className="relative">
            <span className="absolute -left-[31px] top-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-950 bg-gradient-to-br from-amber-300 to-pink-500 text-[10px] font-black text-slate-900 md:-left-[47px]">
              {s.n}
            </span>
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Спринт {s.n} · {s.weeks}
                  </div>
                  <h3 className="mt-1 text-2xl font-black text-white">{s.title}</h3>
                </div>
                <div className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-right">
                  <div className="text-[10px] uppercase tracking-wider text-cyan-200">цель</div>
                  <div className="font-mono text-2xl font-black text-cyan-200">{s.target}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.cats.map((c) => {
                  const cat = categories.find((x) => x.id === c)!;
                  return (
                    <span
                      key={c}
                      className="rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ background: `${cat.color}22`, color: cat.color }}
                    >
                      {cat.icon} {cat.short}
                    </span>
                  );
                })}
              </div>
              <ul className="mt-4 grid gap-2 md:grid-cols-2">
                {s.goals.map((g) => (
                  <li key={g} className="flex gap-2 text-sm text-slate-200">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                    {g}
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-200">
                <span className="font-bold">Gate: </span>
                {s.gate}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
