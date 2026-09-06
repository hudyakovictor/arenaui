export type Severity = "critical" | "high" | "medium";

export interface Category {
  id: string;
  name: string;
  short: string;
  factors: number;
  now: number;
  target: number;
  icon: string;
}

export interface Finding {
  id: string;
  cat: string;
  severity: Severity;
  title: string;
  evidence: string;
  code?: string;
  fix: string;
  gain: number;
  effort: "S" | "M" | "L";
  sprint: 1 | 2 | 3 | 4;
}

export const BASE_SCORE = 25;
export const TARGET_SCORE = 99;
export const TOTAL_FACTORS = 350;

export const categories: Category[] = [
  { id: "read", name: "Читаемость и типографика", short: "Типографика", factors: 40, now: 15, target: 99, icon: "Aa" },
  { id: "touch", name: "Мобильная эргономика (тач)", short: "Тач-зоны", factors: 35, now: 22, target: 98, icon: "☝" },
  { id: "copy", name: "Тексты и тон коммуникации", short: "Копирайт", factors: 30, now: 24, target: 99, icon: "¶" },
  { id: "arch", name: "Архитектура клиента", short: "Архитектура", factors: 45, now: 28, target: 98, icon: "⌬" },
  { id: "perf", name: "Производительность и память", short: "Перформанс", factors: 30, now: 35, target: 99, icon: "⚡" },
  { id: "anim", name: "Анимации и отклик интерфейса", short: "Анимации", factors: 30, now: 15, target: 97, icon: "◐" },
  { id: "stack", name: "Соответствие ТЗ и стеку", short: "Стек по ТЗ", factors: 35, now: 28, target: 100, icon: "☑" },
  { id: "data", name: "Данные и детерминизм", short: "Данные", factors: 25, now: 40, target: 99, icon: "#" },
  { id: "back", name: "Backend и интеграция", short: "Backend", factors: 35, now: 32, target: 98, icon: "⇄" },
  { id: "qa", name: "Тесты, линт, CI", short: "Качество", factors: 25, now: 5, target: 99, icon: "✓" },
  { id: "sec", name: "Безопасность", short: "Безопасность", factors: 10, now: 38, target: 100, icon: "⚿" },
  { id: "rel", name: "Релиз: PWA, офлайн, бюджеты", short: "Релиз", factors: 10, now: 25, target: 99, icon: "⇪" },
];

