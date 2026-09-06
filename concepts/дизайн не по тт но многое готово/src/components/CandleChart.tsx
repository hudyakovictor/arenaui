import { useEffect, useRef, useState } from "react";
import type { Candle } from "../utils/scenario";

type Props = {
  candles: Candle[];
  level?: number;
  entry?: number;
  stop?: number;
  dir?: "long" | "short" | "flat";
  height?: number;
  revealFrom?: number; // index from which candles are "future" (shaded)
  showVolume?: boolean;
  mini?: boolean;
  className?: string;
};

export function CandleChart({ candles, level, entry, stop, dir = "flat", height = 220, revealFrom, showVolume = true, mini, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [w, setW] = useState(360);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const cv = ref.current;
    if (!cv || candles.length === 0) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = w * dpr;
    cv.height = height * dpr;
    const ctx = cv.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, height);

    const padR = mini ? 6 : 54;
    const padL = 6;
    const padT = 10;
    const volH = showVolume ? Math.round(height * 0.18) : 0;
    const padB = volH + 8;
    const plotW = w - padL - padR;
    const plotH = height - padT - padB;

    // Reserve visual room to the right for future candles so the chart doesn't jump
    const total = candles.length;
    const slot = plotW / total;
    const bodyW = Math.max(2, slot * 0.62);

    let min = Infinity, max = -Infinity;
    candles.forEach((c) => { min = Math.min(min, c.l); max = Math.max(max, c.h); });
    if (level) { min = Math.min(min, level); max = Math.max(max, level); }
    if (stop) { min = Math.min(min, stop); max = Math.max(max, stop); }
    const range = (max - min) || 1;
    min -= range * 0.06; max += range * 0.06;
    const y = (p: number) => padT + ((max - p) / (max - min)) * plotH;
    const x = (i: number) => padL + i * slot + slot / 2;
    const maxV = Math.max(...candles.map((c) => c.v));

    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const gy = padT + (plotH / 4) * g;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(w - padR, gy); ctx.stroke();
      if (!mini) {
        const price = max - ((max - min) / 4) * g;
        ctx.fillStyle = "#7d838d"; ctx.font = "10px Inter, system-ui"; ctx.textAlign = "left";
        ctx.fillText(price.toFixed(0), w - padR + 6, gy + 3);
      }
    }

    // future shade
    if (revealFrom !== undefined && revealFrom < total) {
      const fx = padL + revealFrom * slot;
      ctx.fillStyle = "rgba(200,255,0,0.035)";
      ctx.fillRect(fx, padT, w - padR - fx, plotH + padB);
      ctx.strokeStyle = "rgba(200,255,0,0.35)"; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(fx, padT); ctx.lineTo(fx, height - 4); ctx.stroke(); ctx.setLineDash([]);
    }

    // level line
    if (level) {
      ctx.strokeStyle = "rgba(200,255,0,0.75)"; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(padL, y(level)); ctx.lineTo(w - padR, y(level)); ctx.stroke(); ctx.setLineDash([]);
      if (!mini) {
        ctx.fillStyle = "#c8ff00"; ctx.fillRect(w - padR + 2, y(level) - 8, padR - 4, 16);
        ctx.fillStyle = "#0a0b0d"; ctx.font = "bold 10px Oswald, Inter"; ctx.textAlign = "left";
        ctx.fillText(level.toFixed(0), w - padR + 6, y(level) + 4);
      }
    }

    // volume
    if (showVolume) {
      candles.forEach((c, i) => {
        const up = c.c >= c.o;
        const vh = (c.v / maxV) * volH;
        ctx.fillStyle = up ? "rgba(74,222,128,0.35)" : "rgba(255,77,94,0.35)";
        ctx.fillRect(x(i) - bodyW / 2, height - 4 - vh, bodyW, vh);
      });
      // avg volume line
      const avg = candles.slice(-14).reduce((a, c) => a + c.v, 0) / Math.min(14, candles.length);
      const ay = height - 4 - (avg / maxV) * volH;
      ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(padL, ay); ctx.lineTo(w - padR, ay); ctx.stroke(); ctx.setLineDash([]);
    }

    // candles
    candles.forEach((c, i) => {
      const up = c.c >= c.o;
      const col = up ? "#4ade80" : "#ff4d5e";
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x(i), y(c.h)); ctx.lineTo(x(i), y(c.l)); ctx.stroke();
      const top = y(Math.max(c.o, c.c));
      const bh = Math.max(1.5, Math.abs(y(c.o) - y(c.c)));
      ctx.fillRect(x(i) - bodyW / 2, top, bodyW, bh);
      if (revealFrom !== undefined && i >= revealFrom) {
        ctx.shadowColor = col; ctx.shadowBlur = 6;
        ctx.fillRect(x(i) - bodyW / 2, top, bodyW, bh);
        ctx.shadowBlur = 0;
      }
    });

    // entry / stop
    const last = candles[candles.length - 1];
    if (entry && dir !== "flat") {
      ctx.strokeStyle = "#45e0d0"; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(padL, y(entry)); ctx.lineTo(w - padR, y(entry)); ctx.stroke(); ctx.setLineDash([]);
      if (!mini) {
        ctx.fillStyle = "#45e0d0"; ctx.fillRect(w - padR + 2, y(entry) - 8, padR - 4, 16);
        ctx.fillStyle = "#0a0b0d"; ctx.font = "bold 10px Oswald, Inter";
        ctx.fillText(dir === "long" ? "LONG" : "SHORT", w - padR + 6, y(entry) + 4);
      }
      // pnl zone
      const py = y(last.c);
      const pnlUp = dir === "long" ? last.c >= entry : last.c <= entry;
      ctx.fillStyle = pnlUp ? "rgba(74,222,128,0.10)" : "rgba(255,77,94,0.10)";
      ctx.fillRect(padL, Math.min(py, y(entry)), plotW, Math.abs(py - y(entry)));
    }
    if (stop && dir !== "flat") {
      ctx.strokeStyle = "#ff4d5e"; ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(padL, y(stop)); ctx.lineTo(w - padR, y(stop)); ctx.stroke(); ctx.setLineDash([]);
      if (!mini) {
        ctx.fillStyle = "#ff4d5e"; ctx.fillRect(w - padR + 2, y(stop) - 8, padR - 4, 16);
        ctx.fillStyle = "#fff"; ctx.font = "bold 10px Oswald, Inter";
        ctx.fillText("STOP", w - padR + 6, y(stop) + 4);
      }
    }

    // last price tag
    if (!mini) {
      const lp = y(last.c);
      const up = last.c >= last.o;
      ctx.fillStyle = up ? "#4ade80" : "#ff4d5e";
      ctx.fillRect(w - padR + 2, lp - 8, padR - 4, 16);
      ctx.fillStyle = "#0a0b0d"; ctx.font = "bold 10px Oswald, Inter";
      ctx.fillText(last.c.toFixed(0), w - padR + 6, lp + 4);
    }

    // crosshair
    if (hover !== null && !mini && candles[hover]) {
      const c = candles[hover];
      ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x(hover), padT); ctx.lineTo(x(hover), height - 4); ctx.stroke(); ctx.setLineDash([]);
      const txt = `O ${c.o.toFixed(0)}  H ${c.h.toFixed(0)}  L ${c.l.toFixed(0)}  C ${c.c.toFixed(0)}  V ${c.v.toFixed(0)}`;
      ctx.font = "11px Inter, system-ui"; ctx.textAlign = "left";
      const tw = ctx.measureText(txt).width + 12;
      ctx.fillStyle = "rgba(10,11,13,0.9)"; ctx.fillRect(padL, padT, tw, 18);
      ctx.fillStyle = c.c >= c.o ? "#4ade80" : "#ff4d5e"; ctx.fillText(txt, padL + 6, padT + 13);
    }
  }, [candles, level, entry, stop, dir, height, revealFrom, showVolume, mini, w, hover]);

  const onMove = (clientX: number) => {
    const el = wrap.current;
    if (!el || mini) return;
    const r = el.getBoundingClientRect();
    const padR = 54, padL = 6;
    const slot = (w - padL - padR) / candles.length;
    const i = Math.floor((clientX - r.left - padL) / slot);
    setHover(i >= 0 && i < candles.length ? i : null);
  };

  return (
    <div ref={wrap} className={className} style={{ height }}
      onMouseMove={(e) => onMove(e.clientX)} onMouseLeave={() => setHover(null)}
      onTouchStart={(e) => onMove(e.touches[0].clientX)} onTouchMove={(e) => onMove(e.touches[0].clientX)} onTouchEnd={() => setHover(null)}>
      <canvas ref={ref} style={{ width: w, height, display: "block" }} />
    </div>
  );
}
