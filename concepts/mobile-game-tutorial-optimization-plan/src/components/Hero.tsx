import { ScoreRing } from './ScoreRing';
import { categories, factors } from '../data/factors';

interface Props {
  score: number;
  count: number;
  total: number;
}

export function Hero({ score, count, total }: Props) {
  const p0 = factors.filter((f) => f.p === 0).length;
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.18),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.15),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1fr_auto] md:items-center md:py-20">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
            hudyakovictor/arena20 · Signal Arena
          </div>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl">
            План действий
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
              25 → 99 баллов
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            {total} конкретных действий в {categories.length} направлениях, 7 спринтов на 12 недель.
            Никаких описаний проблем — только что сделать, где и с каким критерием готовности.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center sm:max-w-md">
            <Stat n={total} label="действий" />
            <Stat n={p0} label="критичных P0" />
            <Stat n={count} label="закрыто вами" />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#roadmap" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-200">
              Дорожная карта
            </a>
            <a href="#checklist" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
              Чек-лист 350
            </a>
            <a href="#brief" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
              Текст на 10 000 знаков
            </a>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 justify-self-center">
          <ScoreRing score={score} />
          <div className="text-center text-sm text-slate-400">
            Текущая оценка по чек-листу.
            <br />
            Отмечайте пункты — балл растёт.
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4">
      <div className="font-mono text-3xl font-black text-white">{n}</div>
      <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  );
}
