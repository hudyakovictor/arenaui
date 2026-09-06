import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { cards } from '../data/cards';
import { enemies, domainIcon, domainLabel } from '../data/enemies';
import { domainColor } from '../ui/palette';
import { ART, CANVAS, CHROME, CONTENT_W, GUTTER, SP } from '../ui/tokens';
import * as TX from '../ui/text';
import { Flow } from '../ui/layout';
import { renderTopBar, renderBottomNav, renderBackground, navForEpoch, currentPalette, header, transitionTo } from '../ui/shell';
import { listRow, panel, sectionLabel, progressBar } from '../ui/widgets';
import { skillCard } from '../assets/AssetKit';

export class AcademyScene extends Phaser.Scene {
  constructor() { super({ key: 'AcademyScene' }); }

  create(): void {
    const p = currentPalette();
    renderBackground(this, p);
    this.cameras.main.fadeIn(180, 0, 0, 0);
    const owned = gameState.progress.cardsOwned;
    const flow = new Flow(header(this, 'Академия', p));

    // Прогресс глав
    const ph = 64;
    const py = flow.take(ph);
    panel(this, GUTTER, py, CONTENT_W, ph, p);
    this.add.text(GUTTER + SP.lg, py + SP.md, 'Карты навыков', TX.body(p));
    this.add.text(CANVAS.w - GUTTER - SP.lg, py + SP.md, `${owned.length} / ${cards.length}`, TX.num(p, { color: p.accent })).setOrigin(1, 0);
    progressBar(this, GUTTER + SP.lg, py + ph - SP.lg - 8, CONTENT_W - SP.lg * 2, 8, owned.length / cards.length, p.accentN, p);

    // Полка карт (горизонтальная)
    sectionLabel(this, GUTTER, flow.take(16, SP.sm), 'Полученные карты', p);
    const cw = 72;
    const ch = Math.round((cw * ART.card.h) / ART.card.w);
    const shelfY = flow.take(ch + 24);
    cards.forEach((c, i) => {
      const x = GUTTER + cw / 2 + i * (cw + SP.sm);
      if (x + cw / 2 > CANVAS.w - GUTTER) return;
      const img = skillCard(this, x, shelfY + ch / 2, owned.includes(c.id) ? c : 'wait', cw, p);
      if (!owned.includes(c.id)) img.setAlpha(0.5);
      this.add.text(x, shelfY + ch + SP.xs, c.id, TX.code(p, { align: 'center' })).setOrigin(0.5, 0);
    });

    // Главы
    sectionLabel(this, GUTTER, flow.take(16, SP.sm), 'Главы', p);
    const bottom = CANVAS.h - CHROME.bottomNav - SP.lg;
    cards.forEach((c, i) => {
      if (flow.y + ART.row.h > bottom) return;
      const dc = domainColor(p, c.domain);
      const enemy = enemies.find((e) => e.id === c.counters);
      const has = owned.includes(c.id);
      listRow(this, GUTTER, flow.take(ART.row.h, SP.sm), CONTENT_W, p, {
        icon: domainIcon[c.domain], iconTint: dc.n,
        title: `${i + 1}. ${c.name}`,
        sub: `${domainLabel[c.domain]} · ${c.short}`,
        right: has ? 'ГОТОВО' : `R${c.rank}`,
        rightColor: has ? p.good : p.muted,
        onTap: () => transitionTo(this, 'ArenaScene', { enemyIndex: enemy ? enemies.indexOf(enemy) : 0 }),
      });
    });

    renderTopBar(this, gameState);
    renderBottomNav(this, 'AcademyScene', navForEpoch());
  }
}
