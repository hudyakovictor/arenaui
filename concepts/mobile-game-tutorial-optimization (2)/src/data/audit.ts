export type Evidence = {
  file: string;
  code: string;
  problem: string;
  fix: string;
  impact: string;
};

export const evidence: Evidence[] = [
  {
    file: 'phaser/src/scenes/ArenaScene.ts',
    code: "fontSize:'7px' … fontSize:'6px' … fontSize:'5px'",
    problem: 'Десятки текстов 5–8 px. На телефоне это нечитаемо — игрок физически не видит улики, подсказки и награды.',
    fix: 'Типографическая шкала 12/14/16/20/24/32 px и запрет любых значений < 12 px через lint-правило.',
    impact: 'Типографика, Mobile UX, Обучение',
  },
  {
    file: 'phaser/src/scenes/ArenaScene.ts',
    code: 'const seed = (level*100000 + xp + Date.now())>>>0',
    problem: '«Детерминированный движок» (M11) сломан: Date.now() делает каждую задачу невоспроизводимой. Нельзя ни отладить, ни поделиться сидом, ни проверить на сервере.',
    fix: 'seedrandom(`${userId}:${level}:${attempt}`) — сид приходит с сервера и записывается в результат.',
    impact: 'Механики, Backend, Тесты',
  },
  {
    file: 'phaser/src/scenes/ArenaScene.ts',
    code: "createDebugEpochSwitcher() → 'LVL+8'",
    problem: 'Дев-кнопка «+8 уровней» видна каждому игроку прямо в главной сцене. Любой оценщик нажмёт её первой.',
    fix: 'import.meta.env.DEV && createDebugPanel() — и вынести в отдельный DebugPlugin.',
    impact: 'Качество кода, Визуал',
  },
  {
    file: 'phaser/src/scenes/ArenaScene.ts',
    code: "'M3 СТАВКА УВЕРЕННОСТИ' · 'M5 ОПОЗНАНИЕ ВРАГА' · '(ТЗ Часть 3)' · 'силуэт 5–8% rim'",
    problem: 'Внутренние идентификаторы механик и цитаты из ТЗ показываются игроку. Это нарушает правила тона и выглядит как черновик.',
    fix: 'Словарь строк ru.json: M3 → «Насколько уверен?», M5 → «Кто это был?». Метки остаются только в комментариях кода.',
    impact: 'Тексты, Обучение, Визуал',
  },
  {
    file: 'phaser/src/scenes/ArenaScene.ts',
    code: '// стираем область — проще поверх\nthis.add.rectangle(58, ey+1, 160, 16, …)',
    problem: 'Каждый тап по улике добавляет новые объекты поверх старых. За одну задачу — сотни «мусорных» GameObject, просадка FPS и рост памяти.',
    fix: 'Хранить ссылки на Text/Rectangle и обновлять setText()/setFillStyle(); блоки — в Container с destroy(true).',
    impact: 'Производительность, Архитектура',
  },
  {
    file: 'phaser/src/scenes/ArenaScene.ts',
    code: 'private refreshActionButton(){ const btnY=700; // будет нижняя кнопка }',
    problem: 'Пустой метод, неиспользуемые импорты (cards, cardKey, templateFor), unused uiGroup. Заготовки вместо функций.',
    fix: 'ESLint no-unused-vars + noUnusedLocals в tsconfig; удалить или реализовать.',
    impact: 'Качество кода',
  },
  {
    file: 'phaser/src/scenes/ArenaScene.ts',
    code: 'const dist = isCorrect ? [12,58,22,8] : [38,18,32,12]',
    problem: '«Тень арены» (M14) — хардкод процентов. Новости — хардкод трёх строк. Проверка стека (M2) — «упрощено». Комбо (M8) — комментарий.',
    fix: 'Реальные данные с /api/v1/shadow, генератор новостей из шаблонов, таблица допустимых порядков в шаблоне.',
    impact: 'Механики, Backend',
  },
  {
    file: 'phaser/package.json',
    code: '"dependencies": { "phaser": "^4.2.1" }',
    problem: 'ТЗ требует Phaser 3 + rexUI + Zustand + seedrandom + vite-plugin-pwa + Vitest + Playwright. Установлен только Phaser 4. Нет ни одного теста, нет lint, нет PWA.',
    fix: 'Привести стек к ТЗ либо явно согласовать Phaser 4 (rexUI с ним несовместим).',
    impact: 'Стек / ТЗ, Тесты, Релиз',
  },
  {
    file: 'phaser/src/config/gameConfig.ts',
    code: 'width: 390, height: 844, scale: { mode: Phaser.Scale.FIT }',
    problem: 'Жёсткий холст iPhone 14. На Android 360×800 и на 20:9 — чёрные полосы, safe-area не учтена, touch-цели уменьшаются ещё сильнее.',
    fix: 'Scale.RESIZE + якорная раскладка (safe-area insets, min/max ширина 360–430), resolution = devicePixelRatio.',
    impact: 'Mobile UX, Типографика',
  },
  {
    file: 'README.md',
    code: 'мост клиент→API — следующий шаг',
    problem: '36 роутов и WS на сервере — но клиент их не вызывает. Прогресс живёт в localStorage и подделывается за 10 секунд.',
    fix: 'ApiClient + offline-queue; скоринг и сид — на сервере; localStorage только как кэш.',
    impact: 'Backend, Безопасность',
  },
];

