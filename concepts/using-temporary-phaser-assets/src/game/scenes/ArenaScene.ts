import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { enemies, domainIcon, domainLabel } from '../data/enemies';
import { cards } from '../data/cards';
import { domainColor } from '../ui/palette';
import { ART, CANVAS, CHROME, CONTENT_W, GUTTER, RADIUS, SP } from '../ui/tokens';
import * as TX from '../ui/text';
import { Flow } from '../ui/layout';
import { renderTopBar, renderBottomNav, renderBackground, navForStage, bottomNavHeight, currentPalette } from '../ui/shell';
import { panel, chip, button, answerRow, sectionLabel } from '../ui/widgets';
import { enemyRender, icon } from '../assets/AssetKit';
import { drawCandleChart, genCandles } from '../ui/CandleChart';

type Phase = 'encounter' | 'task' | 'feedback';

export class ArenaScene extends Phaser.Scene {
  private enemyIndex = 0;
  private phase: Phase = 'encounter';
  private body!: Phaser.GameObjects.Container;
  private lastCorrect = false;
  private lastDelta = { xp: 0, coins: 0, risk: 0 };

  constructor() { super({ key: 'ArenaScene' }); }

  init(data: { enemyIndex?: number }) {
    if (data?.enemyIndex !== undefined) this.enemyIndex = data.enemyIndex;
    this.phase = 'encounter';
  }

  create(): void {
    const p = currentPalette();
    renderBackground(this, p);
    this.cameras.main.fadeIn(180, 0, 0, 0);
    this.body = this.add.container(0, 0);
    this.renderPhase();
    renderTopBar(this, gameState);
    renderBottomNav(this, 'ArenaScene', navForStage());
  }

  private rebuild(): void {
    this.body.destroy(true);
    this.body = this.add.container(0, 0);
    this.renderPhase();
    // верхняя панель пересобирается, чтобы цифры обновились
    this.children.list.filter((o) => (o as Phaser.GameObjects.Container).depth === 10).forEach((o) => o.destroy());
    renderTopBar(this, gameState);
    renderBottomNav(this, 'ArenaScene', navForStage());
  }

  private renderPhase(): void {
    if (this.phase === 'encounter') this.renderEncounter();
    else if (this.phase === 'task') this.renderTask();
    else this.renderFeedback();
  }

  /* ---------- Встреча: враг крупно ---------- */
  private renderEncounter(): void {
    const p = currentPalette();
    const e = enemies[this.enemyIndex % enemies.length];
    gameState.meet(e.id);
    const dc = domainColor(p, e.domain);
    const flow = new Flow(CHROME.topBar + SP.lg);
    const bottom = CANVAS.h - bottomNavHeight() - SP.lg;

    this.body.add(sectionLabel(this, GUTTER, flow.take(16, SP.sm), `Противник ${this.enemyIndex + 1} / ${enemies.length}`, p));

    // Карточка врага: панель + рендер 240 + имя + чипы
    const renderSize = ART.enemyRender.show;
    const cardH = renderSize + SP.lg * 2 + 24 + 20 + SP.md + ART.chip.h + SP.lg;
    const cardY = flow.take(cardH);
    this.body.add(panel(this, GUTTER, cardY, CONTENT_W, cardH, p, { stroke: dc.n, radius: RADIUS.lg }));
    // подсветка домена за рендером
    const glow = this.add.graphics();
    glow.fillStyle(dc.n, 0.12);
    glow.fillCircle(CANVAS.w / 2, cardY + SP.lg + renderSize / 2, renderSize / 2 + 8);
    this.body.add(glow);
    const img = enemyRender(this, CANVAS.w / 2, cardY + SP.lg + renderSize / 2, e, 1, renderSize, p);
    this.body.add(img);
    // маска-скругление через рамку
    const frame = this.add.graphics();
    frame.lineStyle(2, dc.n, 0.8);
    frame.strokeRoundedRect(CANVAS.w / 2 - renderSize / 2, cardY + SP.lg, renderSize, renderSize, RADIUS.lg);
    this.body.add(frame);
    // бейдж ранга (I–IV) в углу
    const rb = this.add.graphics();
    rb.fillStyle(p.insetN, 0.9);
    rb.fillCircle(CANVAS.w / 2 + renderSize / 2 - 20, cardY + SP.lg + 20, 16);
    rb.lineStyle(2, dc.n, 1);
    rb.strokeCircle(CANVAS.w / 2 + renderSize / 2 - 20, cardY + SP.lg + 20, 16);
    this.body.add(rb);
    this.body.add(this.add.text(CANVAS.w / 2 + renderSize / 2 - 20, cardY + SP.lg + 20, ['I', 'II', 'III', 'IV'][e.rank - 1], TX.num(p, { color: dc.s })).setOrigin(0.5));

    let ty = cardY + SP.lg + renderSize + SP.md;
    this.body.add(this.add.text(CANVAS.w / 2, ty, e.name, TX.title(p, { align: 'center' })).setOrigin(0.5, 0));
    ty += 24 + SP.xs;
    this.body.add(this.add.text(CANVAS.w / 2, ty, e.title, TX.body(p, { color: p.sub, align: 'center' })).setOrigin(0.5, 0));
    ty += 20 + SP.md;
    const c1 = chip(this, 0, ty, domainLabel[e.domain], p, { icon: domainIcon[e.domain], iconTint: dc.n, color: dc.s, border: dc.n });
    const c2 = chip(this, 0, ty, gameState.progress.defeated.includes(e.id) ? 'Побеждён' : 'Не опознан', p, {
      icon: gameState.progress.defeated.includes(e.id) ? 'enemy-defeated' : 'enemy-unknown',
    });
    const total = c1.width + SP.sm + c2.width;
    c1.setX(CANVAS.w / 2 - total / 2);
    c2.setX(c1.x + c1.width + SP.sm);
    this.body.add([c1, c2]);

    // Подсказка-источник
    const hintH = 64;
    const hy = flow.take(hintH);
    this.body.add(panel(this, GUTTER, hy, CONTENT_W, hintH, p));
    this.body.add(icon(this, GUTTER + SP.lg + 12, hy + hintH / 2, 'src-chart', p.infoN));
    this.body.add(this.add.text(GUTTER + SP.lg + 36, hy + hintH / 2, 'Источник: график и объём.\nДанные не подсказывают ответ.', TX.body(p, { color: p.sub })).setOrigin(0, 0.5));

    // CTA внизу
    const btnY = bottom - ART.button.h;
    this.body.add(button(this, GUTTER, btnY, 'Принять бой', p, () => { this.phase = 'task'; this.rebuild(); }, { width: CONTENT_W, icon: 'nav-arena' }));
    const skipY = btnY - SP.md - ART.button.hSm;
    this.body.add(button(this, GUTTER, skipY, 'Другой противник', p, () => { this.enemyIndex = (this.enemyIndex + 1) % enemies.length; this.rebuild(); }, { width: CONTENT_W, variant: 'ghost', height: ART.button.hSm }));
  }

