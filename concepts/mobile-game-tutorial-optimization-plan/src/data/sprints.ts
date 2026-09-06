export interface Sprint {
  n: number;
  title: string;
  weeks: string;
  target: number;
  cats: number[];
  goals: string[];
  gate: string;
}

export const sprints: Sprint[] = [
  {
    n: 0,
    title: 'Фундамент',
    weeks: 'Неделя 1',
    target: 38,
    cats: [1, 9, 10],
    goals: [
      'Монорепо pnpm: один @arena/engine вместо двух копий',
      'ESLint strict + Prettier + husky, tsconfig strict, ноль `as any`',
      'GitHub Actions: lint → typecheck → unit → build',
      'Golden-тест детерминизма клиент/сервер в CI',
      'Одна правда в README: Fastify + SQLite(dev)/PG(prod)',
    ],
    gate: 'CI зелёный, engine импортируется из одного места, ArenaScene разбит на модули',
  },
  {
    n: 1,
    title: 'Мост клиент ↔ сервер',
    weeks: 'Недели 2–3',
    target: 52,
    cats: [2, 3],
    goals: [
      'ApiClient + anonymous auth + refresh',
      'Арена берёт задания из /tasks/next и отвечает через /attempts',
      'AttemptQueue на IndexedDB + /attempts/batch',
      'Контент и конфиг из /content и /config с ETag',
      'Честный нулевой старт, dev-хуки за DEV-флагом',
    ],
    gate: 'Полная сессия проходит через сервер, офлайн-ответы доезжают после реконнекта',
  },
  {
    n: 2,
    title: 'Контент, который проходит автотест',
    weeks: 'Недели 4–5',
    target: 65,
    cats: [4],
    goals: [
      'Исправить C3.6 и покрытие skills; lint контента в сборке',
      'answerPool ≥4, длина вариантов ±10 %, порядок по seed',
      '60 базовых шаблонов Приложения Б → 99 (33 врага × 3 стадии)',
      'Боты ≤30 % успеха, «нераскрытие» зелёное',
      '35 атомов и 8 комбо задействованы',
    ],
    gate: 'autotest.ts в CI без предупреждений, каждый атом используется в Арене',
  },
  {
    n: 3,
    title: 'Обучающая эффективность',
    weeks: 'Недели 6–7',
    target: 76,
    cats: [5, 6],
    goals: [
      'Модель знаний по атомам (BKT/ELO) вместо «уровень открывает главу»',
      'FSRS поверх schedule_queue, свиток M7 — источник повторения',
      'Объяснение после каждого ответа, диагностический вход',
      'FTUE ≤90 с до первой победы, итог сессии, микро-цели',
      'Пред/пост-замер и learning gain',
    ],
    gate: 'Пилот 30 учеников: learning gain > 0, D1 retention ≥ 40 %',
  },
  {
    n: 4,
    title: 'Мобильный UX и производительность',
    weeks: 'Недели 8–9',
    target: 87,
    cats: [7, 8],
    goals: [
      'Scale.RESIZE + safe-area, 320–430 px, тап-цели 44 pt',
      'Атласы вместо 182 SVG, растеризация на сборке, PWA + SW',
      'Bundle ≤1.5 МБ gzip, TTI ≤3 с, 60 fps',
      'Пустые/ошибочные состояния, офлайн-баннер, хаптика',
      'Юзабилити-тест 10 сессий → топ-15 исправлений',
    ],
    gate: 'Lighthouse mobile ≥ 90, нет утечек памяти за 30 минут игры',
  },
  {
    n: 5,
    title: 'Безопасность, аналитика, доступность',
    weeks: 'Недели 10–11',
    target: 95,
    cats: [11, 12, 13],
    goals: [
      'zod-env, ротация JWT, rate limit, CSP, антифрод на сервере',
      'Event-schema, 20 событий воронки, retention и learning дашборды',
      'A/B через сегменты /config',
      'Screen-reader оверлей, контраст 4.5:1, i18n ru/en',
      'GDPR/152-ФЗ: экспорт и удаление данных',
    ],
    gate: 'Пентест без high, crash-free ≥ 99.5 %, VoiceOver проходит 3 экрана',
  },
  {
    n: 6,
    title: 'Релиз и полировка до 99',
    weeks: 'Неделя 12',
    target: 99,
    cats: [14],
    goals: [
      'Capacitor iOS/Android, TestFlight/Internal с 20 тестерами',
      'Рейтинг 12+, дисклеймеры, privacy manifest, Data safety',
      'Soft-launch в одном регионе, 2 недели метрик',
      'Финальный аудит 350 факторов двумя ревьюерами',
      'RELEASE_REPORT.md',
    ],
    gate: 'Оба стора приняли билд, аудит ≥ 99 / 100',
  },
];
