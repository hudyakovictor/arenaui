import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { enemies, domainIcon } from '../data/enemies';
import { domainColor } from '../ui/palette';
import { ART, CANVAS, CONTENT_W, GUTTER, RADIUS, SP } from '../ui/tokens';
import * as TX from '../ui/text';
import { Flow } from '../ui/layout';
import { renderTopBar, renderBottomNav, renderBackground, navForEpoch, currentPalette, header, transitionTo } from '../ui/shell';
import { panel, chip, sectionLabel, tapFeedback } from '../ui/widgets';
import { enemyAvatar, icon } from '../assets/AssetKit';

export class CollectionScene extends Phaser.Scene {
  constructor() { super({ key: 'CollectionScene' }); }

  create(): void {
    const p = currentPalette();
    renderBackground(this, p);
    this.cameras.main.fadeIn(180, 0, 0, 0);
    const prog = gameState.progress;
    const flow = new Flow(header(this, 'Коллекция', p));

    const c1 = chip(this, GUTTER, flow.y, `Опознано ${prog.defeated.length}`, p, { icon: 'enemy-defeated', iconTint: p.goodN, color: p.good, border: p.goodN });
    const met = Object.keys(prog.enemyStagesReached).length;
    chip(this, GUTTER + c1.width + SP.sm, flow.y, `Встречено ${met}`, p, { icon: 'enemy-revealed', iconTint: p.infoN });
    flow.take(ART.chip.h);

    sectionLabel(this, GUTTER, flow.take(16, SP.sm), 'Трофеи · сетка 2 колонки', p);

    // Сетка карточек: 2 колонки, размер из контента
    const cols = 2;
    const gap = SP.md;
    const cw = (CONTENT_W - gap) / cols;
    const av = 88;
    const ch = av + SP.lg + 20 + 18 + SP.md + ART.chip.h + SP.lg;
    enemies.forEach((e, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = GUTTER + col * (cw + gap);
      const y = flow.y + row * (ch + gap);
      const seen = !!prog.enemyStagesReached[e.id];
      const done = prog.defeated.includes(e.id);
      const dc = domainColor(p, e.domain);
      const cont = this.add.container(0, 0);
      cont.add(panel(this, x, y, cw, ch, p, { stroke: done ? dc.n : p.borderN, radius: RADIUS.lg }));
      const img = enemyAvatar(this, x + cw / 2, y + SP.lg + av / 2, e, av, p);
      if (!seen) img.setTint(0x000000).setAlpha(0.6);
      cont.add(img);
      if (!seen) cont.add(icon(this, x + cw / 2, y + SP.lg + av / 2, 'enemy-unknown', p.mutedN, ART.iconLg.size));
      cont.add(this.add.text(x + cw / 2, y + SP.lg + av + SP.sm, seen ? e.name : '???', TX.body(p, { color: seen ? p.text : p.muted, align: 'center' })).setOrigin(0.5, 0));
      cont.add(this.add.text(x + cw / 2, y + SP.lg + av + SP.sm + 20, ['I', 'II', 'III', 'IV'][e.rank - 1] + ' ранг', TX.caption(p, { align: 'center' })).setOrigin(0.5, 0));
      const status = chip(this, 0, y + ch - SP.lg - ART.chip.h, done ? 'Побеждён' : seen ? 'Опознан' : 'Скрыт', p, {
        icon: done ? 'enemy-defeated' : seen ? domainIcon[e.domain] : 'act-lock',
        iconTint: done ? p.goodN : seen ? dc.n : p.mutedN,
        color: done ? p.good : seen ? dc.s : p.muted,
      });
      status.setX(x + cw / 2 - status.width / 2);
      cont.add(status);

      const zone = this.add.rectangle(x, y, cw, ch, 0, 0).setOrigin(0).setInteractive();
      zone.on('pointerdown', () => { tapFeedback(this, cont); transitionTo(this, 'ArenaScene', { enemyIndex: i }); });
    });
    void CANVAS;

    renderTopBar(this, gameState);
    renderBottomNav(this, 'CollectionScene', navForEpoch());
  }
}