export const findings: Finding[] = [
  // ─── Читаемость ───
  {
    id: "R1", cat: "read", severity: "critical", gain: 5, effort: "M", sprint: 1,
    title: "Шрифты 6–9px по всей Арене — текст физически нечитаем на телефоне",
    evidence: "В ArenaScene.ts `fontSize:'7px'` встречается более 60 раз; вкладки, улики, погода, подсказки, навигация — всё 6–8px при холсте 390pt.",
    code: "this.add.text(50,50, `УР.${p.level} · …`, { ...FONT_MONO, fontSize:'7px' })\nthis.add.text(cx+8, cy+32, 'УЛИКА', { fontSize:'6px' })",
    fix: "Ввести типографическую шкалу: 12 / 14 / 16 / 20 / 28 px. Минимум 12px для подписей, 14–16px для тела, 20+ для заголовков. Единый модуль `ui/typography.ts` — никаких inline-размеров.",
  },
  {
    id: "R2", cat: "read", severity: "high", gain: 2, effort: "S", sprint: 1,
    title: "Моноширинный шрифт используется как основной текстовый",
    evidence: "FONT_MONO применён к подписям, кнопкам, объяснениям. Моно уместен для цифр и тикеров, но в мелком кегле резко теряет читаемость.",
    fix: "Inter — для всего текста и кнопок; JetBrains/IBM Plex Mono — только для цен, процентов, seed и тикеров. Роли шрифтов зафиксировать в токенах.",
  },
  {
    id: "R3", cat: "read", severity: "high", gain: 1.5, effort: "M", sprint: 2,
    title: "Магические координаты вместо сетки отступов",
    evidence: "Позиции заданы числами: `ey=354`, `ay=470+row*66`, `by=660`, `rewardY=430`. Любое изменение высоты блока ломает всё ниже.",
    fix: "Layout-токены 4/8/12/16/24/32 и вертикальный flow-контейнер (rexUI Sizer или собственный Stack). Блоки сами вычисляют позицию следующего.",
  },

  // ─── Тач ───
  {
    id: "T1", cat: "touch", severity: "critical", gain: 4, effort: "M", sprint: 1,
    title: "Тап-зоны 14–18px высотой — в 3 раза меньше стандарта",
    evidence: "Строки улик — 14px, чипы — 16px, полоса погоды — 18px, вкладки — 28px. Apple HIG требует 44pt, Material — 48dp. Промахи гарантированы.",
    code: "this.add.rectangle(x+10, zzY, w-20, 14, …).setInteractive()",
    fix: "Минимальная интерактивная область 44×44. Визуал может быть меньше, но hit-area расширяется через `setInteractive(new Phaser.Geom.Rectangle(...))`. Проверка правилом в линтере-обёртке `tappable()`.",
  },
  {
    id: "T2", cat: "touch", severity: "high", gain: 3, effort: "L", sprint: 2,
    title: "9 блоков на одном экране без скролла — перегруз",
    evidence: "TopBar, погода, вопрос, угроза, браузер источников, улики, карты, ответы 2×2, ставка, навигация — всё одновременно на 844pt. ТЗ прямо просит кнопку «развернуть».",
    fix: "Фокус на одном действии за раз: браузер источников раскрывается на весь экран, ответы — отдельный шаг. Панели сворачиваются в чипы-сводки. Кнопка «⤢ развернуть» на графике и ленте.",
  },
  {
    id: "T3", cat: "touch", severity: "medium", gain: 1, effort: "M", sprint: 3,
    title: "Жёсткие 390×844 + Scale.FIT: чёрные полосы и игнор safe-area",
    evidence: "На экранах 19.5:9 / 20:9 и планшетах появляется леттербоксинг; нижняя навигация уходит под home-indicator iOS.",
    fix: "Scale.RESIZE с якорями (top/bottom bars привязаны к краям), учёт `env(safe-area-inset-*)`, тест на 5 популярных вьюпортах в Playwright.",
  },

  // ─── Копирайт ───
  {
    id: "C1", cat: "copy", severity: "critical", gain: 4, effort: "M", sprint: 1,
    title: "Внутренние метки спецификации показаны игроку",
    evidence: "«M1: выбери улику», «M3 СТАВКА УВЕРЕННОСТИ», «M5 ОПОЗНАНИЕ ВРАГА», «M14 ТЕНЬ АРЕНЫ», «ТЗ Часть 3», «Component Contract», «силуэт 5–8% rim», «атомы C2.3» — это язык документации, а не игры.",
    code: "'стадия взрослеет без новых экранов — только состояния блоков (ТЗ Часть 3)'",
    fix: "Все строки — в `i18n/ru.json` с человеческими формулировками по стиль_тон.txt. Метки M1–M15 остаются только в комментариях кода и телеметрии.",
  },
  {
    id: "C2", cat: "copy", severity: "high", gain: 1.5, effort: "S", sprint: 1,
    title: "Смесь языков и регистров в одном экране",
    evidence: "«UNKNOWN THREAT», «BUDGET = 0», «DRAWDOWN LEVIATHAN», «SEED 48213» соседствуют с «ПОГОДА: ТРЕНД». КАПС везде — усталость глаз.",
    fix: "Одна локаль на экран, КАПС только для заголовков-ярлыков. Английские термины — там, где это индустриальный стандарт (R:R, ATR, OI) — с подсказкой при первом появлении.",
  },
  {
    id: "C3", cat: "copy", severity: "medium", gain: 0.5, effort: "S", sprint: 1,
    title: "Опечатки и заглушки в продакшен-тексте",
    evidence: "«СБЫТИЕ С БЮДЖЕТОМ», «ПАМP» (латинская P), «— будет нижняя кнопка», «тапни портрет — после ответа».",
    fix: "Spell-check (cspell + русский словарь) в CI, вычитка редактором перед каждым релизом.",
  },

  // ─── Архитектура ───
  {
    id: "A1", cat: "arch", severity: "critical", gain: 5, effort: "L", sprint: 2,
    title: "ArenaScene — god-object на ~1000 строк, записанный одной строкой",
    evidence: "Рендер, бизнес-логика, скоринг, фидбек, оверлеи, навигация — всё в одном классе. Файлы ArenaScene.ts, GameState.ts, http/index.ts не отформатированы (одна строка), diff-ревью невозможно.",
    fix: "Разбить на компоненты: TopBar, WeatherStrip, SourceBrowser, EvidenceStrip, CardHand, AnswerGrid, ConfidencePicker, FeedbackOverlay. Сцена — только композиция. Prettier + ESLint обязательны (pre-commit).",
  },
  {
    id: "A2", cat: "arch", severity: "high", gain: 2.5, effort: "M", sprint: 2,
    title: "Любое изменение состояния = scene.restart()",
    evidence: "После ответа, смены стадии, Левиафана вызывается полный перезапуск сцены — мигание, потеря контекста, невозможность анимировать переход.",
    fix: "Реактивный стор (Zustand vanilla, как в ТЗ) + подписки компонентов через `subscribe(selector)`. Меняется только затронутый блок.",
  },
  {
    id: "A3", cat: "arch", severity: "high", gain: 1, effort: "S", sprint: 1,
    title: "Dev-инструменты и мёртвый код в продакшене",
    evidence: "Кнопка «LVL+8» (createDebugStageSwitcher) видна игроку; `refreshActionButton()` — пустой метод с комментарием; `comboId` считается и выбрасывается.",
    code: "private refreshActionButton(){ const need = …; const btnY=700; // будет нижняя кнопка }",
    fix: "Dev-панель только под `import.meta.env.DEV`, удалить мёртвые ветки, включить `noUnusedLocals` в tsconfig.",
  },
  {
    id: "A4", cat: "arch", severity: "medium", gain: 1, effort: "M", sprint: 3,
    title: "Мок-данные захардкожены внутри рендера",
    evidence: "Новости («Кит скупил 12 000 BTC»), стакан, позиция, распределение «тени арены» [12,58,22,8] — константы в методах отрисовки, не зависят от seed и врага.",
    fix: "Перенести в генератор сценариев (`engine/scenario-gen`) — источники строятся из шаблона и seed, как и улики.",
  },

  // ─── Перформанс ───
  {
    id: "P1", cat: "perf", severity: "critical", gain: 3, effort: "S", sprint: 2,
    title: "Утечка GameObjects: «стирание» рисованием поверх",
    evidence: "refreshEvidenceStrip() при каждом тапе создаёт новый Rectangle и Text поверх старых. За 50 тапов — сотни лишних объектов в display list.",
    code: "// стираем область\nthis.add.rectangle(58,ey+1,160,16, this.COLORS.surface).setOrigin(0);\nthis.add.text(58,ey+5, chips.slice(0,32), …)",
    fix: "Хранить ссылки на объекты и обновлять их (`setText`, `setFillStyle`), для списков — пул или контейнер с `removeAll(true)`. Метрика: `scene.children.length` стабилен в тесте.",
  },
  {
    id: "P2", cat: "perf", severity: "high", gain: 2, effort: "M", sprint: 2,
    title: "График — десятки Rectangle вместо одного Graphics",
    evidence: "ТЗ требует кастомный CandleChart на Graphics. Сейчас `fakeCandles()` рисует по 2–4 объекта на свечу плюс отдельные hit-зоны.",
    fix: "Компонент `CandleChart extends Phaser.GameObjects.Graphics` с redraw по dirty-флагу, hit-test по индексу свечи из координаты X, зум/пан жестами.",
  },
  {
    id: "P3", cat: "perf", severity: "medium", gain: 0.5, effort: "S", sprint: 4,
    title: "Нет атласов и ленивой загрузки",
    evidence: "12 сцен и все ассеты — в одном бандле; иконки грузятся отдельными файлами.",
    fix: "Texture atlas (free-tex-packer), динамический `import()` редких сцен (Турнир, Магазин), бюджет бандла ≤ 1.5 MB gzip.",
  },

  // ─── Анимации ───
  {
    id: "AN1", cat: "anim", severity: "critical", gain: 4, effort: "M", sprint: 2,
    title: "Интерфейс не «живёт»: ни одного tween",
    evidence: "Единственный отклик — camera.flash / camera.shake. Ни выбор карты, ни появление оверлея, ни переход между сценами не анимированы, хотя ТЗ ставит интерактив и анимации в приоритет.",
    fix: "Библиотека микро-анимаций: tap → scale 0.96/120ms, появление панели → slide+fade 240ms Cubic.Out, счётчики XP/SIG — tween чисел, смена сцены — shared fade 180ms. Единый `motion.ts` с длительностями.",
  },
  {
    id: "AN2", cat: "anim", severity: "high", gain: 2, effort: "M", sprint: 2,
    title: "«Проигрыш вперёд» не проигрывается",
    evidence: "Ключевая обучающая механика (график доигрывает 6 свечей после ответа) реализована статичными strokeRect без движения.",
    fix: "Свечи появляются последовательно (6 × 200ms) с ростом тела от 0, линия «твой вход» и «верный вход» подсвечиваются, разница результата считается на глазах.",
  },
  {
    id: "AN3", cat: "anim", severity: "medium", gain: 1, effort: "S", sprint: 4,
    title: "Нет звука и haptics",
    evidence: "Phaser Sound заявлен в ТЗ, но в проекте нет ни одного аудиофайла и вызова `navigator.vibrate`.",
    fix: "5 базовых SFX (tap, верно, неверно, награда, смена стадии) + вибрация 10/30ms. Тумблер в настройках.",
  },

  // ─── Стек ───
  {
    id: "S1", cat: "stack", severity: "critical", gain: 3, effort: "M", sprint: 3,
    title: "Phaser ^4.2.1 вместо Phaser 3 из ТЗ",
    evidence: "package.json: единственная зависимость `phaser: ^4.2.1`. rexUI, ключевая UI-библиотека по ТЗ, стабильно работает только с Phaser 3.",
    fix: "Либо зафиксировать `phaser@3.80.x` + `phaser3-rex-plugins`, либо письменно согласовать смену стека с заказчиком. Решение — в первую неделю спринта 3.",
  },
  {
    id: "S2", cat: "stack", severity: "high", gain: 3, effort: "M", sprint: 3,
    title: "6 из 8 пунктов стека отсутствуют",
    evidence: "Нет rexUI, Zustand, seedrandom, vite-plugin-pwa, Vitest, Playwright. Оценка «соответствие ТЗ» проседает автоматически.",
    fix: "Установить и реально задействовать: Zustand — стор, seedrandom — RNG, rexUI — списки/табы/слайдеры, Vitest — движок, Playwright — флоу, PWA — офлайн.",
  },
  {
    id: "S3", cat: "stack", severity: "medium", gain: 1, effort: "S", sprint: 1,
    title: "Нет ESLint / Prettier / EditorConfig / pre-commit",
    evidence: "Отсюда — файлы одной строкой, `as any`, неиспользуемые переменные.",
    fix: "eslint (typescript-eslint strict) + prettier + husky + lint-staged. Форматирование всего репозитория одним коммитом.",
  },

  // ─── Данные ───
  {
    id: "D1", cat: "data", severity: "high", gain: 2.5, effort: "S", sprint: 3,
    title: "Seed зависит от Date.now() — «детерминированный движок» не детерминирован",
    evidence: "Повторить задачу, воспроизвести баг или сверить ответ с сервером невозможно.",
    code: "const seed = (this.progress.level*100000 + this.progress.xp + Date.now())>>>0;",
    fix: "seed = hash(userId, level, taskIndex) — на бэкенде уже есть `deterministicSeed()`. Клиент получает seed с сервера, офлайн — из seedrandom по тем же аргументам.",
  },
  {
    id: "D2", cat: "data", severity: "medium", gain: 1.5, effort: "M", sprint: 3,
    title: "Прогресс живёт только в localStorage со стартом «уровень 4»",
    evidence: "defaultProgress(): level 4, xp 680, coins 1240, streak 2 — новый игрок начинает с середины. Нет схемы миграции при смене формата.",
    fix: "Источник правды — сервер (/api/v1/progress), локально — кэш с версией схемы и миграциями. Новый игрок стартует с уровня 1 после онбординга.",
  },

  // ─── Backend ───
  {
    id: "B1", cat: "back", severity: "critical", gain: 4, effort: "L", sprint: 3,
    title: "Клиент не подключён к API — 36 роутов простаивают",
    evidence: "README: «мост клиент→API — следующий шаг». Вся игра работает на моках, серверная валидация ответов не используется.",
    fix: "`api/client.ts` с типами, выведенными из Zod-схем бэкенда. Спринт 3: auth, progress, task/next, task/submit, error-journal. WS — для «тени арены».",
  },
  {
    id: "B2", cat: "back", severity: "high", gain: 1.5, effort: "M", sprint: 3,
    title: "Документация говорит Fastify, код — Web-standard handlers",
    evidence: "http/index.ts использует `Response.json`, `ctx.params: Promise<T>` — сигнатуры Next.js Route Handlers, а не Fastify-плагинов.",
    fix: "Выбрать один рантайм и привести README к коду. Если Fastify — обернуть handlers адаптером, если Next/Hono — переписать README и скрипты запуска.",
  },
  {
    id: "B3", cat: "back", severity: "medium", gain: 1, effort: "S", sprint: 4,
    title: "Rate-limit в памяти процесса, ETag без версии",
    evidence: "`buckets = new Map()` теряется при рестарте и не масштабируется; ETag не учитывает версию контента.",
    fix: "LRU с TTL или таблица в SQLite; в ETag добавить `contentVersion`; заголовок `X-Api-Version`.",
  },

  // ─── QA ───
  {
    id: "Q1", cat: "qa", severity: "critical", gain: 4.5, effort: "L", sprint: 3,
    title: "0 тестов, 0 CI",
    evidence: "В phaser/ нет ни одного *.test.ts, нет GitHub Actions. ТЗ требует Vitest + Playwright.",
    fix: "Vitest: scoring, mutator, rng, progress — покрытие ≥ 80%. Playwright: онбординг → задача → фидбек → академия (5 smoke-флоу, 3 вьюпорта). CI: lint + typecheck + test + build на каждый PR.",
  },
  {
    id: "Q2", cat: "qa", severity: "high", gain: 1.5, effort: "S", sprint: 1,
    title: "Типизация обходится через `as any`",
    evidence: "`(balanceConfig.sequence.slotsInStage as any)[this.progress.stage as any]` — компилятор отключён в самых важных местах баланса.",
    fix: "`strict: true`, тип `StageId = 'street'|'cabinet'|'terminal'|'system'`, `Record<StageId, number>` в конфиге. Ноль `any` в src/.",
  },

  // ─── Безопасность ───
  {
    id: "SEC1", cat: "sec", severity: "high", gain: 1.5, effort: "S", sprint: 4,
    title: "JWT с дефолтным секретом и TTL 90 дней",
    evidence: "`process.env.JWT_SECRET ?? 'signal-arena-dev-secret-change-me'` — сервер молча стартует с известным ключом.",
    fix: "Fail-fast при отсутствии секрета в production, access-токен 15 мин + refresh 7 дней, ротация.",
  },
  {
    id: "SEC2", cat: "sec", severity: "medium", gain: 0.5, effort: "S", sprint: 4,
    title: "Нет CORS-allowlist и проверки origin у WebSocket",
    evidence: "Любой сайт может открыть WS-соединение с токеном пользователя.",
    fix: "CORS allowlist из env, проверка `Origin` при upgrade, helmet-заголовки.",
  },

  // ─── Релиз ───
  {
    id: "REL1", cat: "rel", severity: "high", gain: 2.5, effort: "M", sprint: 4,
    title: "Нет PWA: манифест, service worker, офлайн, иконки",
    evidence: "vite-plugin-pwa из ТЗ не подключён; игру нельзя установить на домашний экран.",
    fix: "vite-plugin-pwa с precache ассетов и офлайн-режимом для разминки дня; иконки 192/512, splash, `display: standalone`.",
  },
  {
    id: "REL2", cat: "rel", severity: "medium", gain: 1.5, effort: "S", sprint: 4,
    title: "Нет бюджетов качества и метрик",
    evidence: "Не измеряются: размер бандла, FPS на среднем Android, время до первого экрана, Lighthouse.",
    fix: "Бюджеты в CI: bundle ≤ 1.5 MB gzip, LCP ≤ 2.5s, 60 fps на Pixel 4a; Lighthouse PWA ≥ 90.",
  },
];

