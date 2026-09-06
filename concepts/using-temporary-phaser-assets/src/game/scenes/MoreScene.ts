import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { EPOCH_ORDER, palettes } from '../ui/palette';
import { ART, CANVAS, CONTENT_W, GUTTER, RADIUS, SP } from '../ui/tokens';
import * as TX from '../ui/text';
import { Flow } from '../ui/layout';
import { renderTopBar, renderBottomNav, renderBackground, navForEpoch, currentPalette, header, transitionTo } from '../ui/shell';
import { listRow, panel, sectionLabel, button } from '../ui/widgets';
import { assetLog } from '../assets/AssetKit';

export class MoreScene extends Phaser.Scene {
  constructor() { super({ key: 'MoreScene' }); }

  create(): void {
    const p = currentPalette();
    renderBackground(this, p);
    this.cameras.main.fadeIn(180, 0, 0, 0);
    const flow = new Flow(header(this, 'Ещё', p));

    // Переключатель эпох — проверка цветов одного скелета UI
    sectionLabel(this, GUTTER, flow.take(16, SP.sm), 'Эпоха оформления (токены)', p);
    const segH = 48;
    const sy = flow.take(segH);
    panel(this, GUTTER, sy, CONTENT_W, segH, p, { fill: p.insetN });
    const segW = (CONTENT_W - SP.xs * 2) / EPOCH_ORDER.length;
    EPOCH_ORDER.forEach((id, i) => {
      const x = GUTTER + SP.xs + i * segW;
      const active = id === p.id;
      const g = this.add.graphics();
      if (active) { g.fillStyle(p.accentN, 1); g.fillRoundedRect(x, sy + SP.xs, segW, segH - SP.xs * 2, RADIUS.sm); }
      const sw = this.add.graphics();
      sw.fillStyle(palettes[id].accentN, 1);
      sw.fillCircle(x + segW / 2, sy + 16, 5);
      this.add.text(x + segW / 2, sy + 34, palettes[id].name, TX.caption(p, { color: active ? p.accentInk : p.sub })).setOrigin(0.5);
      const z = this.add.rectangle(x, sy, segW, segH, 0, 0).setOrigin(0).setInteractive();
      z.on('pointerdown', () => { gameState.setEpoch(id); this.scene.restart(); });
    });

    sectionLabel(this, GUTTER, flow.take(16, SP.sm), 'Разделы', p);
    const rows = [
      { icon: 'act-search', title: 'Галерея ассетов', sub: 'Все иконки, плашки, размеры и цвета', to: 'AssetGalleryScene' },
      { icon: 'act-alert', title: 'Журнал ошибок', sub: 'Разбор проигранных боёв', locked: true },
      { icon: 'act-coin', title: 'Магазин', sub: 'SIG → усилители', locked: true },
      { icon: 'act-settings', title: 'Настройки', sub: 'Звук, вибрация, язык', locked: true },
    ];
    rows.forEach((r) => {
      listRow(this, GUTTER, flow.take(ART.row.h, SP.sm), CONTENT_W, p, {
        icon: r.icon, title: r.title, sub: r.sub, locked: r.locked,
        right: r.locked ? 'СКОРО' : undefined,
        onTap: () => { if (r.to) transitionTo(this, r.to); },
      });
    });

    sectionLabel(this, GUTTER, flow.take(16, SP.sm), 'Состояние ассетов', p);
    const ok = assetLog.length === 0;
    const ih = 56;
    const iy = flow.take(ih);
    panel(this, GUTTER, iy, CONTENT_W, ih, p, { stroke: ok ? p.goodN : p.warnN });
    this.add.text(GUTTER + SP.lg, iy + ih / 2, ok ? 'Все текстуры загружены, подмен нет' : `Подменено заглушками: ${assetLog.length}`, TX.body(p, { color: ok ? p.good : p.warn })).setOrigin(0, 0.5);

    flow.gap(SP.sm);
    button(this, GUTTER, flow.take(ART.button.hSm), 'Сбросить прогресс', p, () => { gameState.reset(); transitionTo(this, 'BootScene'); }, { width: CONTENT_W, variant: 'ghost', height: ART.button.hSm, icon: 'act-refresh' });
    void CANVAS;

    renderTopBar(this, gameState);
    renderBottomNav(this, 'MoreScene', navForEpoch());
  }
}
