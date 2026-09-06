import { useMemo } from "react";
import type { Candle } from "../data/game";
import { cn } from "../utils/cn";

type Props = {
  candles: Candle[];
  future?: Candle[];
  revealed?: number; // how many future candles shown
  volumes?: number[];
  level?: number;
  entry?: number;
  stop?: number;
  showVolume?: boolean;
  scanning?: boolean;
  highlightVolume?: boolean;
  highlightWicks?: boolean;
  className?: string;
  height?: number;
};

export default function CandleChart({
  candles,
  future = [],
  revealed = 0,
  volumes = [],
  level,
  entry,
  stop,
  showVolume = true,
  scanning = false,
  highlightVolume = false,
  highlightWicks = false,
  className,
  height = 240,
}: Props) {
  const W = 600;
  const H = height;
  const volH = showVolume ? 44 : 0;
  const padTop = 14;
  const padBottom = 8;
  const chartH = H - volH - padTop - padBottom;

  const all = useMemo(() => [...candles, ...future.slice(0, revealed)], [candles, future, revealed]);
  const total = candles.length + future.length;
  const slot = W / (total + 1);
  const bodyW = Math.max(6, slot * 0.58);

  const { min, max } = useMemo(() => {
    const src = [...candles, ...future];
    let mn = Infinity;
    let mx = -Infinity;
    src.forEach(([, h, l]) => {
      mn = Math.min(mn, l);
      mx = Math.max(mx, h);
    });
    if (level != null) {
      mn = Math.min(mn, level);
      mx = Math.max(mx, level);
    }
    const padd = (mx - mn) * 0.08;
    return { min: mn - padd, max: mx + padd };
  }, [candles, future, level]);

  const y = (p: number) => padTop + ((max - p) / (max - min)) * chartH;
  const x = (i: number) => slot * (i + 0.7);

  const last = all[all.length - 1];
  const lastClose = last?.[3] ?? 0;
  const prevClose = all[all.length - 2]?.[3] ?? lastClose;

  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-ink/60", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" preserveAspectRatio="none">
        {/* grid */}
        {[0.2, 0.4, 0.6, 0.8].map((g) => (
          <line key={g} x1={0} x2={W} y1={padTop + chartH * g} y2={padTop + chartH * g} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
        ))}

        {/* future zone */}
        {future.length > 0 && (
          <rect x={x(candles.length) - slot * 0.5} y={0} width={W - x(candles.length) + slot * 0.5} height={H} fill="rgba(255,255,255,0.025)" />
        )}

        {/* key level */}
        {level != null && (
          <g>
            <line x1={0} x2={W} y1={y(level)} y2={y(level)} stroke="#ffb341" strokeWidth={1.2} strokeDasharray="6 5" />
            <rect x={W - 62} y={y(level) - 9} width={62} height={18} rx={4} fill="#ffb341" />
            <text x={W - 31} y={y(level) + 4} textAnchor="middle" fontSize={10} fontFamily="Oswald, sans-serif" fontWeight={700} fill="#0a0b0d">
              LEVEL {level}
            </text>
          </g>
        )}

        {/* volumes */}
        {showVolume &&
          volumes.map((v, i) => {
            const c = candles[i];
            if (!c) return null;
            const up = c[3] >= c[0];
            const h = v * (volH - 6);
            const low = v < 0.4;
            return (
              <rect
                key={i}
                x={x(i) - bodyW / 2}
                y={H - padBottom - h}
                width={bodyW}
                height={h}
                rx={1.5}
                fill={highlightVolume && low ? "#ff4d5e" : up ? "rgba(74,222,128,0.35)" : "rgba(255,77,94,0.35)"}
                className={highlightVolume && low ? "animate-pulse-live" : undefined}
              />
            );
          })}

        {/* candles */}
        {all.map(([o, h, l, c], i) => {
          const up = c >= o;
          const color = up ? "#4ade80" : "#ff4d5e";
          const top = y(Math.max(o, c));
          const bot = y(Math.min(o, c));
          const isNew = i >= candles.length;
          const touchesLevel = level != null && l <= level + 1.5 && c > level && !up === false;
          return (
            <g key={i} className={isNew ? "animate-pop" : undefined} style={{ transformOrigin: `${x(i)}px ${y(c)}px` }}>
              <line x1={x(i)} x2={x(i)} y1={y(h)} y2={y(l)} stroke={highlightWicks && touchesLevel ? "#c8ff00" : color} strokeWidth={highlightWicks && touchesLevel ? 3 : 1.6} />
              <rect x={x(i) - bodyW / 2} y={top} width={bodyW} height={Math.max(2, bot - top)} rx={2} fill={color} />
            </g>
          );
        })}

        {/* entry / stop */}
        {entry != null && (
          <g>
            <line x1={x(candles.length - 1)} x2={W} y1={y(entry)} y2={y(entry)} stroke="#c8ff00" strokeWidth={1.2} strokeDasharray="3 4" />
            <text x={x(candles.length - 1) + 4} y={y(entry) - 4} fontSize={10} fontFamily="Oswald, sans-serif" fontWeight={700} fill="#c8ff00">
              ВХОД {entry}
            </text>
          </g>
        )}
        {stop != null && (
          <g>
            <line x1={x(candles.length - 1)} x2={W} y1={y(stop)} y2={y(stop)} stroke="#ff4d5e" strokeWidth={1.2} strokeDasharray="3 4" />
            <text x={x(candles.length - 1) + 4} y={y(stop) + 12} fontSize={10} fontFamily="Oswald, sans-serif" fontWeight={700} fill="#ff4d5e">
              СТОП {stop.toFixed(1)}
            </text>
          </g>
        )}

        {/* last price tag */}
        <g>
          <line x1={0} x2={W} y1={y(lastClose)} y2={y(lastClose)} stroke={lastClose >= prevClose ? "rgba(74,222,128,0.4)" : "rgba(255,77,94,0.4)"} strokeWidth={1} />
          <rect x={0} y={y(lastClose) - 9} width={44} height={18} rx={4} fill={lastClose >= prevClose ? "#4ade80" : "#ff4d5e"} />
          <text x={22} y={y(lastClose) + 4} textAnchor="middle" fontSize={10} fontFamily="Oswald, sans-serif" fontWeight={700} fill="#0a0b0d">
            {lastClose.toFixed(1)}
          </text>
        </g>
      </svg>

      {scanning && <div className="scan-line animate-scan" />}
    </div>
  );
}
