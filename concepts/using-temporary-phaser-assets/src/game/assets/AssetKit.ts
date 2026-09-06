// SIGNAL ARENA — AssetKit: слой, который гарантирует, что текстура ЕСТЬ ВСЕГДА.
//
// Проблема, которую он закрывает: сцены делали `scene.textures.exists(key)` и молча
// пропускали иконку, либо Phaser сыпал `loaderror`/«Texture key missing», а плашки
// уезжали, потому что размеры считались руками. Здесь:
//   1) иконки — из кода (iconSet.ts), грузятся как data-URI SVG в 2x (48px) и показываются 24px;
//   2) на любую ошибку загрузки вешается фолбэк: генерируем текстуру процедурно;
//   3) все размеры берутся из ART/tokens — единственный источник правды;
//   4) safeImage()/icon() никогда не бросают: если ключа нет — рисуют заглушку и логируют.

import Phaser from 'phaser';
import { ART } from '../ui/tokens';
import { buildPalette, domainColor, type Palette } from '../ui/palette';
import { ICONS, ICON_BY_ID, iconSvg, svgDataUri } from './iconSet';
import {
  iconKey, enemyAvatarKey, enemyIconKey, enemyRenderKey, cardKey, BG_WALL_KEY, BG_WALL_URL,
} from '../engine/assetKeys';
import { enemies, type Enemy } from '../data/enemies';
import { cards, type SkillCard } from '../data/cards';

/** Журнал ассетов: что подменили заглушкой. Показывается в Галерее. */
export const assetLog: { key: string; reason: string }[] = [];

function log(key: string, reason: string) {
  assetLog.push({ key, reason });
  console.warn(`[AssetKit] ${key}: ${reason}`);
}

/* ------------------------------------------------------------------ */
/* Загрузка                                                            */
/* ------------------------------------------------------------------ */

/** Ставим иконки в очередь загрузчика. Вызывать в preload(). */
export function queueIcons(scene: Phaser.Scene): void {
  for (const def of ICONS) {
    const key = iconKey(def.id);
    if (scene.textures.exists(key)) continue;
    scene.load.svg(key, svgDataUri(iconSvg(def)), { width: ART.icon.raster, height: ART.icon.raster });
  }
}

/** Реальные арт-файлы (если есть). Ошибка загрузки — не проблема: фолбэк подставится сам. */
export function queueArt(scene: Phaser.Scene): void {
  if (!scene.textures.exists(BG_WALL_KEY)) scene.load.image(BG_WALL_KEY, BG_WALL_URL);
  for (const e of enemies) {
    if (!e.hasArt) continue;
    const key = enemyRenderKey(e.id, 1);
    if (!scene.textures.exists(key)) scene.load.image(key, `assets/render/enemies/${e.id}_s1.png`);
  }
}

/**
 * Вешает обработчик ошибок загрузки: вместо красного лога — заглушка нужного размера.
 * Вызывать в preload() ДО add-ов в очередь.
 */
export function installLoadGuards(scene: Phaser.Scene): void {
  scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
    log(file.key, `не загрузился (${file.url}) — подставлена заглушка`);
  });
}

/* ------------------------------------------------------------------ */
/* Процедурные заглушки (правильных размеров из ART)                    */
/* ------------------------------------------------------------------ */

/** Убедиться, что для каждого ключа есть текстура. Вызывать в create() после загрузки. */
export function ensureAllTextures(scene: Phaser.Scene, stage: string): void {
  const p = buildPalette(stage);
  // иконки
  for (const def of ICONS) ensureIcon(scene, def.id);
  // враги: аватар, иконка, рендер S1
  for (const e of enemies) {
    ensureEnemyAvatar(scene, e, p);
    ensureEnemyIcon(scene, e, p);
    ensureEnemyRender(scene, e, 1, p);
  }
  // карты навыков
  for (const c of cards) ensureCard(scene, c, p);
  ensureCardWait(scene, p);
  // фон
  if (!scene.textures.exists(BG_WALL_KEY)) makeWallFallback(scene, p);
}

/** Иконка-фолбэк: кружок с первой буквой — видно, что иконки нет, но ничего не ломается. */
export function ensureIcon(scene: Phaser.Scene, id: string): string {
  const key = iconKey(id);
  if (scene.textures.exists(key)) return key;
  const s = ART.icon.raster;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.lineStyle(4, 0xffffff, 1);
  g.strokeCircle(s / 2, s / 2, s / 2 - 4);
  g.fillStyle(0xffffff, 1);
  g.fillRect(s / 2 - 2, s / 4 + 4, 4, s / 3);
  g.fillCircle(s / 2, (s * 3) / 4 - 2, 3);
  g.generateTexture(key, s, s);
  g.destroy();
  log(key, 'иконки нет в наборе — нарисован «!»');
  return key;
}

