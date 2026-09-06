// SIGNAL ARENA — вертикальный поток вместо магических координат.
import { SP } from './tokens';

export class Flow {
  private cursor: number;
  private readonly gapDefault: number;
  constructor(startY: number, gap: number = SP.md) {
    this.cursor = startY;
    this.gapDefault = gap;
  }
  get y(): number { return this.cursor; }
  take(h: number, gap?: number): number {
    const y = this.cursor;
    this.cursor += h + (gap ?? this.gapDefault);
    return y;
  }
  gap(h: number): void { this.cursor += h; }
  moveTo(y: number): void { this.cursor = y; }
  remaining(bottom: number): number { return Math.max(0, bottom - this.cursor); }
}

let insetsCache: { top: number; bottom: number } | null = null;
export function resetSafeAreaCache(): void { insetsCache = null; }

export function safeAreaInsets(): { top: number; bottom: number } {
  if (insetsCache) return insetsCache;
  if (typeof window === 'undefined' || typeof getComputedStyle !== 'function') return { top: 0, bottom: 0 };
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;' +
    'padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);';
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const top = parseFloat(cs.paddingTop) || 0;
  const bottom = parseFloat(cs.paddingBottom) || 0;
  probe.remove();
  insetsCache = { top, bottom };
  return insetsCache;
}
