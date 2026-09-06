import { useState } from 'react';
import { Slide, Card, Tag, Bar, Score, Code, Kpi } from '../components/ui';
import { categories, currentScore, targetScore, counts, scoreOf, TOTAL } from '../data/factors';
import { evidence, stackTable } from '../data/audit';

export function TitleSlide() {
  const cur = currentScore();
  const tgt = targetScore();
  return (
    <Slide className="justify-center">
      <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Tag color="#31D6C4">Signal Arena</Tag>
            <Tag>github.com/hudyakovictor/arena20</Tag>
            <Tag color="#FFB341">аудит + план</Tag>
          </div>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Почему <span className="text-rose-400">25</span>
            <br />
            и как дойти до <span className="text-emerald-400">99</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-slate-300 sm:text-lg">
            Разбор кода обучающей мобильной игры Signal Arena: 10 корневых причин низкой оценки, план из 7 спринтов
            и чек-лист из {TOTAL} факторов, по которому можно проверять каждый шаг.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
            <Kpi value={14} label="категорий" />
            <Kpi value={TOTAL} label="факторов" />
            <Kpi value="13 нед." label="до 99" color="#3BDE8A" />
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-10 rounded-full bg-cyan-500/10 blur-3xl" />
          <Card className="relative flex items-center justify-around py-8">
            <Score value={cur} label="сейчас" color="#FF596D" size="xl" />
            <div className="font-mono text-3xl text-slate-500">→</div>
            <Score value={tgt} label="цель" color="#3BDE8A" size="xl" />
          </Card>
          <p className="mt-3 text-center font-mono text-[11px] text-slate-500">
            оба числа вычислены из чек-листа на слайде 16 · внешняя оценка 25/100 подтверждается
          </p>
        </div>
      </div>
    </Slide>
  );
}

const rootCauses = [
  { n: '01', t: 'Текст нечитаем', d: 'Шрифты 5–8 px на экране 390 px. Игрок не видит улики, ставки и награды.', c: '#FF596D' },
  { n: '02', t: 'Стек не по ТЗ', d: 'Phaser 4 вместо 3, нет rexUI, Zustand, seedrandom, PWA, Vitest, Playwright.', c: '#FF596D' },
  { n: '03', t: 'Черновик в проде', d: 'Кнопка LVL+8, подписи «M3», «ТЗ Часть 3», «силуэт 5–8% rim» видны игроку.', c: '#FF596D' },
  { n: '04', t: 'Заглушки в механиках', d: 'M2 «упрощено», M6 — прямоугольники, M8 — комментарий, M14 — хардкод, M15 — нет.', c: '#FFB341' },
  { n: '05', t: 'Детерминизм сломан', d: 'Date.now() в сиде. Задачу нельзя воспроизвести, проверить или оспорить.', c: '#FFB341' },
  { n: '06', t: 'Клиент без сервера', d: '36 роутов и WS написаны, но не вызываются. Прогресс подделывается в localStorage.', c: '#FFB341' },
  { n: '07', t: 'God-scene', d: 'ArenaScene ≈ 1 000 строк в одну строку, рисует поверх, дублирует код 5×.', c: '#FFB341' },
  { n: '08', t: 'Не мобильно', d: 'Фиксированный холст 390×844, FIT с полосами, touch-цели 8–16 px, нет safe-area.', c: '#59A7FF' },
  { n: '09', t: 'Нет обучения', d: 'После ошибки — одна строка. Нет объяснения, повторения, глоссария, прогресса навыков.', c: '#59A7FF' },
  { n: '10', t: 'Ноль тестов и CI', d: 'Ни одного теста, нет lint, нет пайплайна. Регрессии никто не ловит.', c: '#59A7FF' },
];

export function DiagnosisSlide() {
  return (
    <Slide kicker="01 · Диагноз" title="10 корневых причин оценки 25/100" subtitle="Каждая подтверждается конкретной строкой кода в репозитории — см. следующие слайды. Красное — снимает баллы сразу у любого оценщика, оранжевое — ломает продукт, синее — не даёт вырасти выше 60.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {rootCauses.map((r) => (
          <Card key={r.n} accent={r.c} className="flex flex-col">
            <div className="font-mono text-xs" style={{ color: r.c }}>
              {r.n}
            </div>
            <div className="mt-1 text-base font-semibold text-white">{r.t}</div>
            <div className="mt-2 text-[13px] leading-snug text-slate-400">{r.d}</div>
          </Card>
        ))}
      </div>
    </Slide>
  );
}