export const copyBeforeAfter = [
  { before: "M1: выбери улику в источнике, затем ответ — иначе неполная награда", after: "Сначала найди доказательство на графике — без него ответ засчитается лишь наполовину" },
  { before: "M3 СТАВКА УВЕРЕННОСТИ — как уверен?", after: "Насколько ты уверен?" },
  { before: "M5 ОПОЗНАНИЕ ВРАГА — кто это был?", after: "Кто тебя ждал на этом графике?" },
  { before: "UNKNOWN THREAT · Враг раскроется после решения · M5", after: "Неизвестный противник — раскроется после твоего решения" },
  { before: "M14 ТЕНЬ АРЕНЫ — как ответили другие", after: "Как решили другие игроки" },
  { before: "стадия взрослеет без новых экранов — только состояния блоков (ТЗ Часть 3)", after: "Новая стадия. Подсказок меньше — доверия к тебе больше." },
  { before: "BUDGET = 0 · DRAWDOWN LEVIATHAN · СБЫТИЕ С БЮДЖЕТОМ", after: "Бюджет риска исчерпан. Разберём, где ушли деньги — и вернём 40 в запас." },
  { before: "силуэт 5–8% rim", after: "(удалить — это заметка для художника)" },
];

export const stackTable = [
  { item: "Phaser 3 + TypeScript + Vite", status: "partial", note: "Стоит Phaser ^4.2.1 — не то, что в ТЗ" },
  { item: "rexUI (панели, вкладки, списки)", status: "no", note: "Не установлен, UI собран вручную" },
  { item: "Кастомный CandleChart на Graphics", status: "no", note: "Свечи — набор Rectangle" },
  { item: "Zustand (стор без React)", status: "no", note: "Свой класс GameState на localStorage" },
  { item: "seedrandom + scenario-gen", status: "partial", note: "Свой rng есть, seed недетерминирован" },
  { item: "Fastify + SQLite + Drizzle + Zod + WS", status: "partial", note: "Zod/SQLite есть, handlers — не Fastify" },
  { item: "Phaser Sound", status: "no", note: "Ни одного звука" },
  { item: "vite-plugin-pwa", status: "no", note: "Нет манифеста и SW" },
  { item: "Vitest + Playwright", status: "no", note: "0 тестов" },
];

