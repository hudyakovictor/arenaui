// Галерея ассетов — экран контроля: каждая иконка в 24px с id, каждый виджет в стандартном размере,
// свотчи палитры текущей эпохи, журнал подмен. Если здесь всё ровно — в сценах тоже будет ровно.
import Phaser from 'phaser';
import { ICONS, type IconGroup } from '../assets/iconSet';
import { assetLog, icon, enemyAvatar, enemyRender, skillCard } from '../assets/AssetKit';
import { enemies } from '../data/enemies';
import { cards } from '../data/cards';
import { hex, type Palette } from '../ui/palette';
import { ART, CANVAS, CHROME, CONTENT_W, GUTTER, RADIUS, SP } from '../ui/tokens';
import * as TX from '../ui/text';
import { Flow } from '../ui/layout';
import { renderBackground, currentPalette, header, transitionTo } from '../ui/shell';
import { panel, button, chip, listRow, progressBar, sectionLabel, iconButton } from '../ui/widgets';

const GROUPS: { id: IconGroup; title: string }[] = [
  { id: 'nav', title: 'Навигация · 24px' },
  { id: 'domain', title: 'Домены · 24px' },
  { id: 'action', title: 'Действия · 24px' },
  { id: 'source', title: 'Источники · 24px' },
  { id: 'status', title: 'Редкость / статус · 24px' },
];

export class AssetGalleryScene extends Phaser.Scene {
  private content!: Phaser.GameObjects.Container;
  private scrollY = 0;
  private maxScroll = 0;
  private dragStartY = 0;
  private dragStartScroll = 0;
  private dragging = false;

  constructor() { super({ key: 'AssetGalleryScene' }); }

  create(): void {
    const p = currentPalette();
    renderBackground(this, p);
    this.cameras.main.fadeIn(180, 0, 0, 0);
    // Высота шапки известна из токенов: topBar + отступ + строка заголовка + отступ.
    const top = CHROME.topBar + SP.lg + 28 + SP.lg;

    this.content = this.add.container(0, 0);
    const maskShape = this.make.graphics({ x: 0, y: 0 }, false);
    maskShape.fillRect(0, top - SP.sm, CANVAS.w, CANVAS.h - (top - SP.sm));
    this.content.setMask(maskShape.createGeometryMask());

    const flow = new Flow(top);
    this.buildContent(p, flow);
    this.maxScroll = Math.max(0, flow.y + SP.xl - CANVAS.h);
    this.setupScroll();

    // Фиксированная шапка рисуется ПОСЛЕ контента — значит, поверх него.
    const hdrBg = this.add.graphics();
    hdrBg.fillStyle(p.bgN, 0.96);
    hdrBg.fillRect(0, 0, CANVAS.w, top - SP.sm);
    hdrBg.lineStyle(1, p.borderN, 1);
    hdrBg.lineBetween(0, top - SP.sm, CANVAS.w, top - SP.sm);
    header(this, 'Галерея ассетов', p, () => transitionTo(this, 'MoreScene'));
    this.add.text(CANVAS.w - GUTTER, CHROME.topBar + SP.lg + 14, 'листай ↕', TX.caption(p)).setOrigin(1, 0.5);
  }

  private add_(o: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
    this.content.add(o as Phaser.GameObjects.GameObject);
  }

