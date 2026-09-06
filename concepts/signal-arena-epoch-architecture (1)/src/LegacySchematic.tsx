import type { EpochTheme } from './themes';

/** Схема текущей вёрстки: фиксированные Y, brick:false → блок вопроса выше, nav прибита к 784. */
export default function LegacySchematic({ theme, brickOff }: { theme: EpochTheme; brickOff: boolean }) {
  const c = theme.colors;
  const qH = brickOff ? 120 : 80;
  const blocks = [
    { name: 'rail', y: 12, h: 48 },
    { name: 'question' + (brickOff ? ' · brick:false → +40' : ''), y: 68, h: qH },
    { name: 'threat', y: 156, h: 28 },
    { name: 'browser · fixed 240', y: 192, h: 240 },
    { name: 'evidence', y: 440, h: 60 },
    { name: 'cards 4×1', y: 508, h: 76 },
    { name: 'answers 2×2', y: 592, h: 150 },
    { name: 'nav · y=784', y: 784, h: 56 },
  ];
  const gapTop = 742;
  const gapH = 784 - gapTop;

  return (
    <div className="relative overflow-hidden" style={{ width: 390, height: 844, background: c.bg, color: c.ink, fontFamily: 'ui-monospace, Menlo, monospace' }}>
      {blocks.map((b) => (
        <div
          key={b.name}
          className="absolute left-3 right-3 flex items-start px-2 py-1 text-[10px]"
          style={{
            top: b.y,
            height: b.h,
            background: c.panel,
            border: `1px dashed ${c.inkMuted}`,
            borderRadius: theme.radius,
            opacity: 0.9,
          }}
        >
          <span style={{ color: c.inkMuted }}>y={b.y}</span>
          <span className="ml-2">{b.name}</span>
        </div>
      ))}
      {brickOff && (
        <div
          className="absolute left-3 right-3 flex items-center justify-center text-[10px] font-bold"
          style={{ top: 156, height: 32, background: 'rgba(255,61,61,0.35)', border: '1px solid #ff3d3d', color: '#fff' }}
        >
          перекрытие: question ∩ threat
        </div>
      )}
      <div
        className="absolute left-3 right-3 flex items-center justify-center text-[10px] font-bold"
        style={{ top: gapTop, height: gapH, background: 'rgba(255,61,61,0.35)', border: '1px solid #ff3d3d', color: '#fff' }}
      >
        дыра {gapH}px между answers и nav
      </div>
      <div className="absolute left-3 bottom-0 text-[9px] px-1" style={{ color: c.inkMuted }}>
        844 − 840 = 4px под nav · при 844×390 всё сплющено
      </div>
    </div>
  );
}
