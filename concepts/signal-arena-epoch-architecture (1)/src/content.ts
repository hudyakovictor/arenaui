import type { EpochId } from './themes';

export interface Clue {
  id: string;
  text: string;
  signal: boolean; // улика ведёт к правильному ответу
}

export interface Source {
  id: string;
  name: string;
  trust: number; // 0..100, показывается только при включённом «скане»
  series: number[];
  clues: Clue[];
}

export interface Encounter {
  level: number;
  xp: number; // 0..100 внутри уровня
  sig: number;
  budget: number;
  weather: string;
  threat: number; // 0..100
  question: string;
  sources: Source[];
  answers: string[];
  correct: number;
}

export const ENCOUNTERS: Record<EpochId, Encounter> = {
  street: {
    level: 7,
    xp: 62,
    sig: 140,
    budget: 3,
    weather: 'ШУМ ×2',
    threat: 35,
    question: 'Почему район затопило слухами о закрытии рынка?',
    sources: [
      {
        id: 'chat',
        name: 'ЧАТ ДВОРА',
        trust: 30,
        series: [2, 3, 2, 8, 14, 12, 15],
        clues: [
          { id: 'c1', text: 'Один аккаунт запостил 40 сообщений за час', signal: true },
          { id: 'c2', text: '«Все говорят, что закроют»', signal: false },
          { id: 'c3', text: 'Скрин без даты и источника', signal: false },
        ],
      },
      {
        id: 'news',
        name: 'НОВОСТИ',
        trust: 70,
        series: [1, 1, 1, 1, 2, 3, 3],
        clues: [
          { id: 'n1', text: 'Мэрия: ремонт крыши, рынок работает', signal: false },
          { id: 'n2', text: 'Заметка вышла на день позже пика', signal: false },
        ],
      },
    ],
    answers: ['Рынок правда закрывают', 'Один аккаунт разогнал волну', 'Мэрия скрывает', 'Это сезонный шум'],
    correct: 1,
  },
  cabinet: {
    level: 33,
    xp: 41,
    sig: 820,
    budget: 2,
    weather: 'Туман',
    threat: 52,
    question: 'Подтверждает ли отчёт фонда рост доходов, о котором пишет газета?',
    sources: [
      {
        id: 'paper',
        name: 'Газета',
        trust: 55,
        series: [4, 5, 5, 6, 9, 12, 13],
        clues: [
          { id: 'p1', text: 'Заголовок: «Доходы выросли втрое»', signal: false },
          { id: 'p2', text: 'В тексте: рост за квартал, не за год', signal: true },
          { id: 'p3', text: 'Цитата без имени и должности', signal: false },
        ],
      },
      {
        id: 'report',
        name: 'Отчёт фонда',
        trust: 80,
        series: [4, 4, 5, 5, 5, 6, 6],
        clues: [
          { id: 'r1', text: 'Годовой доход: +12 %, не ×3', signal: true },
          { id: 'r2', text: 'Один квартал действительно ×3 — эффект базы', signal: false },
        ],
      },
      {
        id: 'blog',
        name: 'Блог аналитика',
        trust: 45,
        series: [3, 6, 4, 7, 5, 8, 6],
        clues: [{ id: 'b1', text: 'Пересказывает газету, цифр не приводит', signal: false }],
      },
    ],
    answers: ['Да, полностью', 'Нет: газета взяла квартал за год', 'Отчёт подделан', 'Данных недостаточно'],
    correct: 1,
  },
  terminal: {
    level: 64,
    xp: 78,
    sig: 2310,
    budget: 1,
    weather: 'packet loss',
    threat: 71,
    question: 'restore chain: why did node-7 traffic spike before the leak?',
    sources: [
      {
        id: 'log',
        name: 'syslog',
        trust: 90,
        series: [1, 1, 2, 1, 9, 11, 10],
        clues: [
          { id: 'l1', text: '03:12 cron job pushed config to node-7', signal: true },
          { id: 'l2', text: '03:40 outbound ×9, no auth failures', signal: true },
          { id: 'l3', text: '02:00 routine backup, normal size', signal: false },
        ],
      },
      {
        id: 'git',
        name: 'git',
        trust: 85,
        series: [0, 0, 1, 0, 0, 0, 0],
        clues: [
          { id: 'g1', text: 'commit e41f: debug=true left in prod config', signal: true },
          { id: 'g2', text: 'README updated', signal: false },
        ],
      },
      {
        id: 'chat',
        name: 'ops-chat',
        trust: 40,
        series: [2, 2, 3, 2, 4, 8, 12],
        clues: [
          { id: 'o1', text: '«наверное DDoS» — без данных', signal: false },
          { id: 'o2', text: 'ссылка на новость про другую компанию', signal: false },
        ],
      },
    ],
    answers: ['ddos', 'config push → debug on → dump out', 'backup overflow', 'insider'],
    correct: 1,
  },
  system: {
    level: 88,
    xp: 23,
    sig: 5400,
    budget: 0,
    weather: 'Ясно',
    threat: 84,
    question: 'Что объясняет расхождение между опросом, продажами и поисковым трендом?',
    sources: [
      {
        id: 'poll',
        name: 'Опрос',
        trust: 60,
        series: [5, 5, 6, 6, 7, 7, 8],
        clues: [
          { id: 's1', text: 'Выборка: онлайн-панель, 18–34', signal: true },
          { id: 's2', text: '«Планируют купить» — не «купили»', signal: false },
        ],
      },
      {
        id: 'sales',
        name: 'Продажи',
        trust: 95,
        series: [6, 6, 6, 5, 5, 4, 4],
        clues: [
          { id: 'v1', text: 'Падение только в офлайне, онлайн +9 %', signal: true },
          { id: 'v2', text: 'Данные за 6 недель', signal: false },
        ],
      },
      {
        id: 'trend',
        name: 'Тренд',
        trust: 70,
        series: [3, 4, 6, 9, 12, 13, 14],
        clues: [
          { id: 't1', text: 'Рост запросов — из другого региона', signal: true },
          { id: 't2', text: 'Пик совпал с рекламной кампанией', signal: false },
        ],
      },
    ],
    answers: [
      'Опрос завышает интерес',
      'Разные аудитории, каналы и регионы — нет противоречия',
      'Продажи падают, тренд ошибочен',
      'Реклама исказила всё',
    ],
    correct: 1,
  },
};