function vignette(g: Phaser.GameObjects.Graphics, s: number, p: Palette) {
  g.fillStyle(p.insetN, 1);
  g.fillRect(0, 0, s, s);
  g.fillStyle(p.surfaceN, 1);
  g.fillCircle(s / 2, s / 2, s * 0.62);
  g.fillStyle(p.elevatedN, 0.7);
  g.fillCircle(s / 2, s / 2, s * 0.42);
  // «finance»-подложка: сетка + свечи, без читаемых цифр
  g.lineStyle(1, p.borderN, 0.5);
  for (let i = 1; i < 6; i++) {
    g.lineBetween(0, (s / 6) * i, s, (s / 6) * i);
    g.lineBetween((s / 6) * i, 0, (s / 6) * i, s);
  }
}

/** Единый силуэт «одна поза на всех стадиях»: голова + плечи + сигнатурный предмет-ромб. */
function silhouette(g: Phaser.GameObjects.Graphics, s: number, col: number, dark: number, stage: number) {
  const cx = s / 2;
  // плечи
  g.fillStyle(col, 1);
  g.fillRoundedRect(cx - s * 0.26, s * 0.56, s * 0.52, s * 0.3, s * 0.08);
  // голова
  g.fillCircle(cx, s * 0.4, s * 0.16);
  // глаза
  g.fillStyle(dark, 1);
  g.fillCircle(cx - s * 0.06, s * 0.39, s * 0.025);
  g.fillCircle(cx + s * 0.06, s * 0.39, s * 0.025);
  // предметы по стадиям (S2+: +1 предмет, S3+: рим-свет, S4: трещины)
  if (stage >= 2) {
    g.fillStyle(col, 0.8);
    g.fillTriangle(cx + s * 0.3, s * 0.5, cx + s * 0.38, s * 0.62, cx + s * 0.22, s * 0.62);
  }
  if (stage >= 3) {
    g.lineStyle(s * 0.02, 0xffffff, 0.5);
    g.strokeCircle(cx, s * 0.4, s * 0.19);
  }
  if (stage >= 4) {
    g.lineStyle(2, dark, 0.8);
    g.lineBetween(s * 0.1, s * 0.9, s * 0.3, s * 0.7);
    g.lineBetween(s * 0.9, s * 0.85, s * 0.7, s * 0.7);
  }
}

export function ensureEnemyRender(scene: Phaser.Scene, e: Enemy, stage: number, p: Palette): string {
  const key = enemyRenderKey(e.id, stage);
  if (scene.textures.exists(key)) return key;
  const s = ART.enemyRender.size;
  const col = domainColor(p, e.domain).n;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  vignette(g, s, p);
  silhouette(g, s, col, p.insetN, stage);
  g.generateTexture(key, s, s);
  g.destroy();
  return key;
}

export function ensureEnemyAvatar(scene: Phaser.Scene, e: Enemy, p: Palette): string {
  const key = enemyAvatarKey(e.id);
  if (scene.textures.exists(key)) return key;
  const s = ART.enemyAvatar.size;
  const col = domainColor(p, e.domain).n;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(p.elevatedN, 1);
  g.fillCircle(s / 2, s / 2, s / 2);
  g.fillStyle(col, 1);
  g.fillCircle(s / 2, s * 0.42, s * 0.2);
  g.fillRoundedRect(s * 0.2, s * 0.66, s * 0.6, s * 0.34, s * 0.1);
  g.lineStyle(s * 0.04, col, 1);
  g.strokeCircle(s / 2, s / 2, s / 2 - s * 0.02);
  g.generateTexture(key, s, s);
  g.destroy();
  return key;
}

export function ensureEnemyIcon(scene: Phaser.Scene, e: Enemy, p: Palette): string {
  const key = enemyIconKey(e.id);
  if (scene.textures.exists(key)) return key;
  const s = ART.enemyIcon.size;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(s / 2, s * 0.4, s * 0.18);
  g.fillRoundedRect(s * 0.22, s * 0.62, s * 0.56, s * 0.3, s * 0.08);
  g.generateTexture(key, s, s);
  g.destroy();
  void p;
  return key;
}

