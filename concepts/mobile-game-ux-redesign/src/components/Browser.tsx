import { useMemo } from 'react';
import type { Encounter, SourceId, EvidenceZone } from '../data/encounter';
import type { EpochDef } from '../theme/epochs';
import { cn } from '../utils/cn';

// БРАУЗЕР — стабильный контракт. Не меняется между эпохами, кроме токенов и набора вкладок.
// props: encounter, epoch, activeTab, selected, blindOpened, onTab, onToggleEvidence, onOpenBlind

interface Props {
  encounter: Encounter;
  epoch: EpochDef;
  activeTab: SourceId;
  selected: Set<string>;
  blindOpened: boolean;
  locked?: boolean;
  onTab: (s: SourceId) => void;
  onToggleEvidence: (id: string) => void;
  onOpenBlind: () => void;
}

const TAB_NAME: Record<SourceId, string> = {
  chart: 'График',
  news: 'Лента',
  orderbook: 'Стакан',
  position: 'Позиция',
};

export function Browser({ encounter, epoch, activeTab, selected, blindOpened, locked, onTab, onToggleEvidence, onOpenBlind }: Props) {
  const st = epoch.structure;
  const tabs = encounter.sources;
  const blindIndex = st.blindTab ? tabs.length - 1 : -1;

  return (
    <section
      aria-label="Браузер источников"
      className="overflow-hidden border"
      style={{ borderColor: 'var(--strong)', borderRadius: 'var(--radius)', background: 'var(--bg)' }}
    >
      {/* хром */}
      <div className="flex items-center gap-2 border-b px-3 py-1.5" style={{ borderColor: 'var(--border)', background: 'var(--elevated)' }}>
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--muted)' }} />
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--muted)' }} />
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--muted)' }} />
        </div>
        <div className="flex-1 truncate rounded px-2 py-0.5 text-[10px]" style={{ background: 'var(--bg)', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          arena://sandbox/{encounter.id.toLowerCase()}
        </div>
        <span className="text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          {encounter.ticker} · {encounter.timeframe}
        </span>
      </div>

      {/* табы — максимум 3 + слепая */}
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        {tabs.map((s, i) => {
          const active = s === activeTab;
          const blind = i === blindIndex && !blindOpened;
          const count = encounter.evidence.filter((e) => e.source === s && selected.has(e.id)).length;
          return (
            <button
              key={s}
              onClick={() => (blind ? onOpenBlind() : onTab(s))}
              className="relative flex flex-1 items-center justify-center gap-1.5 py-2 text-[12px] font-medium transition-colors"
              style={{
                color: active ? 'var(--text)' : 'var(--sub)',
                background: active ? 'var(--surface)' : 'transparent',
                fontFamily: 'var(--font-ui)',
              }}
            >
              {blind ? <LockIcon /> : null}
              <span>{TAB_NAME[s]}</span>
              {count > 0 && (
                <span className="rounded-full px-1.5 text-[10px] font-semibold" style={{ background: 'var(--good)', color: '#04140a' }}>
                  {count}
                </span>
              )}
              {active && <span className="absolute inset-x-3 bottom-0 h-0.5" style={{ background: 'var(--accent)' }} />}
            </button>
          );
        })}
      </div>

      {/* содержимое */}
      <div className="relative" style={{ background: 'var(--surface)', minHeight: 196 }}>
        {activeTab === 'chart' && <ChartView encounter={encounter} epoch={epoch} selected={selected} locked={locked} onToggle={onToggleEvidence} />}
        {activeTab === 'news' && <NewsView encounter={encounter} selected={selected} locked={locked} onToggle={onToggleEvidence} />}
        {activeTab === 'orderbook' && <OrderbookView encounter={encounter} epoch={epoch} selected={selected} locked={locked} onToggle={onToggleEvidence} />}
        {activeTab === 'position' && <PositionView encounter={encounter} selected={selected} locked={locked} onToggle={onToggleEvidence} />}
      </div>
    </section>
  );
}

/* ---------- ГРАФИК (внутренняя механика сохранена: свечи + объём + зоны-улики) ---------- */

