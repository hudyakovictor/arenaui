// SIGNAL ARENA — виджеты. Все размеры — из tokens/ART. Всё интерактивное >= 44×44.
import Phaser from 'phaser';
import { ART, HIT, RADIUS, SP, DUR } from './tokens';
import type { Palette } from './palette';
import * as TX from './text';
import { icon } from '../assets/AssetKit';

/** Отклик на тап: короткое сжатие. */
export function tapFeedback(scene: Phaser.Scene, t: Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject) {
  scene.tweens.add({ targets: t, scaleX: 0.97, scaleY: 0.97, duration: DUR.tap / 2, yoyo: true, ease: 'Quad.easeOut' });
}

export function shakeNo(scene: Phaser.Scene, t: Phaser.GameObjects.Container) {
  const x0 = t.x;
  scene.tweens.add({ targets: t, x: x0 + 6, duration: 40, yoyo: true, repeat: 3, onComplete: () => t.setX(x0) });
}

/** Панель со скруглением и рамкой. */
export function panel(
  scene: Phaser.Scene, x: number, y: number, w: number, h: number, p: Palette,
  opts: { fill?: number; stroke?: number; radius?: number; alpha?: number; strokeW?: number } = {},
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y });
  const r = opts.radius ?? RADIUS.md;
  g.fillStyle(opts.fill ?? p.surfaceN, opts.alpha ?? 1);
  g.fillRoundedRect(0, 0, w, h, r);
  g.lineStyle(opts.strokeW ?? 1, opts.stroke ?? p.borderN, 1);
  g.strokeRoundedRect(0, 0, w, h, r);
  return g;
}

export interface ButtonOpts {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  hint?: string;
  width?: number;
  height?: number;
  /** id иконки слева от подписи. */
  icon?: string;
}

/** Кнопка: высота >= 48, hit-area >= 44, контрастный текст, опциональная иконка. */
export function button(
  scene: Phaser.Scene, x: number, y: number, label: string, p: Palette, onTap: () => void, opts: ButtonOpts = {},
): Phaser.GameObjects.Container {
  const w = opts.width ?? 200;
  const h = Math.max(opts.height ?? ART.button.h, HIT.min);
  const variant = opts.variant ?? 'primary';
  const disabled = !!opts.disabled;

  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  let fill = p.accentN, stroke = p.accentN, textColor = p.accentInk, tintN = p.accentN;
  if (disabled) { fill = p.elevatedN; stroke = p.borderN; textColor = p.muted; tintN = p.mutedN; }
  else if (variant === 'secondary') { fill = p.surfaceN; stroke = p.accentN; textColor = p.accent; tintN = p.accentN; }
  else if (variant === 'ghost') { fill = p.surfaceN; stroke = p.borderN; textColor = p.text; tintN = p.textN; }
  else if (variant === 'danger') { fill = p.badN; stroke = p.badN; textColor = '#ffffff'; tintN = 0xffffff; }
  if (variant === 'primary' && !disabled) tintN = Phaser.Display.Color.HexStringToColor(p.accentInk).color;

  g.fillStyle(fill, variant === 'ghost' ? 0.6 : 1);
  g.fillRoundedRect(0, 0, w, h, RADIUS.md);
  g.lineStyle(1, stroke, 1);
  g.strokeRoundedRect(0, 0, w, h, RADIUS.md);
  c.add(g);

  const hasHint = !!opts.hint;
  const t = scene.add.text(0, 0, label, TX.button(p, { color: textColor })).setOrigin(0.5);
  const iconW = opts.icon ? ART.icon.size + SP.sm : 0;
  const totalW = t.width + iconW;
  const startX = w / 2 - totalW / 2;
  if (opts.icon) c.add(icon(scene, startX + ART.icon.size / 2, h / 2 + (hasHint ? -8 : 0), opts.icon, tintN));
  t.setPosition(startX + iconW + t.width / 2, hasHint ? h / 2 - 8 : h / 2);
  c.add(t);
  if (hasHint) {
    c.add(scene.add.text(w / 2, h / 2 + 10, opts.hint!, TX.caption(p, { color: disabled ? p.muted : textColor })).setOrigin(0.5));
  }

  c.setSize(w, h);
  const hitH = Math.max(h, HIT.min);
  c.setInteractive(new Phaser.Geom.Rectangle(0, -(hitH - h) / 2, w, hitH), Phaser.Geom.Rectangle.Contains);
  c.on('pointerdown', () => {
    if (disabled) { shakeNo(scene, c); return; }
    tapFeedback(scene, c);
    onTap();
  });
  return c;
}

