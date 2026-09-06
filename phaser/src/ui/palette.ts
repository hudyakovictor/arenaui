// SIGNAL ARENA — базовые токены оформления.
// Одна палитра для фундамента. Stage-specific палитры — будущая идея.
export interface Palette {
  bgN: number; insetN: number; surfaceN: number; elevatedN: number; hoverN: number;
  borderN: number; strongN: number;
  accent: string; accentN: number; accentInk: string;
  good: string; goodN: number; bad: string; badN: number; warn: string; warnN: number;
  text: string; sub: string; muted: string; info: string; crypto: string;
  textN: number; subN: number; mutedN: number; cryptoN: number;
  paperN: number; inkText: string; inkSub: string;
  fontHead: string; fontUi: string; fontMono: string;
  brick: boolean;
}

const MONO = 'IBM Plex Mono, Consolas, monospace';
const UI = 'Inter, system-ui, sans-serif';
const HEAD = 'Oswald, Inter, system-ui, sans-serif';

export const PALETTE: Palette = {
  bgN: 0x0a0b0d, insetN: 0x0a0b0d, surfaceN: 0x16181d, elevatedN: 0x1e2126, hoverN: 0x262a31,
  borderN: 0x33383f, strongN: 0x454b55,
  accent: '#c8ff00', accentN: 0xc8ff00, accentInk: '#0a0b0d',
  good: '#4ade80', goodN: 0x4ade80, bad: '#ff4d5e', badN: 0xff4d5e, warn: '#ffb341', warnN: 0xffb341,
  text: '#f2f3f5', sub: '#b8bcc4', muted: '#7d838d',
  textN: 0xf2f3f5, subN: 0xb8bcc4, mutedN: 0x7d838d, cryptoN: 0xa855f7, info: '#45e0d0', crypto: '#a855f7',
  paperN: 0x16181d, inkText: '#f2f3f5', inkSub: 'rgba(242,243,245,0.55)',
  fontHead: HEAD, fontUi: UI, fontMono: MONO,
  brick: true,
};