export const stackTable = [
  { req: 'Phaser 3 + TS + Vite', actual: 'Phaser 4.2.1', ok: false, note: 'мажорная версия другая, rexUI несовместим' },
  { req: 'rexUI (панели, вкладки, списки)', actual: 'нет', ok: false, note: 'всё нарисовано вручную rectangle + text' },
  { req: 'Свой CandleChart на Graphics', actual: 'fakeCandles() из прямоугольников', ok: false, note: 'нет масштаба, объёма, интерактива' },
  { req: 'Zustand', actual: 'самописный gameState', ok: false, note: 'без подписок и селекторов' },
  { req: 'seedrandom + scenario-gen', actual: 'Math + Date.now()', ok: false, note: 'детерминизм нарушен' },
  { req: 'Fastify + SQLite + Drizzle + Zod + WS', actual: 'есть, 36 роутов', ok: true, note: 'не подключён к клиенту' },
  { req: 'Phaser Sound', actual: 'нет', ok: false, note: 'ни одного звука' },
  { req: 'vite-plugin-pwa', actual: 'нет', ok: false, note: 'нет офлайна и установки' },
  { req: 'Vitest + Playwright', actual: 'нет', ok: false, note: '0 тестов в репозитории' },
];

export const toneTable = [
  { before: 'M3 СТАВКА УВЕРЕННОСТИ — как уверен?', after: 'Насколько ты уверен?' },
  { before: 'M5 ОПОЗНАНИЕ ВРАГА — кто это был?', after: 'Кто это был?' },
  { before: 'M14 ТЕНЬ АРЕНЫ — как ответили другие', after: 'Как ответили другие' },
  { before: 'UNKNOWN THREAT · Враг раскроется после решения · M5', after: 'Противник скрыт. Раскроется после решения' },
  { before: 'СНАЧАЛА УЛИКА (M1)', after: 'Сначала найди улику' },
  { before: 'M1: выбери улику в источнике, затем ответ — иначе неполная награда', after: 'Улика → ответ. Без улики награда меньше' },
  { before: 'эпоха взрослеет без новых экранов — только состояния блоков (ТЗ Часть 3)', after: '— (удалить: это заметка для разработчика)' },
  { before: 'силуэт 5–8% rim', after: '— (удалить)' },
  { before: 'BUDGET = 0 · DRAWDOWN LEVIATHAN · СБЫТИЕ С БЮДЖЕТОМ', after: 'Бюджет исчерпан. Левиафан просадки' },
  { before: 'ЯРЛЫК: ПАМP БЕЗ ОБЪЁМА ★', after: 'Памп без объёма' },
];

export const typeScale = [
  { name: 'display', px: 32, use: 'Результат: ВЕРНО / НЕВЕРНО, смена эпохи' },
  { name: 'h1', px: 24, use: 'Вопрос задачи' },
  { name: 'h2', px: 20, use: 'Заголовки блоков, названия врагов' },
  { name: 'body', px: 16, use: 'Варианты ответов, уроки, объяснения' },
  { name: 'label', px: 14, use: 'Кнопки, вкладки, улики' },
  { name: 'caption', px: 12, use: 'Мета: тикер, таймфрейм, время — минимум' },
];