  /* ---------- Задание ---------- */
  private renderTask(): void {
    const p = currentPalette();
    const e = enemies[this.enemyIndex % enemies.length];
    const dc = domainColor(p, e.domain);
    const flow = new Flow(CHROME.topBar + SP.lg);

    // Шапка задания: аватар 40 + имя + домен
    const headH = 44;
    const hy = flow.take(headH);
    this.body.add(enemyRender(this, GUTTER + 20, hy + 20, e, 1, 40, p));
    this.body.add(this.add.text(GUTTER + 40 + SP.md, hy + 8, e.name, TX.body(p, { color: p.text })));
    this.body.add(this.add.text(GUTTER + 40 + SP.md, hy + 26, domainLabel[e.domain], TX.caption(p, { color: dc.s })));
    this.body.add(icon(this, CANVAS.w - GUTTER - 12, hy + 20, domainIcon[e.domain], dc.n));

    // Источник: свечи
    const chartH = 150;
    const cy = flow.take(chartH);
    const candles = genCandles(e.task.chart, e.id.charCodeAt(2) * 31);
    const level = e.task.chart === 'fakeBreakout' ? 104 : undefined;
    this.body.add(drawCandleChart(this, GUTTER, cy, CONTENT_W, chartH, candles, p, { level }));
    const tag = chip(this, GUTTER + SP.sm, cy + SP.sm, 'ГРАФИК · 1H', p, { icon: 'src-chart', iconTint: p.infoN, fill: p.surfaceN });
    this.body.add(tag);

    // Вопрос — «бумажный» блок
    const q = this.add.text(0, 0, e.task.prompt, TX.bodyLg(p, { color: p.inkText, wrap: CONTENT_W - SP.lg * 2 }));
    const qH = q.height + SP.lg * 2;
    const qy = flow.take(qH);
    this.body.add(panel(this, GUTTER, qy, CONTENT_W, qH, p, { fill: p.paperN }));
    q.setPosition(GUTTER + SP.lg, qy + SP.lg);
    this.body.add(q);

    // Варианты
    this.body.add(sectionLabel(this, GUTTER, flow.take(16, SP.sm), 'Твоё решение', p));
    const rows: ReturnType<typeof answerRow>[] = [];
    e.task.options.forEach((opt, i) => {
      const row = answerRow(this, GUTTER, 0, CONTENT_W, opt, i, p, () => this.answer(i, rows));
      row.c.setY(flow.take(row.h, SP.sm));
      rows.push(row);
      this.body.add(row.c);
    });
  }

  private answer(i: number, rows: ReturnType<typeof answerRow>[]): void {
    const e = enemies[this.enemyIndex % enemies.length];
    const card = cards.find((c) => c.counters === e.id) ?? cards[0];
    const correct = i === e.task.correct;
    rows.forEach((r, k) => {
      if (k === e.task.correct) r.setState('correct');
      else if (k === i) r.setState('wrong');
      else r.setState('dim');
    });
    this.lastCorrect = correct;
    this.lastDelta = gameState.answer(e.id, card.id, correct);
    if (!correct) this.cameras.main.shake(160, 0.004);
    this.time.delayedCall(700, () => { this.phase = 'feedback'; this.rebuild(); });
  }

