import type { StageDef } from '../theme/stages';

export type SourceId = 'chart' | 'news' | 'position' | 'orderbook';

export interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number; // объём 0..1
}

export interface EvidenceZone {
  id: string;
  source: SourceId;
  label: string;
  short: string; // подпись в доке улик
  isCorrect: boolean;
  /** индекс свечи для зон графика */
  candle?: number;
}

export interface CardDef {
  id: string;
  name: string;
  kind: 'required' | 'context' | 'wait' | 'decoy';
  hint: string;
}

export interface AnswerDef {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  /** какие улики поддерживают этот ответ */
  supportedBy: string[];
  isWait?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  src: string;
  time: string;
  evidenceId?: string;
  label?: { text: string; tone: 'good' | 'bad' | 'warn' };
}

export interface Encounter {
  id: string;
  ticker: string;
  timeframe: string;
  question: string;
  hint: string;
  weather: string;
  sources: SourceId[];
  candles: Candle[];
  evidence: EvidenceZone[];
  news: NewsItem[];
  cards: CardDef[];
  answers: AnswerDef[];
  correct: AnswerDef['id'];
  enemy: { id: string; name: string; domain: string; stage: number };
  verdict?: { a: string; b: string; correct: 'A' | 'B' };
  /** правильный порядок стека (id карт) */
  stackOrder: string[];
}

function makeCandles(seed = 7): Candle[] {
  const out: Candle[] = [];
  let p = 100;
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < 16; i++) {
    const drift = i < 9 ? 0.4 : i < 13 ? 2.4 : -0.6;
    const o = p;
    const c = p + drift + (rnd() - 0.5) * 1.6;
    const h = Math.max(o, c) + rnd() * 1.2;
    const l = Math.min(o, c) - rnd() * 1.2;
    // объём падает на памп-участке — это и есть улика
    const v = i < 9 ? 0.45 + rnd() * 0.25 : i < 13 ? 0.18 + rnd() * 0.1 : 0.5 + rnd() * 0.3;
    out.push({ o, h, l, c, v });
    p = c;
  }
  return out;
}

const BASE_NEWS: NewsItem[] = [
  { id: 'n1', title: 'Кит скупил 12 000 BTC — «начало ралли»', src: 'анонимный TG-канал', time: '12:04' },
  { id: 'n2', title: 'Спотовый объём −35% к 20-дневному среднему', src: 'данные биржи', time: '11:58', evidenceId: 'ev-vol-news' },
  { id: 'n3', title: 'Аналитик: «летим на луну, не проспите»', src: 'инфлюенсер', time: '11:40' },
];

