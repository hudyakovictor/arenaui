// SIGNAL ARENA — контракт стадий v2.
// Принцип: один скелет экрана, но стадия меняет СТРУКТУРУ обучения (что показано,
// сколько источников, сколько улик, какая форма ответа), а не только палитру.
// «Терминал» — финальная стадия: к виду биржевого терминала игрок приходит последним.

export type StageId = 'street' | 'cabinet' | 'desk' | 'terminal';

export interface StageTokens {
  bg: string;
  surface: string;
  elevated: string;
  border: string;
  strong: string;
  accent: string;
  accentInk: string;
  good: string;
  bad: string;
  warn: string;
  text: string;
  sub: string;
  muted: string;
  radius: string;
  fontHead: string;
  fontUi: string;
  fontMono: string;
  density: number; // 1 = просторно, 0.8 = плотно
  texture: 'brick' | 'paper' | 'grid' | 'none';
}

export interface StageStructure {
  /** Сколько вкладок браузера открыто одновременно */
  tabs: number;
  /** Есть ли закрытая (слепая) вкладка за бюджет */
  blindTab: boolean;
  /** Подсвечивать ли улики на графике */
  evidenceHighlight: boolean;
  /** Сколько верных улик требуется для «обоснованного» ответа */
  evidenceRequired: number;
  /** Ярлыки-костыли на источниках */
  labels: 'all' | 'partial' | 'none' | 'false';
  /** Карты: количество и режим отображения */
  cards: number;
  cardMode: 'guided' | 'context' | 'stack' | 'silent';
  /** Слоты стека решений (0 = обычный выбор одного ответа) */
  stackSlots: number;
  /** Ставка уверенности */
  confidence: boolean;
  /** Вердикт конфликта факторов перед ответом */
  verdict: boolean;
  /** Опознание врага после ответа: варианты (0 = вводить по журналу) */
  identifyOptions: number;
  /** Пошаговый режим: 1 улика → 2 ответ → 3 подтверждение */
  stepper: boolean;
  /** Показывать ли объяснение «почему» до ответа */
  hintLine: boolean;
  /** Разделы навигации */
  nav: NavId[];
}

export type NavId = 'academy' | 'arena' | 'journal' | 'collection' | 'more';

export interface StageDef {
  id: StageId;
  index: 1 | 2 | 3 | 4;
  name: string;
  short: string;
  levels: [number, number];
  motto: string;
  goal: string; // чему учит стадия — одна фраза
  tokens: StageTokens;
  structure: StageStructure;
}

const MONO = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const UI = 'Inter, system-ui, -apple-system, sans-serif';