export interface Sprint {
  n: 1 | 2 | 3 | 4;
  name: string;
  weeks: string;
  goal: string;
  score: number;
  deliverables: string[];
}

export const sprints: Sprint[] = [
  {
    n: 1, name: "Читаемость и честность", weeks: "Нед. 1–2", score: 55,
    goal: "Игру можно читать и в неё можно попасть пальцем. Ничего лишнего игроку не показываем.",
    deliverables: ["Типографическая шкала 12–28px", "Тап-зоны ≥ 44px", "Копирайт без M1–M15 и ТЗ-ссылок", "Prettier + ESLint, форматирование репо", "Убрать LVL+8 и мёртвый код", "strict: true, ноль any"],
  },
  {
    n: 2, name: "Архитектура и движение", weeks: "Нед. 3–4", score: 78,
    goal: "Сцена собрана из компонентов, интерфейс отзывается на каждое касание.",
    deliverables: ["ArenaScene → 8 компонентов", "Zustand-стор, без scene.restart()", "motion.ts: tap / panel / scene", "CandleChart на Graphics + «проигрыш вперёд»", "Утечки закрыты, children.length стабилен", "Раскрытие источника на весь экран"],
  },
  {
    n: 3, name: "Стек и связь с сервером", weeks: "Нед. 5–6", score: 92,
    goal: "Всё по ТЗ подключено, ответы валидирует сервер, задачи воспроизводимы.",
    deliverables: ["Решение по Phaser 3 + rexUI", "api/client.ts на Zod-типах", "Seed с сервера, детерминизм", "Vitest на engine ≥ 80%", "Прогресс с сервера, миграции", "README = код (рантайм бэкенда)"],
  },
  {
    n: 4, name: "Полировка и релиз", weeks: "Нед. 7–8", score: 99,
    goal: "Устанавливается, работает офлайн, защищена, измеряется.",
    deliverables: ["PWA: манифест, SW, офлайн-разминка", "Playwright smoke × 3 вьюпорта", "SFX + haptics", "JWT: секрет, TTL, refresh; CORS/WS origin", "Атласы, бюджет бандла, Lighthouse ≥ 90", "Rate-limit с TTL, версия API"],
  },
];

