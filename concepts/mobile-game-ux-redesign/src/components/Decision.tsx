import type { Encounter, CardDef, AnswerDef } from '../data/encounter';
import type { EpochDef } from '../theme/epochs';

export type Confidence = 'low' | 'mid' | 'high' | null;

/* =====================================================================
   КАРТЫ — горизонтальная лента. Обязательные (required) визуально
   отличаются от контекстных, «Ждать» — всегда доступна.
   В режимах stack/silent карты собираются в план (слоты).
   ===================================================================== */

export function CardRail({ encounter, epoch, active, stack, onPick }: { encounter: Encounter; epoch: EpochDef; active: string | null; stack: string[]; onPick: (c: CardDef) => void }) {
  const st = epoch.structure;
  const isStack = st.stackSlots > 0;
  return (
    <div className="pt-3">
      <div className="mb-1.5 flex items-center justify-between px-4 text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
        <span>{isStack ? `План · ${stack.length}/${st.stackSlots} карт` : 'Карты из Академии'}</span>
        {st.cardMode === 'guided' && <span style={{ color: 'var(--accent)' }}>★ — нужны для победы</span>}
      </div>

      {/* слоты плана */}
      {isStack && (
        <div className="mb-2 flex gap-1.5 px-4">
          {Array.from({ length: st.stackSlots }).map((_, i) => {
            const id = stack[i];
            const card = encounter.cards.find((c) => c.id === id);
            return (
              <div key={i} className="flex h-8 flex-1 items-center justify-center rounded-md border text-[10px]" style={{ borderColor: card ? 'var(--accent)' : 'var(--border)', borderStyle: card ? 'solid' : 'dashed', color: card ? 'var(--text)' : 'var(--muted)', background: card ? 'var(--elevated)' : 'transparent' }}>
                {card ? `${i + 1}. ${card.name}` : `${i + 1}`}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
        {encounter.cards.map((c) => {
          const inStack = stack.includes(c.id);
          const sel = active === c.id || inStack;
          const showKind = st.cardMode === 'guided' || st.cardMode === 'context';
          const tone = c.kind === 'required' ? 'var(--accent)' : c.kind === 'wait' ? 'var(--warn)' : 'var(--strong)';
          return (
            <button
              key={c.id}
              onClick={() => onPick(c)}
              className="relative flex w-[128px] shrink-0 flex-col items-start gap-1 rounded-lg border px-2.5 py-2 text-left transition-transform active:scale-[0.98]"
              style={{
                borderColor: sel ? 'var(--accent)' : 'var(--border)',
                background: sel ? 'color-mix(in srgb, var(--accent) 10%, var(--surface))' : 'var(--surface)',
                minHeight: 60,
              }}
            >
              <span className="absolute left-0 top-2 h-6 w-0.5 rounded-r" style={{ background: showKind ? tone : 'var(--border)' }} />
              <span className="text-[12px] font-medium leading-tight" style={{ color: 'var(--text)' }}>
                {c.name}
                {st.cardMode === 'guided' && c.kind === 'required' && <span style={{ color: 'var(--accent)' }}> ★</span>}
              </span>
              <span className="text-[10px] leading-snug" style={{ color: 'var(--muted)' }}>
                {st.cardMode === 'silent' ? '' : c.hint}
              </span>
              {inStack && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
                  {stack.indexOf(c.id) + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =====================================================================
   ВЕРДИКТ КОНФЛИКТА — что доминирует, до выбора действия (эпохи II+).
   ===================================================================== */

export function VerdictRow({ encounter, value, onPick }: { encounter: Encounter; value: 'A' | 'B' | null; onPick: (v: 'A' | 'B') => void }) {
  if (!encounter.verdict) return null;
  const v = encounter.verdict;
  return (
    <div className="px-4 pt-3">
      <div className="mb-1.5 text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
        Что доминирует?
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(['A', 'B'] as const).map((k) => {
          const sel = value === k;
          return (
            <button key={k} onClick={() => onPick(k)} className="rounded-lg border px-3 py-2 text-left text-[12px]" style={{ borderColor: sel ? 'var(--accent)' : 'var(--border)', background: sel ? 'color-mix(in srgb, var(--accent) 10%, var(--surface))' : 'var(--surface)', color: 'var(--text)' }}>
              {k === 'A' ? v.a : v.b}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =====================================================================
   ОТВЕТЫ — вертикальный список, каждый ответ показывает, какими
   собранными уликами он поддержан. Одна колонка = одна иерархия.
   ===================================================================== */

export function AnswerList({ encounter, epoch, selected, evidence, value, onPick, disabled }: { encounter: Encounter; epoch: EpochDef; selected: Set<string>; evidence: Set<string>; value: AnswerDef['id'] | null; onPick: (a: AnswerDef) => void; disabled?: boolean }) {
  void selected;
  const showLinks = epoch.index <= 2;
  return (
    <div className="px-4 pt-3">
      <div className="mb-1.5 flex items-center justify-between text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
        <span>Решение</span>
        {showLinks && <span>● — поддержано твоей уликой</span>}
      </div>
      <div className="flex flex-col gap-2">
        {encounter.answers.map((a) => {
          const sel = value === a.id;
          const support = a.supportedBy.filter((id) => evidence.has(id));
          const supported = support.length > 0;
          return (
            <button
              key={a.id}
              disabled={disabled}
              onClick={() => onPick(a)}
              className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-transform active:scale-[0.99] disabled:opacity-50"
              style={{
                borderColor: sel ? 'var(--accent)' : 'var(--border)',
                background: sel ? 'color-mix(in srgb, var(--accent) 12%, var(--surface))' : 'var(--surface)',
              }}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-bold" style={{ background: sel ? 'var(--accent)' : 'var(--elevated)', color: sel ? 'var(--accent-ink)' : a.isWait ? 'var(--warn)' : 'var(--sub)', fontFamily: 'var(--font-mono)' }}>
                {a.id}
              </span>
              <span className="min-w-0 flex-1 text-[13px] leading-snug" style={{ color: 'var(--text)' }}>
                {a.text}
              </span>
              {showLinks && supported && (
                <span className="flex shrink-0 items-center gap-1 text-[10px]" style={{ color: 'var(--good)', fontFamily: 'var(--font-mono)' }}>
                  ● {support.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =====================================================================
   СТАВКА УВЕРЕННОСТИ — сегмент из трёх, появляется после выбора ответа.
   ===================================================================== */

export function ConfidenceRow({ value, onPick }: { value: Confidence; onPick: (c: Confidence) => void }) {
  const opts: { k: Exclude<Confidence, null>; t: string; s: string }[] = [
    { k: 'low', t: 'Не уверен', s: '×0.6' },
    { k: 'mid', t: 'Уверен', s: '×1.0' },
    { k: 'high', t: 'Точно', s: '×1.6' },
  ];
  return (
    <div className="px-4 pt-3">
      <div className="mb-1.5 text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
        Насколько уверен? Ошибка при «Точно» стоит дороже.
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-lg border p-1" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {opts.map((o) => {
          const sel = value === o.k;
          return (
            <button key={o.k} onClick={() => onPick(o.k)} className="flex flex-col items-center rounded-md py-1.5 text-[12px]" style={{ background: sel ? 'var(--elevated)' : 'transparent', color: sel ? 'var(--text)' : 'var(--sub)', boxShadow: sel ? 'inset 0 0 0 1px var(--strong)' : 'none' }}>
              <span>{o.t}</span>
              <span className="text-[9px]" style={{ color: o.k === 'high' ? 'var(--warn)' : 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                {o.s}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =====================================================================
   ГЛАВНАЯ КНОПКА — одна на экран. Её подпись объясняет, чего не хватает.
   ===================================================================== */

export function PrimaryAction({ label, hint, ready, onClick }: { label: string; hint?: string; ready: boolean; onClick: () => void }) {
  return (
    <div className="px-4 pt-3">
      <button
        onClick={onClick}
        className="flex h-12 w-full items-center justify-center rounded-xl text-[14px] font-semibold transition-all active:scale-[0.99]"
        style={{
          background: ready ? 'var(--accent)' : 'var(--elevated)',
          color: ready ? 'var(--accent-ink)' : 'var(--muted)',
          boxShadow: ready ? '0 8px 24px -8px color-mix(in srgb, var(--accent) 60%, transparent)' : 'none',
          borderRadius: 'calc(var(--radius) - 4px)',
        }}
      >
        {label}
      </button>
      {hint && (
        <p className="mt-1.5 text-center text-[11px]" style={{ color: 'var(--muted)' }}>
          {hint}
        </p>
      )}
    </div>
  );
}
