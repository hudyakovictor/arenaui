// SIGNAL ARENA — каркас: верхняя панель, нижняя навигация, фон. Иконки — через AssetKit (не пропадают).
import Phaser from 'phaser';
import { gameState, type GameState } from '../state/GameState';
import { buildPalette, type Palette } from './palette';
import { CANVAS, CHROME, GUTTER, HIT, RADIUS, SP, DUR } from './tokens';
import * as TX from './text';
import { progressBar } from './widgets';
import { icon } from '../assets/AssetKit';
import { safeAreaInsets } from './layout';
import { BG_WALL_KEY } from '../engine/assetKeys';

export const NAV_ITEMS = [
  { key: 'AcademyScene', label: 'Академия', icon: 'nav-academy' },
  { key: 'ArenaScene', label: 'Арена', icon: 'nav-arena' },
  { key: 'CollectionScene', label: 'Коллекция', icon: 'nav-collection' },
  { key: 'MoreScene', label: 'Ещё', icon: 'nav-more' },
];

export function currentPalette(): Palette {
  return buildPalette(gameState.progress.epoch);
}

export function transitionTo(scene: Phaser.Scene, key: string, data?: object): void {
  scene.cameras.main.fadeOut(DUR.scene, 0, 0, 0);
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => scene.scene.start(key, data));
}

export function renderTopBar(scene: Phaser.Scene, gs: GameState): Phaser.GameObjects.Container {
  const p = gs.progress;
  const pal = buildPalette(p.epoch);
  const c = scene.add.container(0, 0).setDepth(10);
  const h = CHROME.topBar;

  const bg = scene.add.graphics();
  bg.fillStyle(pal.surfaceN, 0.96);
  bg.fillRect(0, 0, CANVAS.w, h);
  bg.lineStyle(1, pal.borderN, 1);
  bg.lineBetween(0, h, CANVAS.w, h);
  c.add(bg);

  // Уровень 44×40
  const lvl = scene.add.graphics();
  lvl.fillStyle(pal.accentN, 1);
  lvl.fillRoundedRect(GUTTER, SP.md, 44, 40, RADIUS.sm);
  c.add(lvl);
  c.add(scene.add.text(GUTTER + 22, SP.md + 13, String(p.level), TX.numLg(pal, { color: pal.accentInk })).setOrigin(0.5));
  c.add(scene.add.text(GUTTER + 22, SP.md + 31, 'ур.', TX.caption(pal, { color: pal.accentInk })).setOrigin(0.5));

  // Опыт
  const xpX = GUTTER + 44 + SP.md;
  const xpW = 120;
  c.add(scene.add.text(xpX, SP.md, 'ОПЫТ', TX.caption(pal)));
  c.add(progressBar(scene, xpX, SP.md + 18, xpW, 8, p.xp / p.xpMax, pal.accentN, pal));
  c.add(scene.add.text(xpX, SP.md + 30, `${p.xp} / ${p.xpMax}`, TX.code(pal)));

  // Запас риска
  const bx = xpX + xpW + SP.lg;
  const bw = CANVAS.w - bx - GUTTER - 56;
  const ratio = p.riskBudget / p.maxBudget;
  const bCol = p.riskBudget <= 20 ? pal.badN : p.riskBudget <= 45 ? pal.warnN : pal.goodN;
  const bColS = p.riskBudget <= 20 ? pal.bad : p.riskBudget <= 45 ? pal.warn : pal.good;
  c.add(scene.add.text(bx, SP.md, 'ЗАПАС', TX.caption(pal)));
  c.add(progressBar(scene, bx, SP.md + 18, bw, 8, ratio, bCol, pal));
  c.add(scene.add.text(bx, SP.md + 30, String(p.riskBudget), TX.code(pal, { color: bColS })));

  // Монеты — иконка + число
  const cx = CANVAS.w - GUTTER;
  c.add(scene.add.text(cx, h / 2, String(p.coins), TX.num(pal, { color: pal.text })).setOrigin(1, 0.5));
  c.add(icon(scene, cx - 8 - String(p.coins).length * 9 - 12, h / 2, 'act-coin', pal.warnN, 20));
  return c;
}

