// Свечной виджет-источник «chart». Рисуется кодом, детерминированно по seed.
import Phaser from 'phaser';
import type { Palette } from './palette';
import { RADIUS } from './tokens';

export interface Candle { o: number; h: number; l: number; c: number; v: number }

function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export function genCandles(kind: 'fakeBreakout' | 'pump' | 'range' | 'dump', seed = 7, n = 28): Candle[] {
  const r = rng(seed);
  const out: Candle[] = [];
  let price = 100;
  for (let i = 0; i < n; i++) {
    let drift = 0;
    let vol = 1.2;
    if (kind === 'range') drift = (100 - price) * 0.15;
    if (kind === 'pump') drift = i > n * 0.6 ? 3.5 : 0.2;
    if (kind === 'dump') drift = i > n * 0.55 ? -3.2 : 0.3;
    if (kind === 'fakeBreakout') { drift = (104 - price) * 0.1; if (i === n - 3) drift = 6; if (i === n - 2) drift = -7; }
    const o = price;
    const c = o + drift + (r() - 0.5) * vol * 2;
    const h = Math.max(o, c) + r() * vol;
    const l = Math.min(o, c) - r() * vol;
    vol = 0.6 + r() * 1.6;
    out.push({ o, h, l, c, v: vol * (kind === 'fakeBreakout' && i === n - 3 ? 0.4 : 1) });
    price = c;
  }
  return out;
}

export function drawCandleChart(
  scene: Phaser.Scene, x: number, y: number, w: number, h: number, candles: Candle[], p: Palette,
  opts: { level?: number } = {},
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(p.insetN, 1);
  g.fillRoundedRect(0, 0, w, h, RADIUS.md);
  g.lineStyle(1, p.borderN, 1);
  g.strokeRoundedRect(0, 0, w, h, RADIUS.md);

  const pad = 10;
  const volH = Math.round(h * 0.18);
  const chartH = h - pad * 2 - volH - 6;
  const min = Math.min(...candles.map((c) => c.l));
  const max = Math.max(...candles.map((c) => c.h));
  const maxV = Math.max(...candles.map((c) => c.v));
  const sy = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * chartH;
  const cw = (w - pad * 2) / candles.length;

  g.lineStyle(1, p.borderN, 0.6);
  for (let i = 1; i < 4; i++) g.lineBetween(pad, pad + (chartH / 4) * i, w - pad, pad + (chartH / 4) * i);

  if (opts.level !== undefined) {
    g.lineStyle(1, p.warnN, 0.9);
    const ly = sy(opts.level);
    for (let lx = pad; lx < w - pad; lx += 8) g.lineBetween(lx, ly, lx + 4, ly);
  }

  candles.forEach((c, i) => {
    const cx = pad + i * cw + cw / 2;
    const up = c.c >= c.o;
    const col = up ? p.goodN : p.badN;
    g.lineStyle(1, col, 1);
    g.lineBetween(cx, sy(c.h), cx, sy(c.l));
    const top = sy(Math.max(c.o, c.c));
    const bh = Math.max(1.5, Math.abs(sy(c.o) - sy(c.c)));
    g.fillStyle(col, 1);
    g.fillRect(cx - cw * 0.3, top, cw * 0.6, bh);
    const vh = (c.v / maxV) * volH;
    g.fillStyle(col, 0.35);
    g.fillRect(cx - cw * 0.3, h - pad - vh, cw * 0.6, vh);
  });
  return g;
}
