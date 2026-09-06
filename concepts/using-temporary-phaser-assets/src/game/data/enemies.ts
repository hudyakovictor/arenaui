// Враги стадии I «Улица» — компактный набор для проверки интерфейса и первых заданий.
export type Domain = 'technical' | 'risk' | 'context' | 'crypto' | 'human' | 'cognitive';

export interface Task {
  /** Вопрос, который видит игрок. */
  prompt: string;
  /** Варианты; index — правильный. */
  options: string[];
  correct: number;
  /** Что объяснить после ответа. */
  lesson: string;
  /** Генератор свечей: тренд и «ловушка». */
  chart: 'fakeBreakout' | 'pump' | 'range' | 'dump';
}

export interface Enemy {
  id: string;
  name: string;
  title: string;
  domain: Domain;
  rank: 1 | 2 | 3 | 4;
  /** Есть ли реальный арт в public/assets/render/enemies/{id}_s1.png */
  hasArt: boolean;
  task: Task;
}

export const enemies: Enemy[] = [
  {
    id: 'E01', name: 'Гоблин Плеча', title: 'Плечо ×100 и уверенность ×0', domain: 'risk', rank: 1, hasArt: true,
    task: {
      prompt: 'Депозит 1000. Сделка с плечом ×50 на 20% депозита. Цена идёт против тебя на 2%. Что с позицией?',
      options: ['Минус 2% — терпимо', 'Минус 20% от депо, ликвидация рядом', 'Позиция полностью ликвидирована'],
      correct: 2,
      lesson: 'При ×50 ход в 2% = 100% маржи позиции. Плечо умножает не прибыль, а скорость смерти депозита.',
      chart: 'dump',
    },
  },
  {
    id: 'E02', name: 'Фантом Пробоя', title: 'Ложный пробой уровня', domain: 'technical', rank: 1, hasArt: true,
    task: {
      prompt: 'Цена пробила сопротивление одной длинной свечой и тут же вернулась под уровень. Объём на пробое ниже среднего. Твоё действие?',
      options: ['Покупать — пробой есть', 'Ждать закрытия свечи над уровнем', 'Шортить немедленно'],
      correct: 1,
      lesson: 'Пробой без объёма и без закрепления — ловушка. Подтверждение важнее скорости.',
      chart: 'fakeBreakout',
    },
  },
  {
    id: 'E03', name: 'Призрак FOMO', title: 'Все уже купили, кроме тебя', domain: 'cognitive', rank: 2, hasArt: true,
    task: {
      prompt: 'Монета +140% за сутки, лента полна скриншотов прибыли. Ты не в позиции. Что делаешь?',
      options: ['Захожу на всё — тренд друг', 'Захожу 5% и ставлю стоп', 'Ничего. Записываю в журнал и жду отката'],
      correct: 2,
      lesson: 'FOMO — это чужая прибыль, которая давит на твою кнопку. Отсутствие сделки тоже сделка.',
      chart: 'pump',
    },
  },
  {
    id: 'E04', name: 'Шёпот Ленты', title: 'Новость, которой уже год', domain: 'context', rank: 1, hasArt: false,
    task: {
      prompt: 'В чате скинули «срочную» новость о листинге. Дата публикации — 11 месяцев назад. Цена не двигается.',
      options: ['Покупаю — рынок ещё не увидел', 'Проверяю первоисточник и дату, сделки нет', 'Шорчу — новость отыграна'],
      correct: 1,
      lesson: 'Старая новость не двигает рынок. Первоисточник и дата — первое, что проверяется.',
      chart: 'range',
    },
  },
  {
    id: 'E05', name: 'Кошелёк-Пустышка', title: 'Аирдроп с подписью', domain: 'crypto', rank: 2, hasArt: false,
    task: {
      prompt: 'Сайт обещает аирдроп, просит подписать транзакцию «approve unlimited». Что это значит?',
      options: ['Обычная подпись для получения', 'Разрешение тратить все твои токены', 'Проверка владения кошельком'],
      correct: 1,
      lesson: '«Approve unlimited» отдаёт контракту право на все токены. Подпись — это не «ок», это доверенность.',
      chart: 'range',
    },
  },
  {
    id: 'E06', name: 'Мститель', title: 'Отыграться прямо сейчас', domain: 'human', rank: 2, hasArt: false,
    task: {
      prompt: 'Три стопа подряд. Рука тянется открыть сделку вдвое больше, «чтобы вернуть». Что делаешь?',
      options: ['Открываю — статистика на моей стороне', 'Закрываю терминал до завтра', 'Уменьшаю размер и торгую дальше'],
      correct: 1,
      lesson: 'Серия стопов меняет не рынок, а тебя. Тильт лечится не размером позиции, а паузой.',
      chart: 'dump',
    },
  },
];

export const domainLabel: Record<Domain, string> = {
  technical: 'Тех. анализ',
  risk: 'Риск',
  context: 'Контекст',
  crypto: 'Крипто',
  human: 'Человек',
  cognitive: 'Когнитив',
};

export const domainIcon: Record<Domain, string> = {
  technical: 'dom-technical',
  risk: 'dom-risk',
  context: 'dom-context',
  crypto: 'dom-crypto',
  human: 'dom-human',
  cognitive: 'dom-cognitive',
};
