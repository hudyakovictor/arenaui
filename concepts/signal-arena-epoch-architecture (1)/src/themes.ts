export type EpochId = 'street' | 'cabinet' | 'terminal' | 'system';

export interface EpochTheme {
  id: EpochId;
  index: number;
  name: string;
  levels: [number, number];
  motto: string;
  colors: {
    bg: string;
    panel: string;
    panel2: string;
    ink: string;
    inkMuted: string;
    accent: string;
    accentInk: string;
    good: string;
    bad: string;
    warn: string;
    line: string;
  };
  font: { display: string; body: string; mono: string };
  radius: number;
  texture: 'brick' | 'paper' | 'grid' | 'none';
  shadow: boolean;
  uppercase: boolean;
  /** Профиль плотности — высоты слотов (px в системе 390×844). browser — flex-остаток. */
  density: {
    rail: number;
    questionMin: number;
    evidence: number;
    cards: number;
    answers: number;
    nav: number;
    gap: number;
    pad: number;
  };
  crutches: { hint: boolean; scan: boolean; cross: boolean; skip: boolean };
  operation: {
    id: string;
    label: string;
    evidenceNeeded: number;
    rule: string;
  };
  nav: string[];
}

export const THEMES: Record<EpochId, EpochTheme> = {
  street: {
    id: 'street',
    index: 1,
    name: 'STREET',
    levels: [1, 20],
    motto: 'Одна улика — один ответ',
    colors: {
      bg: '#0f0f10',
      panel: '#1a1a1c',
      panel2: '#242427',
      ink: '#f4f4f0',
      inkMuted: '#9a9a94',
      accent: '#c8ff00',
      accentInk: '#0f0f10',
      good: '#4ade80',
      bad: '#ff4d4d',
      warn: '#ffb020',
      line: '#333336',
    },
    font: {
      display: "Impact, 'Arial Narrow', 'Helvetica Neue', sans-serif",
      body: "'Helvetica Neue', Arial, sans-serif",
      mono: 'ui-monospace, Menlo, monospace',
    },
    radius: 4,
    texture: 'brick',
    shadow: true,
    uppercase: true,
    density: { rail: 48, questionMin: 76, evidence: 60, cards: 76, answers: 152, nav: 56, gap: 8, pad: 12 },
    crutches: { hint: true, scan: true, cross: true, skip: true },
    operation: {
      id: 'signal',
      label: 'СИГНАЛ',
      evidenceNeeded: 1,
      rule: 'Найди одну улику, которая отвечает на вопрос. Все подсказки включены.',
    },
    nav: ['АРЕНА', 'КАРТА', 'БАНДА', 'ЛАВКА'],
  },
  cabinet: {
    id: 'cabinet',
    index: 2,
    name: 'Cabinet',
    levels: [21, 50],
    motto: 'Сопоставь два источника',
    colors: {
      bg: '#efe6d4',
      panel: '#f8f2e6',
      panel2: '#e6dcc6',
      ink: '#2b2622',
      inkMuted: '#7a6f63',
      accent: '#b8492f',
      accentInk: '#fbf7ef',
      good: '#3f7d5a',
      bad: '#a83a2a',
      warn: '#b07a1e',
      line: '#d6c9b0',
    },
    font: {
      display: "Georgia, 'Times New Roman', serif",
      body: "Georgia, 'Times New Roman', serif",
      mono: 'ui-monospace, Menlo, monospace',
    },
    radius: 10,
    texture: 'paper',
    shadow: false,
    uppercase: false,
    density: { rail: 44, questionMin: 84, evidence: 60, cards: 68, answers: 148, nav: 56, gap: 10, pad: 14 },
    crutches: { hint: true, scan: true, cross: false, skip: false },
    operation: {
      id: 'compare',
      label: 'Сопоставление',
      evidenceNeeded: 2,
      rule: 'Нужны две улики из разных источников. Перекрёстная проверка и пропуск отключены.',
    },
    nav: ['Дело', 'Архив', 'Кабинет', 'Лавка'],
  },
  terminal: {
    id: 'terminal',
    index: 3,
    name: 'terminal',
    levels: [51, 80],
    motto: 'Собери цепочку доказательств',
    colors: {
      bg: '#050705',
      panel: '#0b0f0b',
      panel2: '#121812',
      ink: '#c9f5c9',
      inkMuted: '#5f8a5f',
      accent: '#7cff7c',
      accentInk: '#050705',
      good: '#7cff7c',
      bad: '#ff7c7c',
      warn: '#e6ff7c',
      line: '#1e2e1e',
    },
    font: {
      display: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
      body: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
      mono: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
    },
    radius: 0,
    texture: 'grid',
    shadow: false,
    uppercase: false,
    density: { rail: 40, questionMin: 64, evidence: 56, cards: 56, answers: 140, nav: 52, gap: 6, pad: 8 },
    crutches: { hint: true, scan: false, cross: false, skip: false },
    operation: {
      id: 'chain',
      label: 'chain://',
      evidenceNeeded: 3,
      rule: 'Три улики в причинной последовательности. Осталась только одна подсказка.',
    },
    nav: ['arena', 'map', 'log', 'shop'],
  },
  system: {
    id: 'system',
    index: 4,
    name: 'System',
    levels: [81, 99],
    motto: 'Синтез без подсказок',
    colors: {
      bg: '#fafafa',
      panel: '#ffffff',
      panel2: '#f1f1f3',
      ink: '#111114',
      inkMuted: '#7c7c85',
      accent: '#111114',
      accentInk: '#ffffff',
      good: '#1f8a5b',
      bad: '#c93b3b',
      warn: '#b8860b',
      line: '#e4e4e8',
    },
    font: {
      display: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
      body: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
      mono: 'ui-monospace, Menlo, monospace',
    },
    radius: 12,
    texture: 'none',
    shadow: false,
    uppercase: false,
    density: { rail: 40, questionMin: 72, evidence: 52, cards: 0, answers: 140, nav: 56, gap: 10, pad: 14 },
    crutches: { hint: false, scan: false, cross: false, skip: false },
    operation: {
      id: 'synthesis',
      label: 'Синтез',
      evidenceNeeded: 3,
      rule: 'Инструментов нет. Три улики, вывод — ваш.',
    },
    nav: ['Арена', 'Карта', 'Профиль', 'Магазин'],
  },
};

export const EPOCH_ORDER: EpochId[] = ['street', 'cabinet', 'terminal', 'system'];

export function getEpochForLevel(level: number): EpochTheme {
  return (
    EPOCH_ORDER.map((id) => THEMES[id]).find((t) => level >= t.levels[0] && level <= t.levels[1]) ??
    THEMES.system
  );
}
