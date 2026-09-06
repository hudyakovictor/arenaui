import { useMemo, useState } from 'react';
import { Slide, Card, Tag, Bar, Kpi } from '../components/ui';
import { roadmap } from '../data/audit';
import { categories, counts, scoreOf, currentScore, targetScore, TOTAL, type Status } from '../data/factors';

export function RoadmapSlide() {
  const [active, setActive] = useState(0);
  const s = roadmap[active];
  const totalWeeks = roadmap.reduce((a, r) => a + r.weeks, 0);
  const W = 640;
  const H = 170;
  const pts = roadmap.map((r, i) => ({
    x: 30 + (i / (roadmap.length - 1)) * (W - 60),
    y: H - 20 - ((r.to - 20) / 80) * (H - 40),
  }));
  const start = { x: 30, y: H - 20 - ((roadmap[0].from - 20) / 80) * (H - 40) };
  const path = [start, ...pts].map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
  return (
    <Slide kicker="13 · Дорожная карта" title={`7 спринтов · ${totalWeeks} недель · 25 → 99`} subtitle="Каждый спринт закрывает конкретные категории чек-листа. Нажми на точку, чтобы увидеть цели спринта.">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card className="overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="#FF596D" />
                <stop offset="0.5" stopColor="#FFB341" />
                <stop offset="1" stopColor="#3BDE8A" />
              </linearGradient>
            </defs>
            {[40, 60, 80, 100].map((v) => {
              const y = H - 20 - ((v - 20) / 80) * (H - 40);
              return (
                <g key={v}>
                  <line x1={30} x2={W - 30} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" />
                  <text x={4} y={y + 4} fill="#64748b" fontSize="10" fontFamily="monospace">
                    {v}
                  </text>
                </g>
              );
            })}
            <path d={path} fill="none" stroke="url(#g)" strokeWidth={3} strokeLinecap="round" />
            {pts.map((p, i) => (
              <g key={i} onClick={() => setActive(i)} className="cursor-pointer">
                <circle cx={p.x} cy={p.y} r={i === active ? 9 : 6} fill={i === active ? '#fff' : '#0b1220'} stroke="#31D6C4" strokeWidth={2} />
                <text x={p.x} y={p.y - 14} textAnchor="middle" fill="#e2e8f0" fontSize="12" fontFamily="monospace" fontWeight={700}>
                  {roadmap[i].to}
                </text>
                <text x={p.x} y={H - 4} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
                  S{roadmap[i].n} · {roadmap[i].weeks}н
                </text>
              </g>
            ))}
          </svg>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {roadmap.map((r, i) => (
              <button
                key={r.n}
                onClick={() => setActive(i)}
                className={`rounded-lg border px-1 py-1.5 text-center font-mono text-[10px] transition ${
                  i === active ? 'border-cyan-400/60 bg-cyan-400/10 text-white' : 'border-white/10 text-slate-400 hover:bg-white/5'
                }`}
              >
                S{r.n}
              </button>
            ))}
          </div>
        </Card>
        <Card accent="#31D6C4" className="flex flex-col">
          <div className="flex items-center justify-between">
            <Tag color="#31D6C4">Спринт {s.n}</Tag>
            <span className="font-mono text-xs text-slate-400">
              {s.weeks} нед. · {s.from} → <span className="text-emerald-400">{s.to}</span>
            </span>
          </div>
          <div className="mt-2 text-lg font-semibold leading-tight text-white">{s.title}</div>
          <ul className="mt-3 space-y-1.5 text-[13px] text-slate-300">
            {s.goals.map((g) => (
              <li key={g} className="flex gap-2">
                <span className="text-cyan-300">▸</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
            {s.cats.map((id) => {
              const c = categories.find((x) => x.id === id)!;
              return (
                <Tag key={id} color={c.color}>
                  {c.icon} {c.short}
                </Tag>
              );
            })}
          </div>
        </Card>
      </div>
    </Slide>
  );
}

export function ChecklistSlide() {
  const [cat, setCat] = useState<string>('all');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [q, setQ] = useState('');
  const [view, setView] = useState<'now' | 'target'>('now');

  const items = useMemo(() => {
    const cats = cat === 'all' ? categories : categories.filter((c) => c.id === cat);
    return cats.flatMap((c) => c.items.map((it, idx) => ({ ...it, cat: c, idx })));
  }, [cat]);

  const filtered = items.filter((it) => {
    const st: Status = view === 'target' ? (it.deferred ? 0 : 2) : it.status;
    if (status !== 'all' && st !== status) return false;
    if (q && !it.text.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const all = categories.flatMap((c) => c.items);
  const k = counts(all);
  const cur = currentScore();
  const tgt = targetScore();
  const catObj = categories.find((c) => c.id === cat);

  return (
    <Slide kicker="14 · Чек-лист" title={`${TOTAL} факторов, по которым считается оценка`} subtitle="Фильтруй по категории и статусу. Переключи «после плана», чтобы увидеть, какие 3 фактора сознательно отложены.">
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Kpi value={cur} label="сейчас" color="#FF596D" />
            <Kpi value={tgt} label="после плана" color="#3BDE8A" />
          </div>
          <div className="flex gap-1 rounded-lg border border-white/10 p-1">
            {(['now', 'target'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 rounded-md py-1.5 text-xs transition ${view === v ? 'bg-cyan-400/20 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {v === 'now' ? 'сейчас' : 'после плана'}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по факторам…"
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/60 focus:outline-none"
          />
          <div className="flex flex-wrap gap-1">
            {([
              ['all', 'все', '#cbd5e1'],
              [2, 'есть', '#3BDE8A'],
              [1, 'частично', '#FFB341'],
              [0, 'нет', '#FF596D'],
            ] as const).map(([v, l, c]) => (
              <button
                key={String(v)}
                onClick={() => setStatus(v as Status | 'all')}
                className="rounded-md border px-2 py-1 font-mono text-[11px] transition"
                style={{
                  borderColor: status === v ? c : 'rgba(255,255,255,0.1)',
                  color: status === v ? c : '#94a3b8',
                  background: status === v ? `${c}18` : 'transparent',
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="max-h-[260px] space-y-1 overflow-y-auto pr-1 lg:max-h-[420px]">
            <button
              onClick={() => setCat('all')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition ${cat === 'all' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <span>Все категории</span>
              <span className="font-mono text-[11px]">{TOTAL}</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition ${cat === c.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}
              >
                <span>{c.icon}</span>
                <span className="flex-1 truncate">{c.short}</span>
                <span className="font-mono text-[11px]" style={{ color: c.color }}>
                  {scoreOf(c.items)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-slate-300">
              {catObj ? (
                <>
                  <span className="mr-2">{catObj.icon}</span>
                  <b>{catObj.title}</b>
                  <span className="ml-2 font-mono text-xs text-slate-500">
                    {counts(catObj.items).ok}/{counts(catObj.items).partial}/{counts(catObj.items).missing}
                  </span>
                </>
              ) : (
                <>
                  Всего: <span className="text-emerald-400">{k.ok} есть</span> · <span className="text-amber-400">{k.partial} частично</span> ·{' '}
                  <span className="text-rose-400">{k.missing} нет</span>
                </>
              )}
            </div>
            <div className="font-mono text-xs text-slate-500">показано {filtered.length}</div>
          </div>
          {catObj && <Bar value={scoreOf(catObj.items)} color={catObj.color} className="mb-3" />}
          <div className="grid max-h-[380px] gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2 lg:max-h-[470px]">
            {filtered.map((it) => {
              const st: Status = view === 'target' ? (it.deferred ? 0 : 2) : it.status;
              const col = st === 2 ? '#3BDE8A' : st === 1 ? '#FFB341' : '#FF596D';
              return (
                <div key={it.cat.id + it.idx} className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-2">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: col, boxShadow: `0 0 6px ${col}` }} />
                  <div className="min-w-0">
                    <div className="text-[13px] leading-snug text-slate-200">{it.text}</div>
                    <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-slate-500">
                      <span>{it.cat.icon} {it.cat.short} · {it.idx + 1}</span>
                      {it.deferred && <span className="text-slate-400">отложено после релиза</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && <div className="col-span-2 py-10 text-center text-sm text-slate-500">Ничего не найдено</div>}
          </div>
        </div>
      </div>
    </Slide>
  );
}

export function DoDSlide() {
  const cur = currentScore();
  const tgt = targetScore();
  const gates = [
    ['Читаемость', 'Ни одного текста < 12 px; lint падает на меньшем значении'],
    ['Чистота', 'Ни одной внутренней метки, debug-кнопки или цитаты ТЗ в UI'],
    ['Стек', 'package.json совпадает с ТЗ или изменение согласовано письменно'],
    ['Детерминизм', 'Один сид → одна задача; тест на 1 000 сидов зелёный'],
    ['Механики', 'M1–M15 без слов «упрощено», «заглушка», «в реальном движке»'],
    ['Мобильность', '360×800 и 430×932 без полос; touch-цели ≥ 44 pt; safe-area'],
    ['Обучение', 'После каждого ответа — разбор; ошибки повторяются по SRS'],
    ['Сервер', 'Скоринг и сид на сервере; клиент работает офлайн и синхронизируется'],
    ['Качество', 'CI зелёный: lint + typecheck + 70 % coverage + e2e + build'],
    ['Релиз', 'PWA устанавливается, Lighthouse ≥ 90, политика и дисклеймер есть'],
  ];
  return (
    <Slide kicker="15 · Definition of Done" title="Как понять, что 99 достигнуто">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-2 sm:grid-cols-2">
          {gates.map(([t, d], i) => (
            <div key={t} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="font-mono text-xs text-emerald-400">{String(i + 1).padStart(2, '0')}</div>
              <div>
                <div className="text-sm font-semibold text-white">{t}</div>
                <div className="mt-0.5 text-[13px] text-slate-400">{d}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Card className="text-center">
            <div className="flex items-center justify-center gap-6">
              <div>
                <div className="font-mono text-5xl font-bold text-rose-400">{cur}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">сейчас</div>
              </div>
              <div className="text-2xl text-slate-600">→</div>
              <div>
                <div className="font-mono text-5xl font-bold text-emerald-400">{tgt}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">цель</div>
              </div>
            </div>
            <div className="mt-3 text-[12px] text-slate-400">
              Последний 1 балл — 3 фактора, которые осознанно откладываются после релиза: store-листинг, visual regression,
              on-chain сертификат Proof of Skill.
            </div>
          </Card>
          <Card accent="#31D6C4">
            <div className="text-sm font-semibold text-white">С чего начать в понедельник</div>
            <ol className="mt-2 space-y-1 text-[13px] text-slate-300">
              <li>1. Prettier по всему phaser/src — код станет читаемым за 5 минут</li>
              <li>2. Найти все fontSize и поднять до шкалы</li>
              <li>3. Удалить createDebugStageSwitcher и дев-подписи</li>
              <li>4. Вынести строки в ru.json</li>
              <li>5. Заменить Date.now() на seedrandom</li>
            </ol>
            <div className="mt-3 font-mono text-[11px] text-cyan-300">≈ 1 неделя → +13 баллов</div>
          </Card>
        </div>
      </div>
    </Slide>
  );
}