export function renderBottomNav(scene: Phaser.Scene, current: string, unlocked: string[]): Phaser.GameObjects.Container {
  const pal = currentPalette();
  const insets = safeAreaInsets();
  const navH = CHROME.bottomNav + insets.bottom;
  const y = CANVAS.h - navH;
  const c = scene.add.container(0, y).setDepth(10);

  const bg = scene.add.graphics();
  bg.fillStyle(pal.bgN, 0.98);
  bg.fillRect(0, 0, CANVAS.w, navH);
  bg.lineStyle(1, pal.borderN, 1);
  bg.lineBetween(0, 0, CANVAS.w, 0);
  c.add(bg);

  const cell = CANVAS.w / NAV_ITEMS.length;
  NAV_ITEMS.forEach((item, i) => {
    const isActive = item.key === current;
    const isUnlocked = unlocked.includes(item.key);
    const cx = i * cell + cell / 2;
    const zone = scene.add.rectangle(i * cell, 0, cell, Math.max(CHROME.bottomNav, HIT.min), 0x000000, 0).setOrigin(0).setInteractive();
    zone.on('pointerdown', () => {
      if (!isUnlocked || isActive) return;
      transitionTo(scene, item.key);
    });
    c.add(zone);
    const tint = isActive ? pal.accentN : isUnlocked ? pal.subN : pal.mutedN;
    const img = icon(scene, cx, 22, isUnlocked ? item.icon : 'act-lock', tint);
    img.setAlpha(isUnlocked ? 1 : 0.5);
    c.add(img);
    const colorS = isActive ? pal.accent : isUnlocked ? pal.sub : pal.muted;
    c.add(scene.add.text(cx, 40, item.label, TX.caption(pal, { color: colorS })).setOrigin(0.5, 0));
    if (isActive) {
      const ind = scene.add.graphics();
      ind.fillStyle(pal.accentN, 1);
      ind.fillRoundedRect(cx - 16, 0, 32, 3, 2);
      c.add(ind);
    }
  });
  return c;
}

export function bottomNavHeight(): number {
  return CHROME.bottomNav + safeAreaInsets().bottom;
}

/** Все разделы открыты — это kit для проверки интерфейса. */
export function navForEpoch(): string[] {
  return NAV_ITEMS.map((n) => n.key);
}

export function renderBackground(scene: Phaser.Scene, pal: Palette): void {
  scene.cameras.main.setBackgroundColor(pal.bgN);
  if (pal.brick && scene.textures.exists(BG_WALL_KEY)) {
    scene.add.tileSprite(0, 0, CANVAS.w, CANVAS.h, BG_WALL_KEY).setOrigin(0).setAlpha(0.55);
    scene.add.rectangle(0, 0, CANVAS.w, CANVAS.h, 0x000000, 0.6).setOrigin(0);
  } else {
    // сетка/панель для II–IV
    const g = scene.add.graphics();
    g.lineStyle(1, pal.borderN, 0.25);
    for (let x = 0; x <= CANVAS.w; x += 26) g.lineBetween(x, 0, x, CANVAS.h);
    for (let y = 0; y <= CANVAS.h; y += 26) g.lineBetween(0, y, CANVAS.w, y);
  }
}

/** Заголовок экрана с кнопкой назад. Возвращает нижнюю Y. */
export function header(scene: Phaser.Scene, title: string, p: Palette, onBack?: () => void): number {
  const y = CHROME.topBar + SP.lg;
  let x = GUTTER;
  if (onBack) {
    const back = scene.add.container(GUTTER + 20, y + 14);
    back.add(icon(scene, 0, 0, 'act-back', p.textN));
    back.setSize(HIT.min, HIT.min).setInteractive(new Phaser.Geom.Rectangle(-22, -22, 44, 44), Phaser.Geom.Rectangle.Contains);
    back.on('pointerdown', onBack);
    x += 44;
  }
  scene.add.text(x, y, title, TX.title(p));
  return y + 28 + SP.lg;
}
