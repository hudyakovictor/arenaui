import type { Domain } from './enemies';

export interface SkillCard {
  id: string;
  name: string;
  domain: Domain;
  rank: 1 | 2 | 3;
  /** Какого врага раскрывает. */
  counters: string;
  short: string;
}

export const cards: SkillCard[] = [
  { id: 'C1', name: 'Размер позиции', domain: 'risk', rank: 1, counters: 'E01', short: 'Риск на сделку ≤ 1–2% депозита.' },
  { id: 'C2', name: 'Подтверждение пробоя', domain: 'technical', rank: 1, counters: 'E02', short: 'Закрытие + объём, а не первая свеча.' },
  { id: 'C3', name: 'Пауза перед входом', domain: 'cognitive', rank: 2, counters: 'E03', short: 'Три вопроса перед кнопкой.' },
  { id: 'C4', name: 'Первоисточник', domain: 'context', rank: 1, counters: 'E04', short: 'Дата, автор, оригинал.' },
  { id: 'C5', name: 'Чтение подписи', domain: 'crypto', rank: 2, counters: 'E05', short: 'Approve ≠ получить.' },
  { id: 'C6', name: 'Стоп-день', domain: 'human', rank: 3, counters: 'E06', short: 'Лимит убытка на день — и выход.' },
];