function ChartView({ encounter, epoch, selected, locked, onToggle }: { encounter: Encounter; epoch: EpochDef; selected: Set<string>; locked?: boolean; onToggle: (id: string) => void }) {
  const { candles } = encounter;
  const W = 362;
  const H = 150;
  const VH = 26;
  const padX = 10;
  const cw = (W - padX * 2) / candles.length;

  const { min, max } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    candles.forEach((c) => {
      min = Math.min(min, c.l);
      max = Math.max(max, c.h);
    });
    return { min: min - 0.5, max: max + 0.5 };
  }, [candles]);

  const y = (p: number) => 8 + ((max - p) / (max - min)) * (H - 16 - VH);
  const zones = encounter.evidence.filter((z) => z.source === 'chart');
  const hl = epoch.structure.evidenceHighlight;

  return (
    <div className="px-2 pb-2 pt-1">
      <div className="mb-1 flex items-center justify-between px-1 text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
        <span>свечи + объём</span>
        <span>{hl ? 'улики подсвечены' : 'найди улику сам'}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" style={{ height: 'auto' }}>
        {/* сетка */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={0} x2={W} y1={8 + f * (H - 16 - VH)} y2={8 + f * (H - 16 - VH)} stroke="var(--border)" strokeWidth={1} strokeDasharray="2 4" />
        ))}
        {/* объём */}
        {candles.map((c, i) => {
          const up = c.c >= c.o;
          const bh = c.v * VH;
          return <rect key={`v${i}`} x={padX + i * cw + cw * 0.2} y={H - bh} width={cw * 0.6} height={bh} fill={up ? 'var(--good)' : 'var(--bad)'} opacity={0.35} />;
        })}
        {/* свечи */}
        {candles.map((c, i) => {
          const up = c.c >= c.o;
          const x = padX + i * cw + cw / 2;
          const col = up ? 'var(--good)' : 'var(--bad)';
          const top = y(Math.max(c.o, c.c));
          const bot = y(Math.min(c.o, c.c));
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={1.2} />
              <rect x={x - cw * 0.3} y={top} width={cw * 0.6} height={Math.max(2, bot - top)} fill={col} rx={1} />
            </g>
          );
        })}
        {/* зоны улик */}
        {zones.map((z) => {
          const i = z.candle ?? 0;
          const x = padX + i * cw;
          const sel = selected.has(z.id);
          const showHint = hl;
          return (
            <g key={z.id} onClick={() => !locked && onToggle(z.id)} style={{ cursor: locked ? 'default' : 'pointer' }}>
              <rect
                x={x - 2}
                y={2}
                width={cw + 4}
                height={H - 4}
                rx={4}
                fill={sel ? 'var(--good)' : showHint ? 'var(--accent)' : 'transparent'}
                opacity={sel ? 0.16 : showHint ? 0.1 : 0}
                stroke={sel ? 'var(--good)' : showHint ? 'var(--accent)' : 'transparent'}
                strokeWidth={1}
                strokeDasharray={sel ? undefined : '3 3'}
              />
              {/* невидимая, но большая зона тапа */}
              <rect x={x - 6} y={0} width={cw + 12} height={H} fill="transparent" />
              {sel && (
                <g>
                  <circle cx={x + cw / 2} cy={10} r={7} fill="var(--good)" />
                  <path d={`M${x + cw / 2 - 3} 10 l2 2 l4 -4`} stroke="#04140a" strokeWidth={1.6} fill="none" strokeLinecap="round" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      {/* подпись под графиком — зависит от режима ярлыков */}
      <ChartCaption epoch={epoch} />
    </div>
  );
}

function ChartCaption({ epoch }: { epoch: EpochDef }) {
  const l = epoch.structure.labels;
  const base = 'mt-1 inline-flex items-center gap-1.5 rounded px-2 py-1 text-[10px]';
  const mono = { fontFamily: 'var(--font-mono)' } as const;
  if (l === 'all')
    return (
      <div className={base} style={{ ...mono, background: 'color-mix(in srgb, var(--warn) 14%, transparent)', color: 'var(--warn)' }}>
        ЯРЛЫК · рост без объёма — тапни подсвеченные свечи
      </div>
    );
  if (l === 'partial')
    return (
      <div className={base} style={{ ...mono, color: 'var(--sub)' }}>
        объём −38% к среднему за 20 свечей
      </div>
    );
  if (l === 'false')
    return (
      <div className={base} style={{ ...mono, background: 'color-mix(in srgb, var(--good) 12%, transparent)', color: 'var(--good)' }}>
        ОБЪЁМ ПОДТВЕРЖДЁН ✓
      </div>
    );
  return (
    <div className={base} style={{ ...mono, color: 'var(--muted)' }}>
      сырые данные — классифицируй сам
    </div>
  );
}

/* ---------- ЛЕНТА ---------- */

function NewsView({ encounter, selected, locked, onToggle }: { encounter: Encounter; selected: Set<string>; locked?: boolean; onToggle: (id: string) => void }) {
  return (
    <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
      {encounter.news.map((n) => {
        const ev = n.evidenceId;
        const sel = ev ? selected.has(ev) : false;
        const tone = n.label?.tone;
        return (
          <li key={n.id} style={{ borderColor: 'var(--border)' }}>
            <button
              disabled={locked}
              onClick={() => ev && onToggle(ev)}
              className="flex w-full items-start gap-3 px-3 py-2.5 text-left"
              style={{ background: sel ? 'color-mix(in srgb, var(--good) 10%, transparent)' : 'transparent' }}
            >
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]"
                style={{ borderColor: sel ? 'var(--good)' : 'var(--strong)', background: sel ? 'var(--good)' : 'transparent', color: '#04140a' }}
              >
                {sel ? '✓' : ''}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] leading-snug" style={{ color: 'var(--text)' }}>
                  {n.title}
                </span>
                <span className="mt-0.5 block text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  {n.src} · {n.time}
                </span>
              </span>
              {n.label && (
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wide"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: tone === 'good' ? 'var(--good)' : tone === 'bad' ? 'var(--bad)' : 'var(--warn)',
                    background: `color-mix(in srgb, ${tone === 'good' ? 'var(--good)' : tone === 'bad' ? 'var(--bad)' : 'var(--warn)'} 12%, transparent)`,
                  }}
                >
                  {n.label.text}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- СТАКАН ---------- */

function OrderbookView({ encounter, epoch, selected, locked, onToggle }: { encounter: Encounter; epoch: EpochDef; selected: Set<string>; locked?: boolean; onToggle: (id: string) => void }) {
  const bids = [0.82, 1.4, 0.6, 0.35, 0.2];
  const asks = [0.9, 0.4, 0.3, 0.25, 0.15];
  const zone = encounter.evidence.find((z) => z.source === 'orderbook')!;
  const dense = epoch.index === 4;
  return (
    <div className="p-3">
      <div className="grid grid-cols-2 gap-2 text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>
        <div>
          {bids.map((b, i) => (
            <div key={i} className="relative mb-0.5 flex justify-between px-1.5 py-0.5" style={{ color: 'var(--good)' }}>
              <span className="absolute inset-y-0 right-0 opacity-15" style={{ width: `${b * 60}%`, background: 'var(--good)' }} />
              <span>{(67210 - i * 8).toLocaleString('ru')}</span>
              <span>{b.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div>
          {asks.map((a, i) => (
            <div key={i} className="relative mb-0.5 flex justify-between px-1.5 py-0.5" style={{ color: 'var(--bad)' }}>
              <span className="absolute inset-y-0 left-0 opacity-15" style={{ width: `${a * 60}%`, background: 'var(--bad)' }} />
              <span>{(67222 + i * 8).toLocaleString('ru')}</span>
              <span>{a.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
      {dense && (
        <div className="mt-2 flex justify-between text-[10px]" style={{ color: 'var(--sub)', fontFamily: 'var(--font-mono)' }}>
          <span>FUNDING +0.012%</span>
          <span>OI ↑ 3.1%</span>
          <span>LIQ −3% кластер</span>
        </div>
      )}
      <EvidenceRow zone={zone} selected={selected.has(zone.id)} locked={locked} onToggle={onToggle} />
    </div>
  );
}

/* ---------- ПОЗИЦИЯ ---------- */

function PositionView({ encounter, selected, locked, onToggle }: { encounter: Encounter; selected: Set<string>; locked?: boolean; onToggle: (id: string) => void }) {
  const zone = encounter.evidence.find((z) => z.source === 'position')!;
  const rows = [
    ['Депозит', '2 400'],
    ['Риск на сделку', '1% = 24'],
    ['Стоп', '2.1%'],
    ['Плечо', '×4'],
    ['Серия', 'L · L · W'],
  ];
  return (
    <div className="p-3">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]" style={{ fontFamily: 'var(--font-mono)' }}>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between border-b py-1" style={{ borderColor: 'var(--border)' }}>
            <span style={{ color: 'var(--muted)' }}>{k}</span>
            <span style={{ color: 'var(--text)' }}>{v}</span>
          </div>
        ))}
      </div>
      <EvidenceRow zone={zone} selected={selected.has(zone.id)} locked={locked} onToggle={onToggle} />
    </div>
  );
}

function EvidenceRow({ zone, selected, locked, onToggle }: { zone: EvidenceZone; selected: boolean; locked?: boolean; onToggle: (id: string) => void }) {
  return (
    <button
      disabled={locked}
      onClick={() => onToggle(zone.id)}
      className={cn('mt-3 flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left text-[11px]')}
      style={{
        borderColor: selected ? 'var(--good)' : 'var(--border)',
        background: selected ? 'color-mix(in srgb, var(--good) 10%, transparent)' : 'var(--elevated)',
        color: 'var(--text)',
      }}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full border text-[9px]" style={{ borderColor: selected ? 'var(--good)' : 'var(--strong)', background: selected ? 'var(--good)' : 'transparent', color: '#04140a' }}>
        {selected ? '✓' : ''}
      </span>
      {zone.label}
    </button>
  );
}

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