export const STAGES: Record<StageId, StageDef> = {
  // I. УЛИЦА — L1–30. Учим ОДНОМУ жесту: найти улику, затем выбрать.
  street: {
    id: 'street',
    index: 1,
    name: 'УЛИЦА',
    short: 'I',
    levels: [1, 30],
    motto: 'Ты здесь ради денег. Именно поэтому ты уже в опасности.',
    goal: 'Научиться видеть одну улику и опираться на неё, а не на эмоцию.',
    tokens: {
      bg: '#0b0c0f',
      surface: '#15171c',
      elevated: '#1d2026',
      border: '#2c3038',
      strong: '#3d434d',
      accent: '#c8ff00',
      accentInk: '#0b0c0f',
      good: '#4ade80',
      bad: '#ff4d5e',
      warn: '#ffb341',
      text: '#f4f5f7',
      sub: '#b5bac3',
      muted: '#7a8089',
      radius: '18px',
      fontHead: '"Oswald", Inter, system-ui, sans-serif',
      fontUi: UI,
      fontMono: MONO,
      density: 1,
      texture: 'brick',
    },
    structure: {
      tabs: 1,
      blindTab: false,
      evidenceHighlight: true,
      evidenceRequired: 1,
      labels: 'all',
      cards: 2,
      cardMode: 'guided',
      stackSlots: 0,
      confidence: false,
      verdict: false,
      identifyOptions: 2,
      stepper: true,
      hintLine: true,
      nav: ['academy', 'arena', 'journal'],
    },
  },
  // II. КАБИНЕТ — L31–60. Два источника, ставка уверенности, улика без подсветки.
  cabinet: {
    id: 'cabinet',
    index: 2,
    name: 'КАБИНЕТ',
    short: 'II',
    levels: [31, 60],
    motto: 'Рынок — это не график. Это люди, которые рисуют график.',
    goal: 'Сопоставлять два источника и честно оценивать свою уверенность.',
    tokens: {
      bg: '#0a1020',
      surface: '#101a30',
      elevated: '#15223d',
      border: '#26375a',
      strong: '#3a5080',
      accent: '#5aa8ff',
      accentInk: '#061021',
      good: '#3bde8a',
      bad: '#ff596d',
      warn: '#ffb341',
      text: '#ebf2ff',
      sub: '#9fb0cc',
      muted: '#66748f',
      radius: '14px',
      fontHead: UI,
      fontUi: UI,
      fontMono: MONO,
      density: 0.95,
      texture: 'paper',
    },
    structure: {
      tabs: 2,
      blindTab: false,
      evidenceHighlight: false,
      evidenceRequired: 1,
      labels: 'partial',
      cards: 3,
      cardMode: 'context',
      stackSlots: 0,
      confidence: true,
      verdict: true,
      identifyOptions: 4,
      stepper: false,
      hintLine: true,
      nav: ['academy', 'arena', 'journal', 'collection'],
    },
  },
  // III. ДЕСК — L61–85. Три источника, стек из карт, две улики, слепая вкладка.
  desk: {
    id: 'desk',
    index: 3,
    name: 'ДЕСК',
    short: 'III',
    levels: [61, 85],
    motto: 'Волатильность временна. Твоя ошибка — навсегда.',
    goal: 'Собирать план из нескольких шагов и платить за недостающие данные.',
    tokens: {
      bg: '#07090f',
      surface: '#0e1220',
      elevated: '#141a2c',
      border: '#222b42',
      strong: '#34405e',
      accent: '#f5f7fb',
      accentInk: '#07090f',
      good: '#3bde8a',
      bad: '#ff596d',
      warn: '#ffb341',
      text: '#f4f6fb',
      sub: '#9aa7c0',
      muted: '#5d6a85',
      radius: '10px',
      fontHead: UI,
      fontUi: UI,
      fontMono: MONO,
      density: 0.9,
      texture: 'none',
    },
    structure: {
      tabs: 3,
      blindTab: true,
      evidenceHighlight: false,
      evidenceRequired: 2,
      labels: 'none',
      cards: 4,
      cardMode: 'stack',
      stackSlots: 3,
      confidence: true,
      verdict: true,
      identifyOptions: 4,
      stepper: false,
      hintLine: false,
      nav: ['academy', 'arena', 'journal', 'collection', 'more'],
    },
  },
  // IV. ТЕРМИНАЛ — L86–99. Финал: плотный терминал, ложные ярлыки, стек 4, без подсказок.
  terminal: {
    id: 'terminal',
    index: 4,
    name: 'ТЕРМИНАЛ',
    short: 'IV',
    levels: [86, 99],
    motto: 'Система работает. Пока ты не вмешаешься.',
    goal: 'Работать как на реальной бирже: шум, ложные метки, полная ответственность.',
    tokens: {
      bg: '#05080e',
      surface: '#0a1018',
      elevated: '#0f1722',
      border: '#1c2836',
      strong: '#2c3d52',
      accent: '#ffb341',
      accentInk: '#0a0a05',
      good: '#2fd37f',
      bad: '#ff5164',
      warn: '#ffb341',
      text: '#e6edf5',
      sub: '#8fa1b8',
      muted: '#556579',
      radius: '6px',
      fontHead: MONO,
      fontUi: UI,
      fontMono: MONO,
      density: 0.82,
      texture: 'grid',
    },
    structure: {
      tabs: 3,
      blindTab: true,
      evidenceHighlight: false,
      evidenceRequired: 2,
      labels: 'false',
      cards: 5,
      cardMode: 'silent',
      stackSlots: 4,
      confidence: true,
      verdict: true,
      identifyOptions: 0,
      stepper: false,
      hintLine: false,
      nav: ['academy', 'arena', 'journal', 'collection', 'more'],
    },
  },
};

export const STAGE_ORDER: StageId[] = ['street', 'cabinet', 'desk', 'terminal'];

export function stageForLevel(level: number): StageDef {
  for (const id of STAGE_ORDER) {
    const e = STAGES[id];
    if (level >= e.levels[0] && level <= e.levels[1]) return e;
  }
  return STAGES.terminal;
}

export function tokensToCss(t: StageTokens): React.CSSProperties {
  return {
    ['--bg' as string]: t.bg,
    ['--surface' as string]: t.surface,
    ['--elevated' as string]: t.elevated,
    ['--border' as string]: t.border,
    ['--strong' as string]: t.strong,
    ['--accent' as string]: t.accent,
    ['--accent-ink' as string]: t.accentInk,
    ['--good' as string]: t.good,
    ['--bad' as string]: t.bad,
    ['--warn' as string]: t.warn,
    ['--text' as string]: t.text,
    ['--sub' as string]: t.sub,
    ['--muted' as string]: t.muted,
    ['--radius' as string]: t.radius,
    ['--font-head' as string]: t.fontHead,
    ['--font-ui' as string]: t.fontUi,
    ['--font-mono' as string]: t.fontMono,
    ['--density' as string]: String(t.density),
  };
}