export function ensureCard(scene: Phaser.Scene, c: SkillCard, p: Palette): string {
  const key = cardKey(c.id);
  if (scene.textures.exists(key)) return key;
  const { w, h } = ART.card;
  const col = domainColor(p, c.domain).n;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(p.surfaceN, 1);
  g.fillRoundedRect(0, 0, w, h, 16);
  g.lineStyle(c.rank >= 3 ? 6 : c.rank === 2 ? 4 : 2, col, 1);
  g.strokeRoundedRect(3, 3, w - 6, h - 6, 14);
  // метафора: ромб + линии тренда
  g.fillStyle(col, 0.18);
  g.fillCircle(w / 2, h * 0.42, w * 0.28);
  g.fillStyle(col, 1);
  g.fillTriangle(w / 2, h * 0.24, w * 0.7, h * 0.42, w / 2, h * 0.6);
  g.fillStyle(col, 0.7);
  g.fillTriangle(w / 2, h * 0.24, w * 0.3, h * 0.42, w / 2, h * 0.6);
  // низ — под название
  g.fillStyle(p.insetN, 0.9);
  g.fillRoundedRect(10, h - 70, w - 20, 58, 8);
  g.generateTexture(key, w, h);
  g.destroy();
  return key;
}

export function ensureCardWait(scene: Phaser.Scene, p: Palette): string {
  const key = cardKey('Cwait');
  if (scene.textures.exists(key)) return key;
  const { w, h } = ART.card;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(p.surfaceN, 1);
  g.fillRoundedRect(0, 0, w, h, 16);
  g.lineStyle(2, p.strongN, 1);
  g.strokeRoundedRect(3, 3, w - 6, h - 6, 14);
  g.fillStyle(p.subN, 1);
  g.fillRoundedRect(w * 0.34, h * 0.3, w * 0.1, h * 0.26, 4);
  g.fillRoundedRect(w * 0.56, h * 0.3, w * 0.1, h * 0.26, 4);
  g.fillStyle(p.insetN, 0.9);
  g.fillRoundedRect(10, h - 70, w - 20, 58, 8);
  g.generateTexture(key, w, h);
  g.destroy();
  return key;
}

function makeWallFallback(scene: Phaser.Scene, p: Palette) {
  const w = 195, h = 211;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(p.surfaceN, 1);
  g.fillRect(0, 0, w, h);
  g.fillStyle(p.elevatedN, 1);
  for (let r = 0; r < 8; r++) {
    const off = r % 2 ? 24 : 0;
    for (let c = -1; c < 5; c++) g.fillRect(c * 48 + off + 2, r * 26 + 2, 44, 22);
  }
  g.generateTexture(BG_WALL_KEY, w, h);
  g.destroy();
  log(BG_WALL_KEY, 'фон стены не найден — нарисован процедурный кирпич');
}

/* ------------------------------------------------------------------ */
/* Фабрики отображения — никогда не бросают                            */
/* ------------------------------------------------------------------ */

/** Иконка 24×24 (или другой размер) нужного цвета. Тач-зона — ответственность виджета. */
export function icon(
  scene: Phaser.Scene,
  x: number,
  y: number,
  id: string,
  tint: number,
  size: number = ART.icon.size,
): Phaser.GameObjects.Image {
  if (!ICON_BY_ID[id]) log(iconKey(id), `id «${id}» нет в реестре iconSet.ts`);
  const key = ensureIcon(scene, id);
  return scene.add.image(x, y, key).setDisplaySize(size, size).setTint(tint);
}

/** Картинка по ключу с гарантированным фолбэком и точным display-размером. */
export function safeImage(
  scene: Phaser.Scene,
  x: number,
  y: number,
  key: string,
  w: number,
  h: number,
): Phaser.GameObjects.Image {
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x444444, 1);
    g.fillRect(0, 0, 64, 64);
    g.lineStyle(3, 0xff4d5e, 1);
    g.lineBetween(0, 0, 64, 64);
    g.lineBetween(64, 0, 0, 64);
    g.generateTexture(key, 64, 64);
    g.destroy();
    log(key, 'текстуры нет — показан «крест»');
  }
  return scene.add.image(x, y, key).setDisplaySize(w, h);
}

export function enemyRender(scene: Phaser.Scene, x: number, y: number, e: Enemy, stage: number, size: number, p: Palette) {
  const key = ensureEnemyRender(scene, e, stage, p);
  return scene.add.image(x, y, key).setDisplaySize(size, size);
}

export function enemyAvatar(scene: Phaser.Scene, x: number, y: number, e: Enemy, size: number, p: Palette) {
  const key = ensureEnemyAvatar(scene, e, p);
  return scene.add.image(x, y, key).setDisplaySize(size, size);
}

export function skillCard(scene: Phaser.Scene, x: number, y: number, c: SkillCard | 'wait', w: number, p: Palette) {
  const key = c === 'wait' ? ensureCardWait(scene, p) : ensureCard(scene, c, p);
  const h = Math.round((w * ART.card.h) / ART.card.w);
  return scene.add.image(x, y, key).setDisplaySize(w, h);
}
