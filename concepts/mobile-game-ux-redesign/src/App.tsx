import { useMemo, useState } from 'react';
import { STAGES, STAGE_ORDER, stageForLevel, tokensToCss, type StageDef, type NavId } from './theme/stages';
import { ArenaScreen, type PlayerState } from './screens/ArenaScreen';
import { AcademyScreen, CollectionScreen, JournalScreen, MoreScreen } from './screens/OtherScreens';
import { BottomNav, StageTransition, StatsSheet, type ResultData } from './components/Overlays';

export default function App() {
  const [player, setPlayer] = useState<PlayerState>({ level: 4, xp: 320, sig: 48, budget: 82, streak: 2 });
  const [nav, setNav] = useState<NavId>('arena');
  const [round, setRound] = useState(0);
  const [stats, setStats] = useState(false);
  const [transition, setTransition] = useState<{ from: StageDef; to: StageDef } | null>(null);

  const stage = useMemo(() => stageForLevel(player.level), [player.level]);

  const onResult = (r: ResultData) => {
    setPlayer((p) => ({
      ...p,
      xp: p.xp + r.xp,
      sig: p.sig + r.sig,
      budget: Math.max(0, Math.min(100, p.budget + r.budgetDelta)),
      streak: r.correct && r.justified ? p.streak + 1 : 0,
    }));
  };

  const onNext = () => {
    // демо: каждая встреча = +3 уровня, чтобы смена стадий была наблюдаема
    const nextLevel = Math.min(99, player.level + 3);
    const from = stage;
    const to = stageForLevel(nextLevel);
    setPlayer((p) => ({ ...p, level: nextLevel }));
    setRound((r) => r + 1);
    if (from.id !== to.id) setTransition({ from, to });
  };

  const setLevel = (l: number) => {
    setPlayer((p) => ({ ...p, level: l }));
    setRound((r) => r + 1);
  };

  const texture = stage.tokens.texture;

  return (
    <div className="min-h-screen w-full bg-[#050506] text-white lg:flex lg:items-start lg:justify-center lg:gap-10 lg:px-8 lg:py-8">
      {/* ТЕЛЕФОН */}
      <div
        className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden lg:h-[860px] lg:w-[400px] lg:rounded-[40px] lg:border lg:border-white/10 lg:shadow-2xl"
        style={{ ...tokensToCss(stage.tokens), background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-ui)' }}
      >
        {/* фоновая текстура — тихая, ниже 6% */}
        <div className={`pointer-events-none absolute inset-0 z-0 texture-${texture}`} />

        <main className="relative z-10 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div key={`${stage.id}-${nav}`} className="animate-[fadein_.25s_ease-out] min-h-full">
            {nav === 'arena' && <ArenaScreen stage={stage} player={player} round={round} onOpenStats={() => setStats(true)} onResult={onResult} onNext={onNext} />}
            {nav === 'academy' && <AcademyScreen stage={stage} onGoArena={() => setNav('arena')} />}
            {nav === 'journal' && <JournalScreen stage={stage} onGoArena={() => setNav('arena')} />}
            {nav === 'collection' && <CollectionScreen stage={stage} />}
            {nav === 'more' && <MoreScreen stage={stage} player={player} />}
          </div>
        </main>

        <BottomNav stage={stage} active={nav} onNav={setNav} />

        <StatsSheet open={stats} onClose={() => setStats(false)} stage={stage} level={player.level} xp={player.xp} sig={player.sig} streak={player.streak} weather="Тренд" budget={player.budget} onSetLevel={setLevel} />

        {transition && <StageTransition from={transition.from} to={transition.to} onContinue={() => setTransition(null)} />}
      </div>

      {/* СПЕЦИФИКАЦИЯ — только на широких экранах */}
      <aside className="hidden w-[420px] shrink-0 lg:block">
        <SpecPanel stage={stage} onPick={setLevel} />
      </aside>
    </div>
  );
}

function SpecPanel({ stage, onPick }: { stage: StageDef; onPick: (l: number) => void }) {
  const st = stage.structure;
  const rows: [string, string][] = [
    ['Вкладок браузера', String(st.tabs) + (st.blindTab ? ' + слепая' : '')],
    ['Улик для обоснования', String(st.evidenceRequired)],
    ['Подсветка улик', st.evidenceHighlight ? 'да' : 'нет'],
    ['Ярлыки', { all: 'все', partial: 'частично', none: 'нет', false: 'ложные' }[st.labels]],
    ['Карт на экране', `${st.cards} · ${st.cardMode}`],
    ['Стек решений', st.stackSlots ? `${st.stackSlots} слота` : 'нет'],
    ['Ставка уверенности', st.confidence ? 'да' : 'нет'],
    ['Вердикт конфликта', st.verdict ? 'да' : 'нет'],
    ['Опознание врага', st.identifyOptions ? `${st.identifyOptions} варианта` : 'по журналу'],
    ['Пошаговый режим', st.stepper ? 'да' : 'нет'],
    ['Навигация', st.nav.length + ' раздела'],
  ];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-[13px] text-zinc-300">
      <div className="text-[11px] uppercase tracking-wider text-zinc-500">Signal Arena · UI v2</div>
      <h2 className="mt-1 text-lg font-semibold text-white">Один экран · один браузер · одна задача · одна кнопка</h2>
      <p className="mt-2 text-zinc-400">Стадия меняет структуру обучения, а не только палитру. Терминал — финальная форма: к виду биржи игрок приходит последним.</p>

      <div className="mt-4 grid grid-cols-4 gap-1.5">
        {STAGE_ORDER.map((id) => {
          const e = STAGES[id];
          const cur = e.id === stage.id;
          return (
            <button key={id} onClick={() => onPick(e.levels[0])} className="rounded-lg border px-2 py-2 text-left" style={{ borderColor: cur ? e.tokens.accent : 'rgba(255,255,255,0.1)', background: cur ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
              <div className="text-[10px] text-zinc-500">
                {e.short} · L{e.levels[0]}–{e.levels[1]}
              </div>
              <div className="text-[12px] font-medium text-white">{e.name}</div>
              <div className="mt-1 h-1 rounded-full" style={{ background: e.tokens.accent }} />
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-[11px] uppercase tracking-wider text-zinc-500">Контракт структуры · {stage.name}</div>
      <div className="mt-2 divide-y divide-white/5 rounded-lg border border-white/10">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between px-3 py-1.5">
            <span className="text-zinc-500">{k}</span>
            <span className="font-mono text-zinc-200">{v}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-[11px] uppercase tracking-wider text-zinc-500">Порядок слоёв (вертикальный поток)</div>
      <ol className="mt-2 space-y-1 text-zinc-400">
        <li>1. Инфо-строка: уровень/стадия · бюджет риска</li>
        <li>2. Задача: одна строка вопроса (+ шаг в стадийе I)</li>
        <li>3. Браузер — стабильный, не меняется</li>
        <li>4. Док улик: собрано / нужно</li>
        <li>5. Карты (контекст → план по мере роста)</li>
        <li>6. Вердикт → Ответы → Уверенность</li>
        <li>7. Одна главная кнопка, объясняющая, чего не хватает</li>
        <li>8. Навигация — тихая, растёт по стадиям</li>
      </ol>
      <p className="mt-4 text-[11px] text-zinc-500">Для демонстрации смены стадий: каждая встреча = +3 уровня, или перемотка в листе статистики (иконка справа сверху в телефоне).</p>
    </div>
  );
}