export function ScorecardSlide() {
  const cur = currentScore();
  return (
    <Slide kicker="02 · Скоркард" title="14 категорий: где теряются баллы" subtitle={`Сплошная полоса — текущий счёт категории (по 25 факторам), пунктир — цель после плана. Итог: ${cur}/100.`}>
      <div className="grid gap-x-8 gap-y-3 lg:grid-cols-2">
        {categories.map((c) => {
          const s = scoreOf(c.items);
          const k = counts(c.items);
          const tgt = Math.round((c.items.filter((i) => !i.deferred).length / c.items.length) * 100);
          return (
            <div key={c.id} className="flex items-center gap-3">
              <div className="w-7 text-center text-lg">{c.icon}</div>
              <div className="w-36 shrink-0 truncate text-sm text-slate-200 sm:w-52">{c.title}</div>
              <Bar value={s} ghost={tgt} color={c.color} className="flex-1" />
              <div className="w-10 text-right font-mono text-sm tabular-nums" style={{ color: c.color }}>
                {s}
              </div>
              <div className="hidden w-28 shrink-0 font-mono text-[11px] text-slate-500 sm:block">
                <span className="text-emerald-400">{k.ok}</span> · <span className="text-amber-400">{k.partial}</span> ·{' '}
                <span className="text-rose-400">{k.missing}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-4 font-mono text-[11px] text-slate-500">
        <span><span className="text-emerald-400">●</span> выполнено (1 балл)</span>
        <span><span className="text-amber-400">●</span> частично (0.5)</span>
        <span><span className="text-rose-400">●</span> отсутствует (0)</span>
        <span>Тесты/CI = 2 и Backend-интеграция = 24 тянут итог сильнее всего</span>
      </div>
    </Slide>
  );
}

export function EvidenceSlide() {
  const [i, setI] = useState(0);
  const e = evidence[i];
  return (
    <Slide kicker="03 · Улики из кода" title="Не мнение, а строки из репозитория" subtitle="Выбери улику слева — справа проблема, решение и на какие категории она влияет.">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {evidence.map((ev, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition lg:shrink ${
                idx === i ? 'border-cyan-400/60 bg-cyan-400/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <div className="font-mono text-[10px] text-slate-500">{ev.file.split('/').pop()}</div>
              <div className="line-clamp-1 max-w-[220px] font-mono text-xs text-amber-200/90 lg:max-w-none">{ev.code.split('\n')[0]}</div>
            </button>
          ))}
        </div>
        <Card className="flex flex-col gap-4">
          <div className="font-mono text-[11px] text-slate-500">{e.file}</div>
          <Code>{e.code}</Code>
          <div>
            <div className="mb-1 font-mono text-[11px] uppercase tracking-widest text-rose-400">Проблема</div>
            <p className="text-sm leading-relaxed text-slate-200 sm:text-base">{e.problem}</p>
          </div>
          <div>
            <div className="mb-1 font-mono text-[11px] uppercase tracking-widest text-emerald-400">Решение</div>
            <p className="text-sm leading-relaxed text-slate-200 sm:text-base">{e.fix}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {e.impact.split(', ').map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </Card>
      </div>
    </Slide>
  );
}

export function StackSlide() {
  return (
    <Slide kicker="04 · Стек" title="ТЗ vs реальность" subtitle="Оценщик сверяет package.json с ТЗ первым делом. Из 9 пунктов стека совпадает один — и тот не подключён к клиенту.">
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] font-mono text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">Требование ТЗ</th>
              <th className="px-4 py-3">В репозитории</th>
              <th className="hidden px-4 py-3 md:table-cell">Комментарий</th>
              <th className="px-4 py-3 text-right">Статус</th>
            </tr>
          </thead>
          <tbody>
            {stackTable.map((r) => (
              <tr key={r.req} className="border-t border-white/5">
                <td className="px-4 py-2.5 text-slate-100">{r.req}</td>
                <td className="px-4 py-2.5 font-mono text-[13px] text-amber-200/90">{r.actual}</td>
                <td className="hidden px-4 py-2.5 text-slate-400 md:table-cell">{r.note}</td>
                <td className="px-4 py-2.5 text-right">
                  {r.ok ? <Tag color="#3BDE8A">есть</Tag> : <Tag color="#FF596D">нет</Tag>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card className="mt-4 border-amber-400/30 bg-amber-400/5">
        <div className="text-sm text-amber-100">
          <b>Решение по движку.</b> Phaser 4 вышел недавно, rexUI и большинство плагинов с ним не работают. Два пути:{' '}
          <b>(A)</b> откатиться на Phaser 3.80 и взять rexUI — быстро закрывает 2 категории; <b>(B)</b> оставить Phaser 4,
          но письменно согласовать изменение ТЗ и написать свой UI-kit. Рекомендация — A: меньше риска, больше готовых
          компонентов, точное попадание в ТЗ.
        </div>
      </Card>
    </Slide>
  );
}