  /* ---------- Вердикт ---------- */
  private renderFeedback(): void {
    const p = currentPalette();
    const e = enemies[this.enemyIndex % enemies.length];
    const card = cards.find((c) => c.counters === e.id) ?? cards[0];
    const ok = this.lastCorrect;
    const col = ok ? p.goodN : p.badN;
    const colS = ok ? p.good : p.bad;
    const flow = new Flow(CHROME.topBar + SP.xl);
    const bottom = CANVAS.h - bottomNavHeight() - SP.lg;

    // Вердикт
    const vh = 96;
    const vy = flow.take(vh);
    this.body.add(panel(this, GUTTER, vy, CONTENT_W, vh, p, { stroke: col, strokeW: 2, radius: RADIUS.lg }));
    const circ = this.add.graphics();
    circ.fillStyle(col, 1);
    circ.fillCircle(GUTTER + SP.lg + 24, vy + vh / 2, 24);
    this.body.add(circ);
    this.body.add(icon(this, GUTTER + SP.lg + 24, vy + vh / 2, ok ? 'act-check' : 'act-close', p.insetN, ART.iconLg.size));
    this.body.add(this.add.text(GUTTER + SP.lg + 64, vy + SP.lg + 2, ok ? 'ВЕРНО' : 'ЛОВУШКА', TX.display(p, { color: colS })));
    this.body.add(this.add.text(GUTTER + SP.lg + 64, vy + SP.lg + 36, ok ? `${e.name} опознан` : `${e.name} взял своё`, TX.body(p, { color: p.sub })));

    // Дельты — три плашки в ряд
    const cellW = (CONTENT_W - SP.sm * 2) / 3;
    const dh = 64;
    const dy = flow.take(dh);
    const d = this.lastDelta;
    const items = [
      { ic: 'act-flame', v: `+${d.xp}`, l: 'опыт', c: p.accentN, cs: p.accent },
      { ic: 'act-coin', v: `+${d.coins}`, l: 'SIG', c: p.warnN, cs: p.warn },
      { ic: 'dom-risk', v: `${d.risk > 0 ? '+' : ''}${d.risk}`, l: 'запас', c: d.risk >= 0 ? p.goodN : p.badN, cs: d.risk >= 0 ? p.good : p.bad },
    ];
    items.forEach((it, i) => {
      const x = GUTTER + i * (cellW + SP.sm);
      this.body.add(panel(this, x, dy, cellW, dh, p));
      this.body.add(icon(this, x + SP.md + 10, dy + dh / 2, it.ic, it.c, 20));
      this.body.add(this.add.text(x + SP.md + 28, dy + 14, it.v, TX.numLg(p, { color: it.cs })));
      this.body.add(this.add.text(x + SP.md + 28, dy + 40, it.l, TX.caption(p)));
    });

    // Урок + карта навыка
    const cardW = ART.card.showW;
    const cardH = ART.card.showH;
    const lh = cardH + SP.lg * 2;
    const ly = flow.take(lh);
    this.body.add(panel(this, GUTTER, ly, CONTENT_W, lh, p));
    const cardImg = this.add.image(GUTTER + SP.lg + cardW / 2, ly + SP.lg + cardH / 2, `card_${card.id}`).setDisplaySize(cardW, cardH);
    this.body.add(cardImg);
    this.body.add(this.add.text(GUTTER + SP.lg + cardW / 2, ly + lh - SP.lg - 30, card.name, TX.caption(p, { color: p.text, align: 'center', wrap: cardW - 12 })).setOrigin(0.5, 0));
    const tx = GUTTER + SP.lg + cardW + SP.lg;
    const tw = CONTENT_W - SP.lg * 3 - cardW;
    this.body.add(sectionLabel(this, tx, ly + SP.lg, ok ? 'Почему это работает' : 'Что было на самом деле', p, colS));
    this.body.add(this.add.text(tx, ly + SP.lg + 20, e.task.lesson, TX.body(p, { color: p.text, wrap: tw })));
    const dc = domainColor(p, card.domain);
    this.body.add(chip(this, tx, ly + lh - SP.lg - ART.chip.h, ok ? 'Карта получена' : 'Карта в Академии', p, { icon: ok ? 'act-check' : 'nav-academy', iconTint: dc.n, color: dc.s, border: dc.n }));

    // CTA
    const btnY = bottom - ART.button.h;
    this.body.add(button(this, GUTTER, btnY, 'Следующий противник', p, () => {
      this.enemyIndex = (this.enemyIndex + 1) % enemies.length;
      this.phase = 'encounter';
      this.rebuild();
    }, { width: CONTENT_W, icon: 'act-chevron-right' }));
    if (!ok) {
      this.body.add(button(this, GUTTER, btnY - SP.md - ART.button.hSm, 'Повторить', p, () => { this.phase = 'task'; this.rebuild(); }, { width: CONTENT_W, variant: 'secondary', height: ART.button.hSm, icon: 'act-refresh' }));
    }
  }
}