export const mechanics = [
  { id: 'M1', name: 'Улики', status: 2, note: 'работает; сделать анимацию сбора и объяснение «почему это улика»' },
  { id: 'M2', name: 'Стек', status: 0, note: 'проверка «по списку skills» — нужна таблица допустимых порядков в шаблоне' },
  { id: 'M3', name: 'Ставка', status: 2, note: 'работает; показать калибровку игроку графиком' },
  { id: 'M4', name: 'Вердикт', status: 1, note: 'есть выбор фактора, нет объяснения, почему он доминирует' },
  { id: 'M5', name: 'Опознание', status: 1, note: 'варианты берутся первыми из списка — нужна выборка похожих врагов' },
  { id: 'M6', name: 'Проигрыш вперёд', status: 0, note: 'прямоугольники вместо свечей — нужен CandleChart, который доигрывает сценарий' },
  { id: 'M7', name: 'Свиток ошибок', status: 2, note: 'работает; добавить интервальное повторение' },
  { id: 'M8', name: 'Комбо', status: 0, note: 'только комментарий «в реальном движке»' },
  { id: 'M9', name: 'Слепой источник', status: 1, note: 'есть; цена открытия не объяснена игроку' },
  { id: 'M10', name: 'Холодная голова', status: 1, note: 'задержка есть; нужно дыхание-анимация и текст' },
  { id: 'M11', name: 'Детерминизм', status: 0, note: 'Date.now() в сиде — убрать, сид с сервера' },
  { id: 'M12', name: 'Кампания', status: 1, note: 'стадии есть; нет карты кампании в UI' },
  { id: 'M13', name: 'Погода', status: 1, note: 'только строка сверху — должна менять мутации' },
  { id: 'M14', name: 'Тень арены', status: 0, note: 'хардкод процентов — агрегировать на сервере' },
  { id: 'M15', name: '—', status: 0, note: 'заявлена в README, в коде отсутствует' },
];

export type Sprint = {
  n: number;
  title: string;
  weeks: number;
  from: number;
  to: number;
  goals: string[];
  cats: string[];
};

