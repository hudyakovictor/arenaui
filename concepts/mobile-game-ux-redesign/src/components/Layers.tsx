import type { StageDef } from '../theme/stages';
import type { Encounter } from '../data/encounter';

/* =====================================================================
   ВЕРХНИЙ СЛОЙ — одна строка: уровень/стадия · бюджет риска · меню.
   XP, SIG, серия, погода — уходят в раскрывающийся лист (details).
   ===================================================================== */

interface TopProps {
  stage: StageDef;
  level: number;
  budget: number;
  xp: number;
  sig: number;
  streak: number;
  weather: string;
  onOpenStats: () => void;
}

export function TopBar({ stage, level, budget, xp, sig, streak, weather, onOpenStats }: TopProps) {
  const pct = Math.max(0, Math.min(100, budget));
  const tone = pct > 50 ? 'var(--good)' : pct > 25 ? 'var(--warn)' : 'var(--bad)';
  const [lo, hi] = stage.levels;
  const stagePct = Math.round(((level - lo) / (hi - lo)) * 100);
  return (
    <header className="px-4 pt-3">
      <div className="flex items-center gap-3">
        {/* Уровень + стадия — один объект */}
        <button onClick={onOpenStats} className="flex items-center gap-2 rounded-full border px-2.5 py-1" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)', fontFamily: 'var(--font-mono)' }}>
            {stage.short}
          </span>
          <span className="text-[12px] font-semibold" style={{ color: 'var(--text)' }}>
            Ур. {level}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
            {stage.name}
          </span>
        </button>

        {/* Бюджет риска — единственная метрика на виду */}
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--sub)' }}>
            <span>Бюджет риска</span>
            <span style={{ color: tone }}>{budget}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--elevated)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: tone }} />
          </div>
        </div>

        <button onClick={onOpenStats} aria-label="Статистика" className="flex h-8 w-8 items-center justify-center rounded-full border" style={{ borderColor: 'var(--border)', color: 'var(--sub)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
          </svg>
        </button>
      </div>
      {/* тонкая полоса прогресса стадии — без текста */}
      <div className="mt-2 flex items-center gap-2">
        <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, var(--accent) ${stagePct}%, var(--border) ${stagePct}%)` }} />
        <span className="text-[9px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          {xp} XP · {sig} SIG · ×{streak} · {weather}
        </span>
      </div>
    </header>
  );
}

/* =====================================================================
   СТРОКА ЗАДАЧИ — вопрос как заголовок задачи, не баннер.
   ===================================================================== */

export function TaskLine({ encounter, stage, step }: { encounter: Encounter; stage: StageDef; step: 1 | 2 | 3 }) {
  const st = stage.structure;
  const stepLabel = step === 1 ? 'Шаг 1 · Найди улику' : step === 2 ? 'Шаг 2 · Выбери ответ' : 'Шаг 3 · Подтверди';
  return (
    <div className="px-4 pt-3">
      <div className="flex items-center gap-2 text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
        <span>{encounter.id}</span>
        <span>·</span>
        <span>враг скрыт</span>
        {st.stepper && (
          <span className="ml-auto rounded-full px-2 py-0.5" style={{ background: 'var(--elevated)', color: 'var(--accent)' }}>
            {stepLabel}
          </span>
        )}
      </div>
      <h1
        className="mt-1 text-[17px] font-semibold leading-tight"
        style={{ color: 'var(--text)', fontFamily: 'var(--font-head)', letterSpacing: stage.index === 1 ? '0.01em' : 0 }}
      >
        {encounter.question}
      </h1>
      {st.hintLine && encounter.hint && (
        <p className="mt-1 text-[12px] leading-snug" style={{ color: 'var(--sub)' }}>
          {encounter.hint}
        </p>
      )}
    </div>
  );
}

/* =====================================================================
   ДОК УЛИК — связывает браузер с ответами. Показывает: что собрано / сколько нужно.
   ===================================================================== */

export function EvidenceDock({ encounter, stage, selected, onRemove }: { encounter: Encounter; stage: StageDef; selected: Set<string>; onRemove: (id: string) => void }) {
  const need = stage.structure.evidenceRequired;
  const items = encounter.evidence.filter((e) => selected.has(e.id));
  const have = items.length;
  const ready = have >= need;
  return (
    <div className="px-4 pt-2.5">
      <div className="flex items-center gap-2 rounded-lg border px-2.5 py-2" style={{ borderColor: ready ? 'color-mix(in srgb, var(--good) 45%, var(--border))' : 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center gap-1">
          {Array.from({ length: need }).map((_, i) => (
            <span key={i} className="h-2 w-2 rounded-full" style={{ background: i < have ? 'var(--good)' : 'var(--strong)' }} />
          ))}
        </div>
        <span className="text-[10px] shrink-0" style={{ color: ready ? 'var(--good)' : 'var(--sub)', fontFamily: 'var(--font-mono)' }}>
          Улики {have}/{need}
        </span>
        <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
          {items.length === 0 ? (
            <span className="truncate text-[11px]" style={{ color: 'var(--muted)' }}>
              тапни зону в браузере
            </span>
          ) : (
            items.map((e) => (
              <button
                key={e.id}
                onClick={() => onRemove(e.id)}
                className="flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]"
                style={{ borderColor: 'var(--strong)', color: 'var(--text)', background: 'var(--elevated)' }}
              >
                {e.short}
                <span style={{ color: 'var(--muted)' }}>×</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