export const dodChecklist = [
  { group: "Читаемость", items: ["Ни одного текста < 12px", "Контраст ≥ 4.5:1 на всех стадиях", "Моно только для чисел"] },
  { group: "Тач", items: ["Все интерактивы ≥ 44×44", "Safe-area учтена", "Нет леттербоксинга на 20:9"] },
  { group: "Тексты", items: ["0 строк с M1–M15 / ТЗ", "Единая локаль экрана", "cspell зелёный"] },
  { group: "Код", items: ["Файл ≤ 300 строк", "0 any, strict: true", "Prettier/ESLint в pre-commit"] },
  { group: "Перформанс", items: ["60 fps на Pixel 4a", "children.length стабилен", "Бандл ≤ 1.5 MB gzip"] },
  { group: "Тесты", items: ["Vitest engine ≥ 80%", "5 Playwright smoke", "CI на каждый PR"] },
  { group: "Сервер", items: ["Ответ валидируется сервером", "Seed детерминирован", "JWT без дефолта"] },
  { group: "Релиз", items: ["Lighthouse PWA ≥ 90", "Офлайн-разминка", "Иконки/splash"] },
];

export function weightedScore(nowKey: "now" | "target"): number {
  const total = categories.reduce((s, c) => s + c.factors * c[nowKey], 0);
  return Math.round(total / TOTAL_FACTORS);
}

export function severityLabel(s: Severity): string {
  return s === "critical" ? "Критично" : s === "high" ? "Важно" : "Средне";
}

export function effortLabel(e: Finding["effort"]): string {
  return e === "S" ? "1–2 дня" : e === "M" ? "3–5 дней" : "1–2 недели";
}
