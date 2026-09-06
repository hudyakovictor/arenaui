import { useEffect, useState } from 'react';
import type { StageDef, NavId } from '../theme/stages';
import { STAGES, STAGE_ORDER } from '../theme/stages';
import type { Encounter } from '../data/encounter';
import { ENEMY_POOL } from '../data/encounter';

/* =====================================================================
   НИЖНЯЯ НАВИГАЦИЯ — спокойная, растёт по стадиям, без замков-эмодзи.
   ===================================================================== */

const NAV_LABEL: Record<NavId, string> = { academy: 'Академия', arena: 'Арена', journal: 'Журнал', collection: 'Коллекция', more: 'Ещё' };

export function BottomNav({ stage, active, onNav }: { stage: StageDef; active: NavId; onNav: (n: NavId) => void }) {
  const items = stage.structure.nav;
  return (
    <nav className="sticky bottom-0 z-20 border-t px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-1.5" style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--bg) 92%, transparent)', backdropFilter: 'blur(10px)' }}>
      <div className="flex">
        {items.map((n) => {
          const isActive = n === active;
          return (
            <button key={n} onClick={() => onNav(n)} className="flex flex-1 flex-col items-center gap-0.5 py-1" style={{ color: isActive ? 'var(--text)' : 'var(--muted)' }}>
              <NavIcon id={n} active={isActive} />
              <span className="text-[10px]" style={{ fontFamily: 'var(--font-ui)' }}>
                {NAV_LABEL[n]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function NavIcon({ id, active }: { id: NavId; active: boolean }) {
  const p = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const dot = active ? <circle cx="12" cy="22" r="1.4" fill="var(--accent)" stroke="none" /> : null;
  switch (id) {
    case 'academy':
      return (
        <svg {...p}>
          <path d="M3 8l9-4 9 4-9 4-9-4z" />
          <path d="M7 10v5c0 1 2.5 2.5 5 2.5s5-1.5 5-2.5v-5" />
          {dot}
        </svg>
      );
    case 'arena':
      return (
        <svg {...p}>
          <path d="M4 17l5-6 4 3 7-8" />
          <path d="M4 20h16" />
          {dot}
        </svg>
      );
    case 'journal':
      return (
        <svg {...p}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 8h6M9 12h6M9 16h4" />
          {dot}
        </svg>
      );
    case 'collection':
      return (
        <svg {...p}>
          <rect x="3" y="4" width="8" height="8" rx="1.5" />
          <rect x="13" y="4" width="8" height="8" rx="1.5" />
          <rect x="3" y="14" width="8" height="8" rx="1.5" />
          <rect x="13" y="14" width="8" height="8" rx="1.5" />
          {dot}
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <circle cx="6" cy="12" r="1.2" fill="currentColor" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
          <circle cx="18" cy="12" r="1.2" fill="currentColor" />
          {dot}
        </svg>
      );
  }
}

/* =====================================================================
   ЛИСТ СТАТИСТИКИ — всё, что убрали из верхней панели.
   ===================================================================== */

export function StatsSheet({ open, onClose, stage, level, xp, sig, streak, weather, budget, onSetLevel }: { open: boolean; onClose: () => void; stage: StageDef; level: number; xp: number; sig: number; streak: number; weather: string; budget: number; onSetLevel: (l: number) => void }) {
  if (!open) return null;
  const rows: [string, string][] = [
    ['Опыт', `${xp} XP`],
    ['Монеты', `${sig} SIG`],
    ['Серия', `×${streak}`],
    ['Погода рынка', weather],
    ['Бюджет риска', `${budget} / 100`],
  ];
  return (
    <div className="absolute inset-0 z-40 flex items-end" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose}>
      <div className="w-full rounded-t-2xl border-t p-4 pb-6" style={{ background: 'var(--surface)', borderColor: 'var(--strong)' }} onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full" style={{ background: 'var(--strong)' }} />
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>
            Стадия {stage.short} · {stage.name}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            L{stage.levels[0]}–{stage.levels[1]}
          </span>
        </div>
        <p className="mb-3 text-[12px]" style={{ color: 'var(--sub)' }}>
          {stage.goal}
        </p>
        <div className="divide-y rounded-lg border" style={{ borderColor: 'var(--border)' }}>
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between px-3 py-2 text-[12px]" style={{ borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--muted)' }}>{k}</span>
              <span style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            <span>Демо: перемотка уровня</span>
            <span>Ур. {level}</span>
          </div>
          <input type="range" min={1} max={99} value={level} onChange={(e) => onSetLevel(Number(e.target.value))} className="w-full" style={{ accentColor: 'var(--accent)' }} />
          <div className="mt-2 grid grid-cols-4 gap-1">
            {STAGE_ORDER.map((id) => {
              const e = STAGES[id];
              const cur = e.id === stage.id;
              return (
                <button key={id} onClick={() => onSetLevel(e.levels[0])} className="rounded-md border py-1.5 text-[10px]" style={{ borderColor: cur ? 'var(--accent)' : 'var(--border)', color: cur ? 'var(--text)' : 'var(--sub)', background: cur ? 'var(--elevated)' : 'transparent' }}>
                  {e.short} · {e.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   РЕЗУЛЬТАТ — единый лист из четырёх состояний: доигрыш → опознание →
   тень арены → награда. Один экран, одна кнопка на каждом шаге.
   ===================================================================== */

export interface ResultData {
  correct: boolean;
  justified: boolean;
  xp: number;
  sig: number;
  budgetDelta: number;
  chosen: string;
}

export function ResultSheet({ encounter, stage, result, onNext }: { encounter: Encounter; stage: StageDef; result: ResultData; onNext: () => void }) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [played, setPlayed] = useState(0);
  const [identified, setIdentified] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const st = stage.structure;

  useEffect(() => {
    if (played >= 6) return;
    const t = setTimeout(() => setPlayed((p) => p + 1), 260);
    return () => clearTimeout(t);
  }, [played]);

  const title = !result.correct ? 'Неверно' : !result.justified ? 'Верно, но не обосновано' : 'Верно';
  const tone = !result.correct ? 'var(--bad)' : !result.justified ? 'var(--warn)' : 'var(--good)';
  const sub = !result.correct ? 'Цена пошла против. Смотри, где была улика.' : !result.justified ? 'Ответ верный, но без верной улики — враг не побеждён.' : 'Улика верна, враг побеждён.';

  const options = st.identifyOptions > 0 ? ENEMY_POOL.slice(0, st.identifyOptions) : [];
  const idOk = identified === encounter.enemy.id || (st.identifyOptions === 0 && typed.trim().toLowerCase().includes('fomo'));

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-y-auto" style={{ background: 'color-mix(in srgb, var(--bg) 96%, transparent)' }}>
      <div className="px-4 pt-6">
        {/* доигрыш */}
        <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="mb-2 flex justify-between text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            <span>График доигрывает</span>
            <span>+6 свечей</span>
          </div>
          <svg viewBox="0 0 330 70" className="w-full">
            {encounter.candles.slice(-6).map((c, i) => {
              const up = c.c >= c.o;
              return <rect key={`p${i}`} x={6 + i * 22} y={30 - (up ? 8 : 0)} width={12} height={16} fill={up ? 'var(--good)' : 'var(--bad)'} opacity={0.5} rx={1} />;
            })}
            {Array.from({ length: 6 }).map((_, i) => {
              const show = i < played;
              const down = !result.correct ? true : false;
              const yy = down ? 22 + i * 6 : 34 - i * 4;
              return <rect key={`f${i}`} x={150 + i * 26} y={yy} width={14} height={18} rx={1} fill={result.correct ? 'var(--good)' : 'var(--bad)'} opacity={show ? 0.95 : 0} style={{ transition: 'opacity .25s' }} />;
            })}
            <line x1={142} x2={142} y1={4} y2={66} stroke="var(--strong)" strokeDasharray="3 3" />
            <text x={146} y={12} fontSize={8} fill="var(--muted)" fontFamily="var(--font-mono)">
              твой вход
            </text>
          </svg>
        </div>

        <h2 className="mt-5 text-[22px] font-semibold" style={{ color: tone, fontFamily: 'var(--font-head)' }}>
          {title}
        </h2>
        <p className="mt-1 text-[12px]" style={{ color: 'var(--sub)' }}>
          {sub}
        </p>

        {/* почему — конкретно */}
        <div className="mt-3 rounded-lg border-l-2 px-3 py-2 text-[12px]" style={{ borderColor: tone, background: 'var(--surface)', color: 'var(--text)' }}>
          Ключевая улика: <b>рост цены при падающем объёме</b>. Правильно — {encounter.answers.find((a) => a.id === encounter.correct)?.text.toLowerCase()}.
        </div>

        {/* опознание */}
        {phase >= 1 && (
          <div className="mt-5">
            <div className="mb-2 text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              Кто это был?
            </div>
            {options.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {options.map((o) => {
                  const sel = identified === o.id;
                  const real = o.id === encounter.enemy.id;
                  const revealed = identified !== null;
                  return (
                    <button key={o.id} disabled={revealed} onClick={() => setIdentified(o.id)} className="rounded-lg border px-3 py-2.5 text-left text-[12px]" style={{ borderColor: revealed ? (real ? 'var(--good)' : sel ? 'var(--bad)' : 'var(--border)') : 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                      <span className="block text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                        {o.id}
                      </span>
                      {o.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Назови врага по журналу…" className="w-full rounded-lg border px-3 py-2.5 text-[13px] outline-none" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
            )}
            {(identified || typed.length > 3) && (
              <p className="mt-2 text-[12px]" style={{ color: idOk ? 'var(--good)' : 'var(--bad)' }}>
                {idOk ? `✓ ${encounter.enemy.name} — стадия ${encounter.enemy.stage} раскрыта` : `✗ Это был ${encounter.enemy.name}`}
              </p>
            )}
          </div>
        )}

        {/* тень + награда */}
        {phase >= 2 && (
          <div className="mt-5">
            <div className="mb-2 text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              Как ответили другие
            </div>
            <div className="flex flex-col gap-1.5">
              {(['A', 'B', 'C', 'D'] as const).map((k, i) => {
                const pct = [14, 52, 22, 12][i];
                const isCorrect = k === encounter.correct;
                const mine = k === result.chosen;
                return (
                  <div key={k} className="flex items-center gap-2 text-[11px]" style={{ fontFamily: 'var(--font-mono)' }}>
                    <span className="w-4" style={{ color: isCorrect ? 'var(--good)' : 'var(--muted)' }}>
                      {k}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--elevated)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: isCorrect ? 'var(--good)' : 'var(--strong)' }} />
                    </div>
                    <span className="w-8 text-right" style={{ color: 'var(--sub)' }}>
                      {pct}%
                    </span>
                    <span className="w-8 text-[9px]" style={{ color: 'var(--accent)' }}>
                      {mine ? 'ты' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ['XP', `+${result.xp}`],
                ['SIG', `+${result.sig}`],
                ['Бюджет', `${result.budgetDelta > 0 ? '+' : ''}${result.budgetDelta}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border px-3 py-2 text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <div className="text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    {k}
                  </div>
                  <div className="text-[15px] font-semibold" style={{ color: k === 'Бюджет' && result.budgetDelta < 0 ? 'var(--bad)' : 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 mt-auto px-4 pb-6 pt-4" style={{ background: 'linear-gradient(to top, var(--bg) 70%, transparent)' }}>
        <button
          onClick={() => {
            if (phase === 0) setPhase(1);
            else if (phase === 1) setPhase(2);
            else onNext();
          }}
          disabled={phase === 1 && !identified && typed.length <= 3}
          className="h-12 w-full rounded-xl text-[14px] font-semibold disabled:opacity-40"
          style={{ background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: 'calc(var(--radius) - 4px)' }}
        >
          {phase === 0 ? 'Кто это был?' : phase === 1 ? 'Показать итог' : 'Следующая встреча'}
        </button>
      </div>
    </div>
  );
}

/* =====================================================================
   ПЕРЕХОД ЭПОХИ — объясняет, что именно изменится в структуре.
   ===================================================================== */

export function StageTransition({ from, to, onContinue }: { from: StageDef; to: StageDef; onContinue: () => void }) {
  const diff: string[] = [];
  if (to.structure.tabs !== from.structure.tabs) diff.push(`Источников в браузере: ${from.structure.tabs} → ${to.structure.tabs}`);
  if (to.structure.evidenceRequired !== from.structure.evidenceRequired) diff.push(`Улик для обоснования: ${from.structure.evidenceRequired} → ${to.structure.evidenceRequired}`);
  if (from.structure.evidenceHighlight && !to.structure.evidenceHighlight) diff.push('Подсветка улик снята');
  if (!from.structure.confidence && to.structure.confidence) diff.push('Появилась ставка уверенности');
  if (!from.structure.verdict && to.structure.verdict) diff.push('Перед ответом — вердикт: что доминирует');
  if (to.structure.stackSlots > from.structure.stackSlots) diff.push(`План из карт: ${to.structure.stackSlots} шага`);
  if (!from.structure.blindTab && to.structure.blindTab) diff.push('Одна вкладка закрыта — открытие стоит бюджет');
  if (to.structure.labels === 'false') diff.push('Ярлыки могут лгать');
  if (to.structure.identifyOptions === 0) diff.push('Врага называешь сам, по журналу');
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-center px-6" style={{ background: 'var(--bg)' }}>
      <div className="text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
        Стадия {from.short} завершена
      </div>
      <h2 className="mt-2 text-[28px] font-semibold leading-none" style={{ color: 'var(--text)', fontFamily: 'var(--font-head)' }}>
        {to.short} · {to.name}
      </h2>
      <p className="mt-3 text-[13px]" style={{ color: 'var(--accent)' }}>
        {to.motto}
      </p>
      <p className="mt-1 text-[12px]" style={{ color: 'var(--sub)' }}>
        {to.goal}
      </p>
      <div className="mt-6 text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
        Что меняется
      </div>
      <ul className="mt-2 flex flex-col gap-1.5">
        {diff.map((d) => (
          <li key={d} className="flex items-start gap-2 text-[12px]" style={{ color: 'var(--text)' }}>
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
            {d}
          </li>
        ))}
      </ul>
      <button onClick={onContinue} className="mt-8 h-12 w-full rounded-xl text-[14px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
        Продолжить
      </button>
    </div>
  );
}
