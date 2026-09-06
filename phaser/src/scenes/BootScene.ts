// Загрузка ассетов и заставка.
// Минимальная загрузка: фон — сплошной тёмно-серый квадрат из палитры.
// Всё игровое содержимое — в идеях (docs/specs/CONCEPT_IDEAS.md).
// Ассеты: пока нет — только procedural fallback (тёмно-серый квадрат bgN).

import Phaser from 'phaser';
import { PALETTE } from '../ui/palette';
import { CANVAS, GUTTER, SP } from '../ui/tokens';
import * as TX from '../ui/text';
import { progressBar } from '../ui/widgets';
import { initFx } from '../ui/feedbackFx';
import { initMotion } from '../ui/motion';

export class BootScene extends Phaser.Scene {
  private barFill?: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const p = PALETTE;
    const w = CANVAS.w - GUTTER * 2;
    const barY = CANVAS.h / 2 + 60;
    progressBar(this, GUTTER, barY, w, 6, 0, p.accentN, p);
    this.barFill = this.add.graphics();
    this.load.on('progress', (v: number) => {
      this.barFill?.clear();
      this.barFill?.fillStyle(p.accentN, 1);
      this.barFill?.fillRoundedRect(GUTTER, barY, Math.max(6, w * v), 6, 3);
    });
  }

  create(): void {
    initFx();
    initMotion();
    const p = PALETTE;
    this.cameras.main.setBackgroundColor(p.bgN);
    this.add
      .text(CANVAS.w / 2, CANVAS.h / 2 - 40, 'Signal Arena', {
        ...TX.display(p, { color: p.accent, align: 'center' }),
      })
      .setOrigin(0.5);
    this.add
      .text(CANVAS.w / 2, CANVAS.h / 2 + SP.md, 'тренажёр решений для крипто‑трейдинга', {
        ...TX.caption(p, { color: p.muted, align: 'center', wrap: CANVAS.w - GUTTER * 2 }),
      })
      .setOrigin(0.5);
  }
}
