import { useMemo, useState } from 'react';
import type { EpochTheme } from './themes';
import { ENCOUNTERS } from './content';

interface Props {
  theme: EpochTheme;
  showSlots?: boolean;
  onboarding?: boolean;
}

function textureStyle(theme: EpochTheme): React.CSSProperties {
  const { colors, texture } = theme;
  switch (texture) {
    case 'brick':
      return {
        backgroundColor: colors.bg,
        backgroundImage: `linear-gradient(#1c1c1f 2px, transparent 2px), linear-gradient(90deg, #1c1c1f 2px, transparent 2px)`,
        backgroundSize: '44px 22px, 44px 22px',
      };
    case 'paper':
      return {
        backgroundColor: colors.bg,
        backgroundImage: `radial-gradient(rgba(60,40,20,0.06) 1px, transparent 1px)`,
        backgroundSize: '6px 6px',
      };
    case 'grid':
      return {
        backgroundColor: colors.bg,
        backgroundImage: `linear-gradient(rgba(124,255,124,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(124,255,124,0.07) 1px, transparent 1px)`,
        backgroundSize: '12px 12px',
      };
    default:
      return { backgroundColor: colors.bg };
  }
}

function Spark({ data, color, muted }: { data: number[]; color: string; muted: string }) {
  const w = 100;
  const h = 40;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
      <line x1="0" y1={h - 1} x2={w} y2={h - 1} stroke={muted} strokeWidth="0.5" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function ArenaMock({ theme, showSlots = false, onboarding = false }: Props) {
  const t = theme;
  const c = t.colors;
  const d = t.density;
  const enc = ENCOUNTERS[t.id];

  const [activeSource, setActiveSource] = useState(enc.sources[0].id);
  const [selected, setSelected] = useState<string[]>([]);
  const [answer, setAnswer] = useState<number | null>(null);
  const [result, setResult] = useState<'ok' | 'fail' | null>(null);
  const [sig, setSig] = useState(enc.sig);
  const [hintOn, setHintOn] = useState(false);
  const [scanOn, setScanOn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(onboarding);

  const source = enc.sources.find((s) => s.id === activeSource)!;
  const allClues = useMemo(() => enc.sources.flatMap((s) => s.clues.map((cl) => ({ ...cl, src: s.name }))), [enc]);
  const need = t.operation.evidenceNeeded;
  const ready = selected.length >= need;

  const distinctSources = new Set(
    selected.map((id) => enc.sources.find((s) => s.clues.some((cl) => cl.id === id))?.id),
  ).size;
  const needsDistinct = t.id === 'cabinet' && distinctSources < 2 && selected.length >= 2;

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 1400);
  };

  const toggleClue = (id: string) => {
    if (result) return;
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= need) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const useTool = (kind: 'hint' | 'scan' | 'cross' | 'skip') => {
    if (result) return;
    if (sig < 20) return flash('мало SIG');
    setSig((s) => s - 20);
    if (kind === 'hint') {
      setHintOn(true);
      window.setTimeout(() => setHintOn(false), 2200);
    } else if (kind === 'scan') setScanOn(true);
    else if (kind === 'cross') flash('противоречие: чат ↔ новости');
    else if (kind === 'skip') flash('встреча пропущена');
  };

  const confirm = () => {
    if (answer === null || !ready) return;
    setResult(answer === enc.correct ? 'ok' : 'fail');
  };

  const reset = () => {
    setSelected([]);
    setAnswer(null);
    setResult(null);
    setHintOn(false);
    setScanOn(false);
  };

  const R = t.radius;
  const panel: React.CSSProperties = {
    background: c.panel,
    border: `1px solid ${c.line}`,
    borderRadius: R,
    boxShadow: t.shadow ? `4px 4px 0 ${c.accent}` : 'none',
  };
  const up = t.uppercase ? 'uppercase' : 'none';
  const slotLabel = (name: string) =>
    showSlots ? (
      <span
        className="absolute -left-px -top-px text-[9px] leading-none px-1 py-0.5 z-20 font-mono"
        style={{ background: '#ff3ea5', color: '#fff' }}
      >
        {name}
      </span>
    ) : null;

  const tools: { k: 'hint' | 'scan' | 'cross' | 'skip'; label: string; on: boolean }[] = [
    { k: 'hint', label: t.id === 'terminal' ? 'hint' : 'Подсказка', on: t.crutches.hint },
    { k: 'scan', label: t.id === 'terminal' ? 'scan' : 'Скан', on: t.crutches.scan },
    { k: 'cross', label: t.id === 'terminal' ? 'xcheck' : 'Сверка', on: t.crutches.cross },
    { k: 'skip', label: t.id === 'terminal' ? 'skip' : 'Пропуск', on: t.crutches.skip },
  ];

  return (
    <div
      className="relative flex flex-col overflow-hidden select-none"
      style={{
        width: 390,
        height: 844,
        ...textureStyle(t),
        color: c.ink,
        fontFamily: t.font.body,
        padding: d.pad,
        gap: d.gap,
        borderRadius: 0,
      }}
    >
      {/* SLOT 1 · RAIL */}
      <div className="relative flex items-center gap-2 shrink-0 px-2" style={{ ...panel, height: d.rail }}>
        {slotLabel('rail')}
        <div
          className="flex items-center justify-center font-bold shrink-0"
          style={{
            background: c.accent,
            color: c.accentInk,
            borderRadius: R,
            width: 34,
            height: d.rail - 16,
            fontFamily: t.font.display,
            fontSize: 14,
          }}
        >
          {enc.level}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-[10px] leading-none" style={{ color: c.inkMuted, textTransform: up }}>
            <span>
              {t.name} · {t.operation.label}
            </span>
            <span>{enc.weather}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full" style={{ background: c.panel2, borderRadius: R }}>
            <div style={{ width: `${enc.xp}%`, background: c.accent, height: '100%', borderRadius: R }} />
          </div>
        </div>
        <div className="text-right shrink-0 leading-none">
          <div className="text-[12px] font-bold" style={{ fontFamily: t.font.mono }}>
            {sig} SIG
          </div>
          <div className="text-[9px] mt-1" style={{ color: c.inkMuted }}>
            бюджет {enc.budget}
          </div>
        </div>
      </div>

      {/* SLOT 2 · QUESTION + THREAT (merged) */}
      <div className="relative shrink-0 flex flex-col justify-between" style={{ ...panel, minHeight: d.questionMin, padding: '8px 10px' }}>
        {slotLabel('question')}
        {result ? (
          <div className="flex items-center justify-between gap-2">
            <div>
              <div
                className="font-bold leading-tight"
                style={{ fontFamily: t.font.display, fontSize: 18, color: result === 'ok' ? c.good : c.bad, textTransform: up }}
              >
                {result === 'ok' ? 'Сигнал пойман' : 'Это был шум'}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: c.inkMuted }}>
                {result === 'ok' ? `+${40 + t.index * 10} XP · верная цепочка` : `верно: «${enc.answers[enc.correct]}»`}
              </div>
            </div>
            <button
              onClick={reset}
              className="text-[12px] font-bold px-3 py-2 shrink-0"
              style={{ background: c.accent, color: c.accentInk, borderRadius: R }}
            >
              Дальше →
            </button>
          </div>
        ) : (
          <div
            className="font-bold leading-tight"
            style={{ fontFamily: t.font.display, fontSize: t.id === 'street' ? 19 : 16, textTransform: up, letterSpacing: t.id === 'street' ? 0.3 : 0 }}
          >
            {enc.question}
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[9px] leading-none" style={{ color: c.inkMuted, textTransform: up }}>
            угроза
          </span>
          <div className="flex-1 h-1" style={{ background: c.panel2, borderRadius: R }}>
            <div
              style={{
                width: `${enc.threat}%`,
                height: '100%',
                borderRadius: R,
                background: enc.threat > 66 ? c.bad : enc.threat > 40 ? c.warn : c.good,
              }}
            />
          </div>
          <span className="text-[9px] leading-none font-mono" style={{ color: c.inkMuted }}>
            {enc.threat}
          </span>
        </div>
      </div>

      {/* SLOT 3 · BROWSER (flex) */}
      <div className="relative flex-1 min-h-0 flex flex-col" style={{ ...panel }}>
        {slotLabel('browser · flex')}
        {/* tabs */}
        <div className="flex shrink-0" style={{ borderBottom: `1px solid ${c.line}` }}>
          {enc.sources.map((s) => {
            const active = s.id === activeSource;
            const used = s.clues.some((cl) => selected.includes(cl.id));
            return (
              <button
                key={s.id}
                onClick={() => setActiveSource(s.id)}
                className="flex-1 relative text-[11px] font-bold py-2.5 min-h-[40px]"
                style={{
                  color: active ? c.ink : c.inkMuted,
                  textTransform: up,
                  fontFamily: t.font.display,
                  background: active ? c.panel2 : 'transparent',
                  borderTopLeftRadius: R,
                  borderTopRightRadius: R,
                }}
              >
                {s.name}
                {scanOn && (
                  <span className="ml-1 text-[9px] font-mono" style={{ color: s.trust >= 70 ? c.good : s.trust >= 50 ? c.warn : c.bad }}>
                    {s.trust}
                  </span>
                )}
                {used && (
                  <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full" style={{ background: c.accent }} />
                )}
                {active && <span className="absolute left-0 right-0 bottom-0 h-0.5" style={{ background: c.accent }} />}
              </button>
            );
          })}
        </div>
        {/* chart */}
        <div className="shrink-0 px-3 pt-2" style={{ height: t.id === 'terminal' ? 56 : 64 }}>
          <div className="flex justify-between text-[9px] leading-none mb-1" style={{ color: c.inkMuted }}>
            <span>активность · 7 дн</span>
            <span className="font-mono">пик {Math.max(...source.series)}</span>
          </div>
          <div style={{ height: t.id === 'terminal' ? 36 : 44 }}>
            <Spark data={source.series} color={c.accent} muted={c.line} />
          </div>
        </div>
        {/* clues */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2 pt-1 flex flex-col gap-1.5">
          {source.clues.map((cl) => {
            const on = selected.includes(cl.id);
            const glow = hintOn && cl.signal;
            return (
              <button
                key={cl.id}
                onClick={() => toggleClue(cl.id)}
                className="text-left flex items-start gap-2 px-2.5 py-2 min-h-[44px]"
                style={{
                  background: on ? c.accent : c.panel2,
                  color: on ? c.accentInk : c.ink,
                  borderRadius: R,
                  border: `1px solid ${glow ? c.warn : on ? c.accent : c.line}`,
                  boxShadow: glow ? `0 0 0 2px ${c.warn}` : 'none',
                  fontSize: 12,
                  lineHeight: 1.25,
                }}
              >
                <span
                  className="shrink-0 mt-0.5 w-3.5 h-3.5 flex items-center justify-center text-[9px] font-bold"
                  style={{ border: `1.5px solid ${on ? c.accentInk : c.inkMuted}`, borderRadius: R === 0 ? 0 : 999, color: on ? c.accentInk : 'transparent' }}
                >
                  ✓
                </span>
                <span>{cl.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SLOT 4 · EVIDENCE */}
      <div className="relative shrink-0 flex items-center gap-1.5 px-2" style={{ ...panel, height: d.evidence }}>
        {slotLabel('evidence')}
        <div className="shrink-0 text-[9px] leading-tight w-9" style={{ color: c.inkMuted, textTransform: up }}>
          улики
          <div className="font-mono text-[11px] font-bold" style={{ color: ready ? c.good : c.ink }}>
            {selected.length}/{need}
          </div>
        </div>
        {Array.from({ length: need }).map((_, i) => {
          const id = selected[i];
          const cl = allClues.find((x) => x.id === id);
          return (
            <button
              key={i}
              onClick={() => id && toggleClue(id)}
              className="flex-1 min-w-0 h-[40px] px-2 text-left text-[10px] leading-tight overflow-hidden"
              style={{
                border: `1px ${cl ? 'solid' : 'dashed'} ${cl ? c.accent : c.line}`,
                background: cl ? c.panel2 : 'transparent',
                borderRadius: R,
                color: cl ? c.ink : c.inkMuted,
              }}
            >
              {cl ? (
                <>
                  <div className="text-[8px] font-mono truncate" style={{ color: c.inkMuted }}>
                    {cl.src}
                  </div>
                  <div className="truncate">{cl.text}</div>
                </>
              ) : (
                <span>{t.id === 'terminal' ? `slot ${i + 1}` : `улика ${i + 1}`}</span>
              )}
            </button>
          );
        })}
        {need > 1 && (
          <div className="shrink-0 text-[8px] leading-none font-mono" style={{ color: c.inkMuted, writingMode: 'vertical-rl' }}>
            {t.id === 'terminal' ? '→→' : '↔'}
          </div>
        )}
      </div>

      {/* SLOT 5 · CARDS (collapses to 0 in system) */}
      {d.cards > 0 && (
        <div className="relative shrink-0 flex gap-1.5" style={{ height: d.cards }}>
          {slotLabel('cards')}
          {tools.map((tool) => (
            <button
              key={tool.k}
              disabled={!tool.on}
              onClick={() => useTool(tool.k)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5"
              style={{
                ...panel,
                boxShadow: 'none',
                opacity: tool.on ? 1 : 0.4,
                color: tool.on ? c.ink : c.inkMuted,
              }}
            >
              <span className="text-[13px] leading-none" style={{ fontFamily: t.font.display }}>
                {tool.on ? (tool.k === 'hint' ? '◎' : tool.k === 'scan' ? '◈' : tool.k === 'cross' ? '⇄' : '↷') : '🔒'}
              </span>
              <span className="text-[10px] leading-none" style={{ textTransform: up }}>
                {tool.label}
              </span>
              <span className="text-[8px] font-mono leading-none" style={{ color: c.inkMuted }}>
                {tool.on ? '−20' : t.name.toLowerCase() === 'street' ? '' : 'закрыт'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* SLOT 6 · ANSWERS 2×2 + confirm */}
      <div className="relative shrink-0 flex flex-col gap-1.5" style={{ height: d.answers }}>
        {slotLabel('answers')}
        <div className="grid grid-cols-2 gap-1.5 flex-1 min-h-0">
          {enc.answers.map((a, i) => {
            const on = answer === i;
            const dim = !ready;
            return (
              <button
                key={i}
                onClick={() => ready && !result && setAnswer(i)}
                className="text-left px-2.5 py-1.5 text-[11px] leading-tight overflow-hidden"
                style={{
                  ...panel,
                  boxShadow: on && t.shadow ? `3px 3px 0 ${c.accent}` : 'none',
                  background: on ? c.panel2 : c.panel,
                  border: `1.5px solid ${on ? c.accent : c.line}`,
                  opacity: dim ? 0.45 : 1,
                  color: result && i === enc.correct ? c.good : c.ink,
                }}
              >
                <span className="font-mono text-[9px] mr-1" style={{ color: c.inkMuted }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {a}
              </button>
            );
          })}
        </div>
        <button
          onClick={confirm}
          disabled={!ready || answer === null || !!result || needsDistinct}
          className="shrink-0 h-[40px] font-bold text-[13px]"
          style={{
            background: ready && answer !== null && !result && !needsDistinct ? c.accent : c.panel2,
            color: ready && answer !== null && !result && !needsDistinct ? c.accentInk : c.inkMuted,
            borderRadius: R,
            fontFamily: t.font.display,
            textTransform: up,
            letterSpacing: t.id === 'street' ? 1 : 0,
          }}
        >
          {result
            ? '—'
            : needsDistinct
              ? 'нужны разные источники'
              : !ready
                ? `выберите улики · ${selected.length}/${need}`
                : answer === null
                  ? 'выберите ответ'
                  : t.id === 'terminal'
                    ? 'commit ↵'
                    : 'Подтвердить'}
        </button>
      </div>

      {/* SLOT 7 · NAV (anchored bottom) */}
      <div className="relative shrink-0 flex" style={{ ...panel, boxShadow: 'none', height: d.nav }}>
        {slotLabel('nav · bottom')}
        {t.nav.map((n, i) => (
          <div
            key={n}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-[10px]"
            style={{ color: i === 0 ? c.ink : c.inkMuted, fontFamily: t.font.display, textTransform: up }}
          >
            <span className="w-5 h-0.5" style={{ background: i === 0 ? c.accent : 'transparent', borderRadius: R }} />
            {n}
          </div>
        ))}
      </div>

      {/* toast */}
      {toast && (
        <div
          className="absolute left-1/2 -translate-x-1/2 text-[11px] px-3 py-1.5 z-30"
          style={{ bottom: d.nav + d.pad + 8, background: c.ink, color: c.bg, borderRadius: R }}
        >
          {toast}
        </div>
      )}

      {/* ritual overlay */}
      {showOnboarding && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end p-5" style={{ background: `${c.bg}ee` }}>
          <div className="text-[10px] font-mono mb-2" style={{ color: c.inkMuted }}>
            уровень {t.levels[0]} · граница эпохи
          </div>
          <div className="font-bold leading-none mb-3" style={{ fontFamily: t.font.display, fontSize: 34, color: c.accent, textTransform: up }}>
            Эпоха сменилась
          </div>
          <div className="text-[15px] font-bold mb-1" style={{ fontFamily: t.font.display }}>
            {t.name} · {t.motto}
          </div>
          <div className="text-[12px] leading-snug mb-4" style={{ color: c.inkMuted }}>
            {t.operation.rule}
          </div>
          <div className="flex flex-col gap-1 text-[11px] mb-5">
            <div className="flex justify-between" style={{ borderBottom: `1px solid ${c.line}`, paddingBottom: 4 }}>
              <span style={{ color: c.inkMuted }}>улик для ответа</span>
              <span className="font-mono">{need}</span>
            </div>
            <div className="flex justify-between" style={{ borderBottom: `1px solid ${c.line}`, paddingBottom: 4 }}>
              <span style={{ color: c.inkMuted }}>инструменты</span>
              <span className="font-mono">
                {Object.values(t.crutches).filter(Boolean).length}/4
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: c.inkMuted }}>скелет экрана</span>
              <span className="font-mono">без изменений</span>
            </div>
          </div>
          <button
            onClick={() => setShowOnboarding(false)}
            className="h-12 font-bold text-[14px]"
            style={{ background: c.accent, color: c.accentInk, borderRadius: R, fontFamily: t.font.display, textTransform: up }}
          >
            Понял, в арену
          </button>
        </div>
      )}
    </div>
  );
}