  private buildContent(p: Palette, flow: Flow): void {
    const s = this;
    // Статус
    const stH = 56;
    const sy = flow.take(stH);
    const ok = assetLog.length === 0;
    this.add_(panel(s, GUTTER, sy, CONTENT_W, stH, p, { stroke: ok ? p.goodN : p.warnN }));
    this.add_(icon(s, GUTTER + SP.lg + 12, sy + stH / 2, ok ? 'act-check' : 'act-alert', ok ? p.goodN : p.warnN));
    this.add_(s.add.text(GUTTER + SP.lg + 36, sy + stH / 2, ok ? `Иконок в наборе: ${ICONS.length}. Ошибок загрузки: 0` : `Подмен заглушками: ${assetLog.length} (см. консоль)`, TX.body(p, { color: ok ? p.good : p.warn, wrap: CONTENT_W - 72 })).setOrigin(0, 0.5));

    // Палитра
    this.add_(sectionLabel(s, GUTTER, flow.take(16, SP.sm), `Палитра · ${p.name}`, p));
    const swatches: [string, number][] = [
      ['bg', p.bgN], ['surface', p.surfaceN], ['elevated', p.elevatedN], ['border', p.borderN], ['strong', p.strongN],
      ['accent', p.accentN], ['good', p.goodN], ['bad', p.badN], ['warn', p.warnN], ['info', p.infoN], ['crypto', p.cryptoN], ['text', p.textN],
    ];
    const swCols = 6;
    const swW = (CONTENT_W - SP.sm * (swCols - 1)) / swCols;
    const swH = 52;
    const rows = Math.ceil(swatches.length / swCols);
    const swY = flow.take(rows * (swH + SP.sm));
    swatches.forEach(([name, col], i) => {
      const x = GUTTER + (i % swCols) * (swW + SP.sm);
      const y = swY + Math.floor(i / swCols) * (swH + SP.sm);
      const g = s.add.graphics();
      g.fillStyle(col, 1); g.fillRoundedRect(x, y, swW, 30, RADIUS.sm);
      g.lineStyle(1, p.borderN, 1); g.strokeRoundedRect(x, y, swW, 30, RADIUS.sm);
      this.add_(g);
      this.add_(s.add.text(x + swW / 2, y + 33, name, TX.code(p, { align: 'center' })).setOrigin(0.5, 0));
      this.add_(s.add.text(x + swW / 2, y + 44, hex(col), TX.code(p, { color: p.muted, align: 'center' })).setOrigin(0.5, 0));
    });

    // Иконки по группам: ячейка 56×64, иконка 24 в плашке 40, подпись id
    const cols = 6;
    const cellW = CONTENT_W / cols;
    const cellH = 66;
    for (const grp of GROUPS) {
      const list = ICONS.filter((i) => i.group === grp.id);
      this.add_(sectionLabel(s, GUTTER, flow.take(16, SP.sm), grp.title, p));
      const rowsN = Math.ceil(list.length / cols);
      const gy = flow.take(rowsN * cellH);
      list.forEach((def, i) => {
        const cx = GUTTER + (i % cols) * cellW + cellW / 2;
        const cy = gy + Math.floor(i / cols) * cellH;
        const bg = s.add.graphics();
        bg.fillStyle(p.elevatedN, 1); bg.fillRoundedRect(cx - 20, cy, 40, 40, RADIUS.sm);
        bg.lineStyle(1, p.borderN, 1); bg.strokeRoundedRect(cx - 20, cy, 40, 40, RADIUS.sm);
        this.add_(bg);
        const tint = grp.id === 'domain' ? p.accentN : grp.id === 'status' ? p.warnN : p.textN;
        this.add_(icon(s, cx, cy + 20, def.id, tint));
        this.add_(s.add.text(cx, cy + 44, def.id.replace(/^(nav|dom|act|src|rar|enemy)-/, ''), TX.code(p, { align: 'center' })).setOrigin(0.5, 0));
      });
    }

    // Размеры иконок
    this.add_(sectionLabel(s, GUTTER, flow.take(16, SP.sm), 'Масштабы иконки: 16 · 20 · 24 · 32 · 48', p));
    const szY = flow.take(64);
    [16, 20, 24, 32, 48].forEach((sz, i) => {
      const x = GUTTER + 30 + i * 70;
      this.add_(icon(s, x, szY + 24, 'nav-arena', p.accentN, sz));
      this.add_(s.add.text(x, szY + 52, String(sz), TX.code(p, { align: 'center' })).setOrigin(0.5, 0));
    });

    // Кнопки
    this.add_(sectionLabel(s, GUTTER, flow.take(16, SP.sm), 'Кнопки · h48 / h40, hit ≥ 44', p));
    this.add_(button(s, GUTTER, flow.take(ART.button.h, SP.sm), 'Primary с иконкой', p, () => {}, { width: CONTENT_W, icon: 'nav-arena' }));
    const half = (CONTENT_W - SP.sm) / 2;
    const by = flow.take(ART.button.h, SP.sm);
    this.add_(button(s, GUTTER, by, 'Secondary', p, () => {}, { width: half, variant: 'secondary' }));
    this.add_(button(s, GUTTER + half + SP.sm, by, 'Ghost', p, () => {}, { width: half, variant: 'ghost' }));
    const by2 = flow.take(ART.button.h);
    this.add_(button(s, GUTTER, by2, 'Danger', p, () => {}, { width: half, variant: 'danger', icon: 'act-alert' }));
    this.add_(button(s, GUTTER + half + SP.sm, by2, 'Закрыто', p, () => {}, { width: half, disabled: true, hint: 'нужен 5 уровень' }));
    const ibY = flow.take(44);
    ['act-back', 'act-close', 'act-settings', 'act-search', 'act-refresh', 'act-plus'].forEach((id, i) => {
      this.add_(iconButton(s, GUTTER + 22 + i * 56, ibY + 22, id, p, () => {}));
    });

    // Чипы
    this.add_(sectionLabel(s, GUTTER, flow.take(16, SP.sm), 'Чипы · h24', p));
    const cy = flow.take(ART.chip.h);
    let cx = GUTTER;
    const chips = [
      chip(s, cx, cy, 'Обычный', p),
      chip(s, 0, cy, 'С иконкой', p, { icon: 'src-chart', iconTint: p.infoN }),
      chip(s, 0, cy, 'Верно', p, { icon: 'act-check', iconTint: p.goodN, color: p.good, border: p.goodN }),
      chip(s, 0, cy, 'Риск', p, { icon: 'dom-risk', iconTint: p.badN, color: p.bad, border: p.badN }),
    ];
    chips.forEach((c) => { c.setX(cx); cx += c.width + SP.sm; this.add_(c); });

    // Строки списка и прогресс
    this.add_(sectionLabel(s, GUTTER, flow.take(16, SP.sm), 'Строка списка · h56', p));
    this.add_(listRow(s, GUTTER, flow.take(ART.row.h, SP.sm), CONTENT_W, p, { icon: 'nav-academy', title: 'Заголовок строки', sub: 'Подзаголовок серым', right: '12/20', onTap: () => {} }));
    this.add_(listRow(s, GUTTER, flow.take(ART.row.h), CONTENT_W, p, { icon: 'act-coin', title: 'Закрытая строка', sub: 'Откроется позже', locked: true, right: 'СКОРО' }));
    this.add_(sectionLabel(s, GUTTER, flow.take(16, SP.sm), 'Прогресс · h8 / h6', p));
    this.add_(progressBar(s, GUTTER, flow.take(8, SP.sm), CONTENT_W, 8, 0.62, p.accentN, p));
    this.add_(progressBar(s, GUTTER, flow.take(6), CONTENT_W, 6, 0.3, p.badN, p));

    // Иллюстрации: рендер 240 / аватары 56 / карты 110×160
    this.add_(sectionLabel(s, GUTTER, flow.take(16, SP.sm), `Рендер врага · показ ${ART.enemyRender.show}px (мастер ${ART.enemyRender.size})`, p));
    const rY = flow.take(ART.enemyRender.show);
    this.add_(enemyRender(s, GUTTER + ART.enemyRender.show / 2, rY + ART.enemyRender.show / 2, enemies[0], 1, ART.enemyRender.show, p));
    const stX = GUTTER + ART.enemyRender.show + SP.lg;
    [1, 2, 3, 4].forEach((st, i) => {
      const y = rY + i * 58;
      this.add_(enemyRender(s, stX + 24, y + 24, enemies[3], st, 48, p));
      this.add_(s.add.text(stX + 56, y + 24, `S${st}`, TX.code(p)).setOrigin(0, 0.5));
    });

    this.add_(sectionLabel(s, GUTTER, flow.take(16, SP.sm), `Аватары · ${ART.enemyAvatar.show}px`, p));
    const aY = flow.take(ART.enemyAvatar.show);
    enemies.forEach((e, i) => this.add_(enemyAvatar(s, GUTTER + 28 + i * 60, aY + 28, e, ART.enemyAvatar.show, p)));

    this.add_(sectionLabel(s, GUTTER, flow.take(16, SP.sm), `Карты навыков · ${ART.card.showW}×${ART.card.showH}`, p));
    const kY = flow.take(ART.card.showH + 20);
    [...cards.slice(0, 2), 'wait' as const].forEach((c, i) => {
      const x = GUTTER + ART.card.showW / 2 + i * (ART.card.showW + SP.md);
      this.add_(skillCard(s, x, kY + ART.card.showH / 2, c, ART.card.showW, p));
      this.add_(s.add.text(x, kY + ART.card.showH + SP.xs, c === 'wait' ? 'ЖДАТЬ' : c.name, TX.code(p, { align: 'center' })).setOrigin(0.5, 0));
    });

    // Журнал
    if (assetLog.length) {
      this.add_(sectionLabel(s, GUTTER, flow.take(16, SP.sm), 'Журнал подмен', p, p.warn));
      assetLog.slice(0, 12).forEach((l) => {
        const t = s.add.text(GUTTER, 0, `${l.key} — ${l.reason}`, TX.code(p, { color: p.warn, wrap: CONTENT_W }));
        t.setY(flow.take(t.height, SP.xs));
        this.add_(t);
      });
    }
    flow.gap(CHROME.bottomNav);
  }

  private setupScroll(): void {
    this.input.on('pointerdown', (pt: Phaser.Input.Pointer) => { this.dragging = true; this.dragStartY = pt.y; this.dragStartScroll = this.scrollY; });
    this.input.on('pointermove', (pt: Phaser.Input.Pointer) => {
      if (!this.dragging || !pt.isDown) return;
      this.setScroll(this.dragStartScroll + (this.dragStartY - pt.y));
    });
    this.input.on('pointerup', () => { this.dragging = false; });
    this.input.on('wheel', (_p: unknown, _o: unknown, _dx: number, dy: number) => this.setScroll(this.scrollY + dy * 0.6));
  }

  private setScroll(v: number): void {
    this.scrollY = Phaser.Math.Clamp(v, 0, this.maxScroll);
    this.content.setY(-this.scrollY);
  }
}
