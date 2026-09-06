// SIGNAL ARENA — типографика. Только через эти фабрики, без инлайновых размеров.
import type Phaser from 'phaser';
import type { Palette } from './palette';
import { FS, LINE } from './tokens';

type Style = Phaser.Types.GameObjects.Text.TextStyle;
interface Opts { color?: string; align?: string; wrap?: number; weight?: string }

function base(p: Palette, family: string, size: number, line: number, o: Opts = {}): Style {
  const s: Style = {
    fontFamily: family,
    fontSize: `${size}px`,
    color: o.color ?? p.text,
    align: o.align ?? 'left',
    lineSpacing: Math.round(size * (line - 1)),
  };
  if (o.weight) s.fontStyle = o.weight;
  if (o.wrap) s.wordWrap = { width: o.wrap, useAdvancedWrap: true };
  return s;
}

export const caption = (p: Palette, o: Opts = {}) => base(p, p.fontUi, FS.caption, LINE.normal, { color: p.muted, ...o });
export const body = (p: Palette, o: Opts = {}) => base(p, p.fontUi, FS.body, LINE.normal, o);
export const bodyLg = (p: Palette, o: Opts = {}) => base(p, p.fontUi, FS.bodyLg, LINE.normal, o);
export const title = (p: Palette, o: Opts = {}) => base(p, p.fontHead, FS.title, LINE.tight, { weight: '600', ...o });
export const display = (p: Palette, o: Opts = {}) => base(p, p.fontHead, FS.display, LINE.tight, { weight: '700', ...o });
export const button = (p: Palette, o: Opts = {}) => base(p, p.fontUi, FS.bodyLg, LINE.tight, { weight: '600', ...o });
export const code = (p: Palette, o: Opts = {}) => base(p, p.fontMono, FS.caption, LINE.tight, { color: p.sub, ...o });
export const num = (p: Palette, o: Opts = {}) => base(p, p.fontMono, FS.body, LINE.tight, { weight: '600', ...o });
export const numLg = (p: Palette, o: Opts = {}) => base(p, p.fontMono, FS.title, LINE.tight, { weight: '600', ...o });