/** Круглая иконка-кнопка: визуал 40, тач-зона 44. */
export function iconButton(
  scene: Phaser.Scene, x: number, y: number, iconId: string, p: Palette, onTap: () => void,
  opts: { tint?: number; fill?: number; size?: number } = {},
): Phaser.GameObjects.Container {
  const size = opts.size ?? 40;
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(opts.fill ?? p.elevatedN, 1);
  g.fillCircle(0, 0, size / 2);
  g.lineStyle(1, p.borderN, 1);
  g.strokeCircle(0, 0, size / 2);
  c.add(g);
  c.add(icon(scene, 0, 0, iconId, opts.tint ?? p.textN));
  const hit = Math.max(size, HIT.min);
  c.setSize(hit, hit);
  c.setInteractive(new Phaser.Geom.Rectangle(-hit / 2, -hit / 2, hit, hit), Phaser.Geom.Rectangle.Contains);
  c.on('pointerdown', () => { tapFeedback(scene, c); onTap(); });
  return c;
}

/** Строка списка: иконка слева, заголовок + подзаголовок, шеврон справа. Высота ART.row.h = 56. */
export function listRow(
  scene: Phaser.Scene, x: number, y: number, w: number, p: Palette,
  o: { icon: string; iconTint?: number; title: string; sub?: string; right?: string; rightColor?: string; locked?: boolean; onTap?: () => void },
): Phaser.GameObjects.Container {
  const h = ART.row.h;
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(p.surfaceN, 1);
  g.fillRoundedRect(0, 0, w, h, RADIUS.md);
  g.lineStyle(1, p.borderN, 1);
  g.strokeRoundedRect(0, 0, w, h, RADIUS.md);
  c.add(g);

  const badge = scene.add.graphics();
  badge.fillStyle(p.elevatedN, 1);
  badge.fillRoundedRect(SP.md, h / 2 - 18, 36, 36, RADIUS.sm);
  c.add(badge);
  c.add(icon(scene, SP.md + 18, h / 2, o.locked ? 'act-lock' : o.icon, o.locked ? p.mutedN : (o.iconTint ?? p.accentN)));

  const textX = SP.md + 36 + SP.md;
  const rightW = o.right ? 72 : 32;
  const textW = w - textX - rightW - SP.sm;
  if (o.sub) {
    c.add(scene.add.text(textX, h / 2 - 9, o.title, TX.body(p, { color: o.locked ? p.muted : p.text, wrap: textW })).setOrigin(0, 0.5));
    c.add(scene.add.text(textX, h / 2 + 9, o.sub, TX.caption(p, { wrap: textW })).setOrigin(0, 0.5));
  } else {
    c.add(scene.add.text(textX, h / 2, o.title, TX.body(p, { color: o.locked ? p.muted : p.text, wrap: textW })).setOrigin(0, 0.5));
  }
  if (o.right) {
    c.add(scene.add.text(w - SP.md - 28, h / 2, o.right, TX.code(p, { color: o.rightColor ?? p.sub })).setOrigin(1, 0.5));
  }
  c.add(icon(scene, w - SP.md - 8, h / 2, 'act-chevron-right', p.mutedN, 20));

  c.setSize(w, h);
  if (o.onTap) {
    c.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    c.on('pointerdown', () => { if (o.locked) { shakeNo(scene, c); return; } tapFeedback(scene, c); o.onTap!(); });
  }
  return c;
}

/** Полоса прогресса. */
export function progressBar(
  scene: Phaser.Scene, x: number, y: number, w: number, h: number, ratio: number, color: number, p: Palette,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y });
  const r = Math.min(h / 2, RADIUS.pill);
  g.fillStyle(p.insetN, 1);
  g.fillRoundedRect(0, 0, w, h, r);
  g.lineStyle(1, p.borderN, 1);
  g.strokeRoundedRect(0, 0, w, h, r);
  const fillW = Math.max(0, Math.min(1, ratio)) * w;
  if (fillW > 1) { g.fillStyle(color, 1); g.fillRoundedRect(0, 0, Math.max(fillW, h), h, r); }
  return g;
}

