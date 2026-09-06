import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { buildPalette } from '../ui/palette';
import { CANVAS, GUTTER } from '../ui/tokens';
import * as TX from '../ui/text';
import { progressBar } from '../ui/widgets';
import { installLoadGuards, queueIcons, queueArt, ensureAllTextures } from '../assets/AssetKit';

export class BootScene extends Phaser.Scene {
  private barFill?: Phaser.GameObjects.Graphics;

  constructor() { super({ key: 'BootScene' }); }

  preload(): void {
    const p = buildPalette(gameState.progress.stage);
    this.cameras.main.setBackgroundColor(p.bgN);
    const w = CANVAS.w - GUTTER * 2;
    const barY = CANVAS.h / 2 + 60;
    this.add.text(CANVAS.w / 2, CANVAS.h / 2 - 40, 'SIGNAL ARENA', TX.display(p, { color: p.accent, align: 'center' })).setOrigin(0.5);
    this.add.text(CANVAS.w / 2, CANVAS.h / 2, 'Asset Kit · проверка интерфейса', TX.body(p, { color: p.sub, align: 'center' })).setOrigin(0.5);
    progressBar(this, GUTTER, barY, w, 6, 0, p.accentN, p);
    this.barFill = this.add.graphics();
    this.load.on('progress', (v: number) => {
      this.barFill?.clear();
      this.barFill?.fillStyle(p.accentN, 1);
      this.barFill?.fillRoundedRect(GUTTER, barY, Math.max(6, w * v), 6, 3);
    });

    // 1) защита от ошибок загрузки  2) иконки из кода  3) реальный арт, если есть
    installLoadGuards(this);
    queueIcons(this);
    queueArt(this);
  }

  create(): void {
    // Всё, что не загрузилось, — заменяется процедурной заглушкой нужного размера.
    ensureAllTextures(this, gameState.progress.stage);
    this.time.delayedCall(400, () => this.scene.start('ArenaScene'));
  }
}