export function buildEncounter(stage: StageDef): Encounter {
  const st = stage.structure;
  const candles = makeCandles(3 + stage.index);

  const evidence: EvidenceZone[] = [
    { id: 'ev-vol', source: 'chart', label: 'Рост цены при падающем объёме', short: 'Объём ↓ на росте', isCorrect: true, candle: 11 },
    { id: 'ev-wick', source: 'chart', label: 'Длинная верхняя тень на пике', short: 'Тень на пике', isCorrect: stage.index >= 3, candle: 12 },
    { id: 'ev-break', source: 'chart', label: 'Пробой уровня без ретеста', short: 'Пробой без ретеста', isCorrect: false, candle: 9 },
    { id: 'ev-vol-news', source: 'news', label: 'Официальные данные: спот-объём −35%', short: 'Спот −35% (биржа)', isCorrect: true },
    { id: 'ev-risk', source: 'position', label: 'Два входа без стопа в журнале', short: 'Входы без стопа', isCorrect: false },
    { id: 'ev-thin', source: 'orderbook', label: 'Тонкий стакан, стен нет', short: 'Тонкий стакан', isCorrect: stage.index >= 3 },
  ];

  const labelsFor = (): NewsItem[] =>
    BASE_NEWS.map((n) => {
      if (st.labels === 'all') {
        if (n.id === 'n1') return { ...n, label: { text: 'СЛУХ', tone: 'bad' } };
        if (n.id === 'n2') return { ...n, label: { text: 'ФАКТ', tone: 'good' } };
        if (n.id === 'n3') return { ...n, label: { text: 'ШУМ', tone: 'warn' } };
      }
      if (st.labels === 'partial' && n.id === 'n2') return { ...n, label: { text: 'ИСТОЧНИК: БИРЖА', tone: 'good' } };
      if (st.labels === 'false' && n.id === 'n1') return { ...n, label: { text: 'ПОДТВЕРЖДЕНО', tone: 'good' } };
      return n;
    });

  const allCards: CardDef[] = [
    { id: 'c-volume', name: 'Объём подтверждает', kind: 'required', hint: 'Рост без объёма — рост без покупателей.' },
    { id: 'c-source', name: 'Проверь источник', kind: 'required', hint: 'Анонимный канал ≠ данные биржи.' },
    { id: 'c-stop', name: 'Стоп до входа', kind: 'context', hint: 'Размер позиции — от расстояния до стопа.' },
    { id: 'c-wait', name: 'Ждать', kind: 'wait', hint: 'Отсутствие сделки — тоже решение.' },
    { id: 'c-fomo', name: 'Догнать движение', kind: 'decoy', hint: 'Ловушка: покупка на эмоции.' },
  ];

  const sources: SourceId[] = (['chart', 'news', 'orderbook', 'position'] as SourceId[]).slice(0, Math.max(st.tabs + (st.blindTab ? 0 : 0), 1));
  // слепая вкладка добавляется поверх лимита табов
  if (st.blindTab && sources.length < 4) sources.push(st.tabs >= 3 ? 'position' : 'orderbook');

  const questionByStage: Record<number, string> = {
    1: 'Цена растёт три свечи подряд. Входить сейчас?',
    2: 'Канал кричит о ките, цена растёт. Что делать?',
    3: 'Памп на тонком стакане при слабом объёме. План?',
    4: 'BTC +4% за час. Лента и стакан противоречат. Решение?',
  };
  const hintByStage: Record<number, string> = {
    1: 'Сначала найди улику на графике, потом выбирай ответ.',
    2: 'Сверь ленту с графиком: чему верить — данным или крику?',
    3: 'Нужно две улики из разных источников.',
    4: '',
  };

  return {
    id: `E${stage.index}-0${stage.index * 3}`,
    ticker: 'BTC/USDT',
    timeframe: stage.index >= 3 ? '15m' : '1h',
    question: questionByStage[stage.index],
    hint: hintByStage[stage.index],
    weather: stage.index === 1 ? 'Тренд' : stage.index === 2 ? 'Новости' : stage.index === 3 ? 'Волатильность' : 'Поздний цикл',
    sources,
    candles,
    evidence,
    news: labelsFor(),
    cards: allCards.slice(0, st.cards),
    answers: [
      { id: 'A', text: 'Купить по рынку — движение сильное', supportedBy: ['ev-break'] },
      { id: 'B', text: 'Ждать: рост без объёма — не подтверждён', supportedBy: ['ev-vol', 'ev-vol-news', 'ev-wick', 'ev-thin'], isWait: true },
      { id: 'C', text: 'Шорт от пика с плечом ×10', supportedBy: ['ev-wick'] },
      { id: 'D', text: 'Купить половину, вторую — «если пойдёт»', supportedBy: ['ev-break', 'ev-risk'] },
    ],
    correct: 'B',
    enemy: { id: 'E05', name: 'FOMO-Шептун', domain: 'cognitive', stage: Math.min(stage.index, 3) },
    verdict: st.verdict ? { a: 'Сила движения', b: 'Слабость объёма', correct: 'B' } : undefined,
    stackOrder: ['c-source', 'c-volume', 'c-wait', 'c-stop'].slice(0, Math.max(st.stackSlots, 0)),
  };
}

export const ENEMY_POOL = [
  { id: 'E05', name: 'FOMO-Шептун' },
  { id: 'E02', name: 'Ложный пробой' },
  { id: 'E11', name: 'Кит-фантом' },
  { id: 'E08', name: 'Плечо-соблазн' },
];