export const roadmap: Sprint[] = [
  {
    n: 0,
    title: 'Hotfix: убрать то, за что снимают баллы сразу',
    weeks: 1,
    from: 25,
    to: 38,
    goals: [
      'Все шрифты ≥ 12 px, шкала из 6 ступеней',
      'Убрать debug-кнопку LVL+8 и дев-подписи',
      'Вынести все строки в ru.json, убрать M1…M14 и ссылки на ТЗ из UI',
      'Исправить опечатки, один язык интерфейса',
      'Убрать Date.now() из сида, подключить seedrandom',
      'Prettier + ESLint + noUnusedLocals, удалить мёртвый код',
    ],
    cats: ['typo', 'tone', 'quality'],
  },
  {
    n: 1,
    title: 'Архитектура и стек по ТЗ',
    weeks: 2,
    from: 38,
    to: 52,
    goals: [
      'Решение по Phaser 3 vs 4 (рекомендация — Phaser 3.80 + rexUI)',
      'Разбить ArenaScene на 8 компонентов-контейнеров',
      'Zustand-стор с селекторами, сохранение с версией',
      'Layout-движок: якоря, safe-area, Scale.RESIZE',
      'CandleChart на Graphics: свечи, объём, зоны-улики',
      'Убрать arcade physics, добавить asset-манифест',
    ],
    cats: ['stack', 'arch'],
  },
  {
    n: 2,
    title: 'Мобильный UX, типографика, анимации',
    weeks: 2,
    from: 52,
    to: 66,
    goals: [
      'Touch-цели 44 pt, состояния кнопок, haptics',
      'Переходы сцен, stagger блоков, твины кнопок, партиклы победы',
      'Счётчики XP/SIG тикают, бюджет анимирован',
      'Кнопка «развернуть» для текстовых блоков Академии',
      'Loading / empty / error состояния',
      'Звук: 8 базовых SFX через Phaser Sound',
    ],
    cats: ['mobile', 'typo', 'motion', 'visual'],
  },
  {
    n: 3,
    title: 'Механики без заглушек и педагогика',
    weeks: 3,
    from: 66,
    to: 78,
    goals: [
      'M2 стек, M6 доигрывание, M8 комбо, M13 погода → мутации',
      'Объяснение после каждого ответа: где улика, почему ловушка',
      'Интервальное повторение из свитка ошибок',
      'Карта кампании и прогресс по навыкам',
      'Симуляция баланса 1000 партий, правка XP/SIG',
      'Глоссарий и дисклеймер',
    ],
    cats: ['mech', 'learn'],
  },
  {
    n: 4,
    title: 'Мост клиент → сервер',
    weeks: 2,
    from: 78,
    to: 87,
    goals: [
      'ApiClient + общий пакет типов',
      'Гостевая авторизация → аккаунт → кошелёк по желанию',
      'Сид и скоринг на сервере (античит)',
      'Тень арены — реальная агрегация, WS для турниров',
      'Офлайн-очередь и синхронизация',
      'OpenAPI, rate-limit, Docker',
    ],
    cats: ['backend'],
  },
  {
    n: 5,
    title: 'Тесты, CI, производительность',
    weeks: 2,
    from: 87,
    to: 94,
    goals: [
      'Vitest: engine, scoring, детерминизм — покрытие 70 %',
      'Playwright: первая задача, смена эпохи, навигация',
      'GitHub Actions: lint + typecheck + test + build + preview',
      'Атлас текстур, пулы объектов, Graphics вместо Rectangle',
      'Профилирование на бюджетном Android, 60 fps',
      'Lighthouse ≥ 90',
    ],
    cats: ['test', 'perf'],
  },
  {
    n: 6,
    title: 'Релиз: PWA, доступность, полировка',
    weeks: 1,
    from: 94,
    to: 99,
    goals: [
      'PWA manifest, иконки, установка, офлайн',
      'Reduce-motion, масштаб текста, DOM-зеркало для скринридера',
      'Аналитика, crash-репорты, версия в настройках',
      'Политика, GDPR, дисклеймер о рисках',
      'Арт 33 врагов и трофеев по референсам',
      'Финальная вычитка текстов',
    ],
    cats: ['release', 'visual', 'tone'],
  },
];

export const archBefore = [
  'ArenaScene.ts ≈ 1 000 строк в одну строку',
  'create() вызывает 10 методов, каждый рисует rectangle/text по магическим координатам',
  'Обновление = рисуем новый объект поверх старого',
  'zoneList дублируется в 5 ветках if/else',
  'Данные новостей, процентов и свечей — хардкод внутри сцены',
  'Debug-панель и дев-подписи в проде',
];

export const archAfter = [
  'ArenaScene ≈ 150 строк: собирает контейнеры и подписывается на стор',
  'components/: TopBar, WeatherStrip, QuestionCard, SourceBrowser, EvidenceStrip, CardHand, AnswerGrid, ResultOverlay',
  'Каждый компонент: mount(data) / update(data) / destroy()',
  'Layout: anchor + safe-area + шкала отступов 4/8/12/16/24',
  'Данные приходят из EncounterInstance и ApiClient, сцена ничего не выдумывает',
  'DebugPlugin подключается только при import.meta.env.DEV',
];

export const learningLoop = [
  { step: 'Разминка', desc: '3 быстрых повтора из свитка ошибок (SRS: 1 → 3 → 7 дней)', icon: '🔁' },
  { step: 'Урок', desc: 'Микроурок ≤ 90 сек с кнопкой «развернуть» и одной картой-навыком', icon: '📖' },
  { step: 'Задача', desc: 'Улика → стек/ответ → ставка. Всё в 4 шага с индикатором 1/4', icon: '🎯' },
  { step: 'Разбор', desc: 'Где была улика, почему ловушка сработала, как ответили другие', icon: '🔍' },
  { step: 'Награда', desc: 'XP тикает, трофей эволюционирует, серия растёт, цель дня закрывается', icon: '🏆' },
];
