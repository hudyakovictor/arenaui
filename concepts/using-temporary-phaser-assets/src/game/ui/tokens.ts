// SIGNAL ARENA — базовые токены интерфейса (совместимо с phaser/src/ui/tokens.ts).
// Правило: в сценах НЕТ инлайновых размеров шрифта и магических отступов.

export const CANVAS = { w: 390, h: 844 } as const;

export const FS = {
  caption: 12,
  body: 14,
  bodyLg: 16,
  title: 20,
  display: 28,
} as const;

export const LINE = { tight: 1.15, normal: 1.35, loose: 1.5 } as const;

export const SP = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const GUTTER = SP.lg;
export const CONTENT_W = CANVAS.w - GUTTER * 2;

export const RADIUS = { sm: 6, md: 10, lg: 14, pill: 999 } as const;

export const HIT = { min: 44, comfortable: 48 } as const;

export const DUR = { tap: 120, panel: 240, scene: 180, counter: 500, candle: 200 } as const;

export const EASE = { out: 'Cubic.easeOut', inOut: 'Cubic.easeInOut', back: 'Back.easeOut' } as const;

export const CHROME = { topBar: 64, bottomNav: 64 } as const;

/**
 * Стандартные размеры графики (ART_SPEC §2). Единственный источник правды:
 * загрузчик, виджеты и галерея берут размеры ОТСЮДА, а не пишут числа руками.
 */
export const ART = {
  /** Иконка stroke-семейства: логический размер и размер растеризации (2x — чтобы не мылилась). */
  icon: { size: 24, raster: 48 },
  /** Иконка в крупной кнопке / в заголовке. */
  iconLg: { size: 32 },
  /** Иконка-силуэт врага. */
  enemyIcon: { size: 96 },
  /** Аватар-кроп врага (грузим 200, показываем 56–120). */
  enemyAvatar: { size: 200, show: 56 },
  /** Рендер стадии врага. */
  enemyRender: { size: 512, show: 240 },
  /** Карта навыка (портрет 2:3-ish). */
  card: { w: 220, h: 320, showW: 110, showH: 160 },
  /** Плашка-строка списка. */
  row: { h: 56 },
  /** Стандартная карточка контента (панель). */
  panel: { minH: 72 },
  /** Чип. */
  chip: { h: 24 },
  /** Кнопка. */
  button: { h: 48, hSm: 40 },
} as const;