/** Чип-ярлык, опционально с иконкой. Высота 24. */
export function chip(
  scene: Phaser.Scene, x: number, y: number, label: string, p: Palette,
  opts: { color?: string; fill?: number; border?: number; icon?: string; iconTint?: number } = {},
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const h = ART.chip.h;
  const t = scene.add.text(0, 0, label, TX.caption(p, { color: opts.color ?? p.sub }));
  const iconW = opts.icon ? 16 + SP.xs : 0;
  const w = t.width + iconW + SP.md * 2;
  const g = scene.add.graphics();
  g.fillStyle(opts.fill ?? p.elevatedN, 1);
  g.fillRoundedRect(0, 0, w, h, RADIUS.pill);
  if (opts.border !== undefined) { g.lineStyle(1, opts.border, 1); g.strokeRoundedRect(0, 0, w, h, RADIUS.pill); }
  c.add(g);
  if (opts.icon) c.add(icon(scene, SP.md + 8, h / 2, opts.icon, opts.iconTint ?? p.subN, 16));
  t.setPosition(SP.md + iconW, h / 2).setOrigin(0, 0.5);
  c.add(t);
  c.setSize(w, h);
  return c;
}

export function sectionLabel(scene: Phaser.Scene, x: number, y: number, text: string, p: Palette, color?: string) {
  return scene.add.text(x, y, text.toUpperCase(), TX.caption(p, { color: color ?? p.muted }));
}

export function screenTitle(scene: Phaser.Scene, x: number, y: number, text: string, p: Palette) {
  return scene.add.text(x, y, text, TX.title(p));
}

/** Вариант ответа: плашка на всю ширину, высота >= 56, многострочный текст. */
export function answerRow(
  scene: Phaser.Scene, x: number, y: number, w: number, label: string, index: number, p: Palette, onTap: () => void,
): { c: Phaser.GameObjects.Container; h: number; setState: (s: 'idle' | 'correct' | 'wrong' | 'dim') => void } {
  const letter = String.fromCharCode(65 + index);
  const textW = w - SP.md * 3 - 32;
  const t = scene.add.text(0, 0, label, TX.bodyLg(p, { wrap: textW }));
  const h = Math.max(ART.row.h, t.height + SP.lg * 2);
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const draw = (fill: number, stroke: number, sw: number) => {
    g.clear();
    g.fillStyle(fill, 1);
    g.fillRoundedRect(0, 0, w, h, RADIUS.md);
    g.lineStyle(sw, stroke, 1);
    g.strokeRoundedRect(0, 0, w, h, RADIUS.md);
  };
  draw(p.surfaceN, p.borderN, 1);
  c.add(g);
  const lb = scene.add.graphics();
  lb.fillStyle(p.elevatedN, 1);
  lb.fillRoundedRect(SP.md, h / 2 - 16, 32, 32, RADIUS.sm);
  c.add(lb);
  const lt = scene.add.text(SP.md + 16, h / 2, letter, TX.num(p, { color: p.sub })).setOrigin(0.5);
  c.add(lt);
  t.setPosition(SP.md * 2 + 32, h / 2).setOrigin(0, 0.5);
  c.add(t);
  c.setSize(w, h);
  c.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
  c.on('pointerdown', () => { tapFeedback(scene, c); onTap(); });
  const setState = (s: 'idle' | 'correct' | 'wrong' | 'dim') => {
    if (s === 'correct') { draw(p.surfaceN, p.goodN, 2); lb.clear(); lb.fillStyle(p.goodN, 1); lb.fillRoundedRect(SP.md, h / 2 - 16, 32, 32, RADIUS.sm); lt.setColor(p.accentInk); }
    else if (s === 'wrong') { draw(p.surfaceN, p.badN, 2); lb.clear(); lb.fillStyle(p.badN, 1); lb.fillRoundedRect(SP.md, h / 2 - 16, 32, 32, RADIUS.sm); lt.setColor('#ffffff'); }
    else if (s === 'dim') { c.setAlpha(0.45); }
    c.disableInteractive();
  };
  return { c, h, setState };
}
