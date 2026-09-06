export type Candle = [number, number, number, number]; // open, high, low, close

export type SourceId = "chart" | "news" | "check" | "blind";
export type CardId = "candle" | "volume" | "trend" | "mind";
export type Direction = "long" | "short" | "flat";
export type StopMode = "level" | "market" | "none";

export type SkillCard = {
  id: CardId;
  label: string;
  domain: string;
  color: string; // tailwind text color
  bg: string; // tailwind bg color
  hint: string;
  locked?: boolean;
};

export const skillCards: SkillCard[] = [
  { id: "candle", label: "Свеча", domain: "Технический", color: "text-sky", bg: "bg-sky", hint: "Читает форму свечи. Не читает твои надежды." },
  { id: "volume", label: "Объём", domain: "Технический", color: "text-acid", bg: "bg-acid", hint: "Показывает, кто на самом деле пришёл на пробой." },
  { id: "trend", label: "Тренд", domain: "Структура", color: "text-cyan", bg: "bg-cyan", hint: "Старший таймфрейм. Он всегда прав. Потом." },
  { id: "mind", label: "Разум", domain: "Когнитивный", color: "text-violet", bg: "bg-violet", hint: "Отделяет новость от шума. Обычно это одно и то же." },
];

export type Clue = {
  id: string;
  source: SourceId; // where it's hidden
  card: CardId; // which card reveals it
  title: string;
  text: string;
  weight: 1; // each clue = 1 confidence
};

export type NewsItem = {
  id: string;
  emoji: string;
  title: string;
  text: string;
  time: string;
  tag: string;
  tagColor: string;
  key?: boolean;
};

export type ChecklistItem = { id: string; label: string; ok: boolean; hidden?: boolean };

export type Scenario = {
  id: string;
  pair: string;
  tf: string;
  headline: string;
  sub: string;
  candles: Candle[];
  future: Candle[];
  level: number; // key level
  volumes: number[]; // per visible candle, 0..1
  clues: Clue[];
  news: NewsItem[];
  checklist: ChecklistItem[];
  enemyId: string;
  correct: Direction;
  feedback: { signal: string; good: string; bad: string };
};

export const scenarios: Scenario[] = [
  {
    id: "fakeout",
    pair: "BTC/USDT",
    tf: "15M",
    headline: "Пробой есть. Объёма нет.",
    sub: "Рынок уже поблагодарил тебя за ликвидность.",
    level: 61,
    candles: [
      [42, 46, 38, 40], [40, 41, 33, 35], [35, 44, 34, 43], [43, 50, 42, 49], [49, 52, 45, 47],
      [47, 58, 46, 57], [57, 62, 55, 61], [61, 63, 52, 54], [54, 56, 47, 49], [49, 51, 42, 44],
      [44, 46, 38, 41], [41, 49, 40, 48], [48, 50, 44, 46], [46, 47, 40, 42], [42, 52, 41, 51],
      [51, 56, 50, 55], [55, 60, 54, 59], [59, 63, 58, 62], [62, 66, 61, 64],
    ],
    future: [
      [64, 65, 60, 61], [61, 62, 57, 58], [58, 59, 52, 53], [53, 55, 48, 50], [50, 52, 46, 47], [47, 49, 44, 45], [45, 48, 44, 47], [47, 49, 45, 46],
    ],
    volumes: [0.6, 0.8, 0.7, 0.9, 0.5, 1.0, 0.8, 0.7, 0.6, 0.5, 0.4, 0.5, 0.4, 0.3, 0.5, 0.4, 0.35, 0.3, 0.22],
    clues: [
      { id: "c1", source: "chart", card: "volume", title: "ОБЪЁМ НИЖЕ СРЕДНЕГО", text: "Пробой на одной свече. Покупателей не пригласили.", weight: 1 },
      { id: "c2", source: "check", card: "trend", title: "РЕТЕСТ НЕ СОСТОЯЛСЯ", text: "Уровень пробит, но никто не вернулся его проверить.", weight: 1 },
      { id: "c3", source: "news", card: "mind", title: "ШУМ ВМЕСТО ФАКТА", text: "Инфлюенсер дал прогноз. Его прошлый прогноз — артефакт.", weight: 1 },
    ],
    news: [
      { id: "n1", emoji: "🔁", title: "БИРЖА ЗАМОРОЗИЛА ВЫВОДЫ", text: "«Официально: плановые работы. Неофициально: молитесь.»", time: "2ч", tag: "ПАНИКА", tagColor: "bg-bad text-white" },
      { id: "n2", emoji: "📣", title: "ИНФЛЮЕНСЕР ДАЛ ПРОГНОЗ", text: "«Пробой подтверждён. Цель — луна. Источник — я.»", time: "1ч", tag: "ШУМ", tagColor: "bg-cyan text-ink", key: true },
      { id: "n3", emoji: "🏛️", title: "РЕГУЛЯТОРЫ ОБЕСПОКОЕНЫ", text: "«Рынок делает вид, что удивлён.»", time: "4ч", tag: "ФУНДАМЕНТАЛ", tagColor: "bg-warn text-ink" },
      { id: "n4", emoji: "🐋", title: "КИТ ПЕРЕЛОЖИЛ КОШЕЛЁК", text: "«Мелкие инвесторы уже сервированы.»", time: "6ч", tag: "КИТ", tagColor: "bg-violet text-white" },
    ],
    checklist: [
      { id: "k1", label: "Тренд на старшем ТФ", ok: true },
      { id: "k2", label: "Уровень пробит", ok: true },
      { id: "k3", label: "Объём на пробое", ok: false },
      { id: "k4", label: "Ретест состоялся", ok: false, hidden: true },
    ],
    enemyId: "fakeout",
    correct: "flat",
    feedback: {
      signal: "Уровень пробит на одной свече, объём ниже среднего, ретеста нет.",
      good: "Цена вернулась в диапазон. Ты остался с депозитом и +120 XP. Терпение зачтено.",
      bad: "Цена вернулась в диапазон. Стоп сработал. Рынок благодарит за ликвидность.",
    },
  },
  {
    id: "retest",
    pair: "ETH/USDT",
    tf: "1H",
    headline: "Уровень держит. Толпа не верит.",
    sub: "Это подозрительно. Значит, интересно.",
    level: 40,
    candles: [
      [58, 60, 54, 55], [55, 56, 49, 50], [50, 52, 45, 46], [46, 47, 41, 42], [42, 44, 38, 40],
      [40, 45, 39, 44], [44, 48, 43, 47], [47, 49, 44, 45], [45, 46, 40, 41], [41, 43, 39, 42],
      [42, 47, 41, 46], [46, 50, 45, 49], [49, 51, 46, 47], [47, 48, 41, 42], [42, 44, 40, 43],
      [43, 46, 42, 45], [45, 47, 44, 46], [46, 47, 43, 44], [44, 46, 43, 45],
    ],
    future: [
      [45, 49, 44, 48], [48, 52, 47, 51], [51, 53, 49, 50], [50, 56, 49, 55], [55, 58, 54, 57], [57, 62, 56, 61], [61, 63, 59, 60], [60, 64, 59, 63],
    ],
    volumes: [0.5, 0.7, 0.8, 0.9, 1.0, 0.9, 0.6, 0.4, 0.5, 0.7, 0.8, 0.6, 0.4, 0.5, 0.85, 0.7, 0.5, 0.45, 0.6],
    clues: [
      { id: "c1", source: "chart", card: "candle", title: "ТРИ ХВОСТА ОТ УРОВНЯ", text: "Каждый раз, когда цена касается 40 — её выкупают. Кто-то настойчив.", weight: 1 },
      { id: "c2", source: "chart", card: "volume", title: "ОБЪЁМ НА ОТСКОКЕ", text: "Покупатели пришли на ретест. Продавцы — нет.", weight: 1 },
      { id: "c3", source: "news", card: "mind", title: "ТОЛПА В ШОРТЕ", text: "Фандинг отрицательный. Все уверены. Это и есть сигнал.", weight: 1 },
    ],
    news: [
      { id: "n1", emoji: "📉", title: "ФАНДИНГ УШЁЛ В МИНУС", text: "«Стадо единодушно. Стадо в шорте.»", time: "30м", tag: "ДЕРИВАТИВЫ", tagColor: "bg-violet text-white", key: true },
      { id: "n2", emoji: "🏛️", title: "РЕГУЛЯТОРЫ СНОВА ОБЕСПОКОЕНЫ", text: "«Выяснили, что рынок нельзя закрыть, пока он не обанкротит всех сам.»", time: "3ч", tag: "ФУНДАМЕНТАЛ", tagColor: "bg-warn text-ink" },
      { id: "n3", emoji: "📣", title: "АНАЛИТИК: «ДНО БЛИЗКО»", text: "«Он говорил это 14 раз. Один раз попадёт.»", time: "5ч", tag: "ШУМ", tagColor: "bg-cyan text-ink" },
      { id: "n4", emoji: "🔥", title: "МЕМКОИН ВЫРОС НА 400%", text: "«Ты не спешишь. Просто все уже купили.»", time: "7ч", tag: "FOMO", tagColor: "bg-pink text-white" },
    ],
    checklist: [
      { id: "k1", label: "Тренд на старшем ТФ", ok: false },
      { id: "k2", label: "Уровень удержан ×3", ok: true },
      { id: "k3", label: "Объём на отскоке", ok: true },
      { id: "k4", label: "Толпа против позиции", ok: true, hidden: true },
    ],
    enemyId: "fomo",
    correct: "long",
    feedback: {
      signal: "Уровень 40 удержан трижды на растущем объёме, толпа в шорте.",
      good: "Шорты закрылись по стопам и стали твоим топливом. +140 XP. Не привыкай.",
      bad: "Ты ждал подтверждения. Подтверждение пришло без тебя. Рынок пошёл дальше.",
    },
  },
];

export type Chapter = {
  n: number;
  title: string;
  level: number;
  atoms: number;
  done: number;
  card: string;
  enemy: string;
  quip: string;
};

export const chapters: Chapter[] = [
  { n: 1, title: "Основы рынка и свечей", level: 1, atoms: 6, done: 6, card: "Свеча", enemy: "Призрак Хайпа", quip: "Свеча не врёт. Врёт тот, кто её комментирует." },
  { n: 2, title: "Уровни, объёмы и структура рынка", level: 4, atoms: 7, done: 7, card: "Объём", enemy: "Ложный Пробой", quip: "Пробой без объёма — приглашение на ужин. Ты — блюдо." },
  { n: 3, title: "Индикаторы", level: 8, atoms: 6, done: 5, card: "Тренд", enemy: "Шум", quip: "Индикатор показывает прошлое. Уверенно." },
  { n: 4, title: "Риск-менеджмент", level: 12, atoms: 6, done: 3, card: "Риск", enemy: "Гоблин Плеча", quip: "Стоп ставят до входа. После — уже поздно и дорого." },
  { n: 5, title: "Психология трейдинга", level: 16, atoms: 6, done: 0, card: "Разум", enemy: "FOMO-Культ", quip: "Ты не спешишь. Просто все уже купили." },
  { n: 6, title: "Новости и макро", level: 21, atoms: 6, done: 0, card: "Факт", enemy: "Голем Паники", quip: "Регуляторы обеспокоены. Рынок делает вид, что удивлён." },
  { n: 7, title: "Токеномика", level: 26, atoms: 6, done: 0, card: "Эмиссия", enemy: "Анлок", quip: "Команда получит токены через год. Ты — опыт сейчас." },
  { n: 8, title: "Безопасность", level: 31, atoms: 5, done: 0, card: "Ключ", enemy: "Дрейнер", quip: "Апрув — это доверенность. Ты выдал её незнакомцу." },
  { n: 9, title: "Ончейн-анализ", level: 36, atoms: 6, done: 0, card: "Ончейн", enemy: "Кит", quip: "Кит проснулся. Завтрак подан." },
  { n: 10, title: "Производные инструменты", level: 41, atoms: 6, done: 0, card: "Фандинг", enemy: "Ликвидатор", quip: "Фандинг — это налог на уверенность." },
  { n: 11, title: "Нарративы и гигиена сигналов", level: 46, atoms: 7, done: 0, card: "Нарратив", enemy: "Инфлюенсер", quip: "Платный сигнал бесплатен для того, кто его продал." },
  { n: 12, title: "Дисциплина и рутина", level: 51, atoms: 5, done: 0, card: "Журнал", enemy: "Тильт", quip: "Чек-лист скучный. Ликвидация — нет." },
];

export type LessonAtom = { title: string; body: string[]; quiz?: { q: string; options: string[]; correct: number; why: string } };

export const lessonAtoms: Record<number, LessonAtom[]> = {
  4: [
    {
      title: "Риск на сделку",
      body: [
        "РИСК — ЭТО НЕ ПРОЦЕНТ. ЭТО КОЛИЧЕСТВО ПОПЫТОК.",
        "Если ты рискуешь 1% депозита, у тебя сто ошибок до нуля. Если 25% — четыре. Рынок посчитал за тебя.",
        "Размер позиции считается от стопа, а не от уверенности. Уверенность в расчёты не входит. Она входит в отчёт о ликвидации.",
        "Формула: Позиция = (Депозит × Риск%) ÷ Расстояние до стопа.",
      ],
      quiz: {
        q: "Депозит 1000. Риск 2%. Стоп в 4% от входа. Размер позиции?",
        options: ["500", "250", "1000"],
        correct: 0,
        why: "20 ÷ 0.04 = 500. Плечо здесь не при чём. Оно появится потом — в виде проблемы.",
      },
    },
    {
      title: "Стоп-лосс",
      body: [
        "СТОП СТАВЯТ ДО ВХОДА.",
        "После — уже поздно и дорого. «Без стопа» — это тоже стоп. Он называется «ноль».",
        "Стоп за уровнем — это план. Стоп по рынку — это признание. Отсутствие стопа — это исповедь.",
      ],
      quiz: {
        q: "Цена подошла к стопу. Твои действия?",
        options: ["Отодвинуть стоп", "Дать сработать", "Усредниться"],
        correct: 1,
        why: "Стоп — единственное, что ты контролируешь. Всё остальное контролирует кит, который случайно нажал кнопку.",
      },
    },
    {
      title: "R-множитель",
      body: [
        "1R — ЭТО ТВОЙ РИСК. ВСЁ ОСТАЛЬНОЕ ИЗМЕРЯЕТСЯ В НЁМ.",
        "Сделка с целью 3R и винрейтом 40% — прибыльна. Сделка с целью 0.5R и винрейтом 80% — путь к отчёту.",
        "Матожидание = Винрейт × Средний R прибыли − (1 − Винрейт) × 1.",
      ],
    },
  ],
};

export type Enemy = {
  id: string;
  name: string;
  domain: string;
  domainColor: string;
  emoji: string;
  stage: 0 | 1 | 2 | 3;
  met: number;
  beaten: number;
  counter: string;
  headline: string;
  truth: string;
  hit: string;
  dossier: string[];
};

export const enemies: Enemy[] = [
  {
    id: "fakeout", name: "Ложный Пробой", domain: "Технический", domainColor: "bg-sky text-ink", emoji: "🪤", stage: 2, met: 12, beaten: 9,
    counter: "Объём · Тренд",
    headline: "ПРОБОЙ ЕСТЬ. ОБЪЁМА НЕТ.",
    truth: "Уровень пробит на одной свече без участия покупателей.",
    hit: "Рынок уже поблагодарил тебя за ликвидность.",
    dossier: ["Появляется на важных уровнях в момент, когда все смотрят.", "Слабость: объём ниже среднего и отсутствие ретеста.", "Питается стоп-ордерами. Твоими."],
  },
  {
    id: "ghost", name: "Призрак Хайпа", domain: "Человеческий", domainColor: "bg-pink text-white", emoji: "👻", stage: 3, met: 14, beaten: 11,
    counter: "Свеча · Нарратив",
    headline: "РИСУЕТ ГРАФИК НА СТЕНЕ",
    truth: "Появляется, когда все уже купили. Обещает продолжение.",
    hit: "Продолжения не будет. Он уже ушёл рисовать другой переулок.",
    dossier: ["Живёт в комментариях под графиком.", "Слабость: свеча закрытия. Она не умеет обещать.", "Исчезает вместе с ликвидностью."],
  },
  {
    id: "goblin", name: "Гоблин Плеча", domain: "Риск", domainColor: "bg-bad text-white", emoji: "👺", stage: 2, met: 9, beaten: 5,
    counter: "Риск · Матожидание",
    headline: "ВЫДАЁТ 100x ПОД РОСПИСЬ",
    truth: "Плечо не увеличивает прибыль. Оно ускоряет исход.",
    hit: "Ликвидация завершена успешно. Виноват пользователь.",
    dossier: ["Сидит в настройках позиции. Всегда предлагает «ещё чуть-чуть».", "Слабость: расчёт позиции от стопа.", "Работает в департаменте управляемой паники."],
  },
  {
    id: "golem", name: "Голем Паники", domain: "Контекст", domainColor: "bg-warn text-ink", emoji: "🗿", stage: 1, met: 4, beaten: 1,
    counter: "Факт · Разум",
    headline: "СОБРАН ИЗ ЗАГОЛОВКОВ",
    truth: "Каждая новость — кирпич. Ты — тот, кто пугается.",
    hit: "Мы печатаем панику. Благодарим за сотрудничество.",
    dossier: ["Растёт с каждым «СРОЧНО».", "Слабость: один проверенный факт.", "Регуляторы обеспокоены его существованием."],
  },
  {
    id: "fomo", name: "FOMO-Культ", domain: "Когнитивный", domainColor: "bg-cyan text-ink", emoji: "🕯️", stage: 1, met: 3, beaten: 1,
    counter: "Разум · Журнал",
    headline: "ВСЕ УЖЕ ВНУТРИ",
    truth: "Собрание в 3:00 ночи. Форма одежды — маржинальная.",
    hit: "Ты успел. К раздаче.",
    dossier: ["Ритуал: покупка на вершине под гимн «в этот раз всё иначе».", "Слабость: журнал сделок. Он помнит прошлые собрания.", "Членский взнос — депозит."],
  },
  {
    id: "whale", name: "Кит", domain: "Ончейн", domainColor: "bg-violet text-white", emoji: "🐋", stage: 0, met: 0, beaten: 0,
    counter: "Ончейн",
    headline: "СЛУЧАЙНО НАЖАЛ КНОПКУ",
    truth: "Не двигает рынок. Просто переложил кошелёк.",
    hit: "После этого ты продал квартиру.",
    dossier: ["Не раскрыт. Известно только, что он большой.", "Слабость: неизвестна.", "Ты пока — завтрак."],
  },
  {
    id: "liquidator", name: "Ликвидатор", domain: "Деривативы", domainColor: "bg-orange text-ink", emoji: "⚙️", stage: 0, met: 0, beaten: 0,
    counter: "Фандинг · Риск",
    headline: "ПРОТОКОЛ ПЕРЕРАСПРЕДЕЛЕНИЯ",
    truth: "Служба по перераспределению чужих денег. Работает круглосуточно.",
    hit: "Активы уничтожены, урок усвоен, виноват пользователь.",
    dossier: ["Не раскрыт.", "Слышно только гул двигателя.", "Появляется точно в момент, когда ты убрал стоп."],
  },
  {
    id: "drainer", name: "Дрейнер", domain: "Безопасность", domainColor: "bg-good text-ink", emoji: "🧛", stage: 0, met: 0, beaten: 0,
    counter: "Ключ",
    headline: "ПРОСИТ ТОЛЬКО ПОДПИСЬ",
    truth: "Апрув — это доверенность. Ты выдал её незнакомцу.",
    hit: "Кошелёк пуст. Транзакция успешна.",
    dossier: ["Не раскрыт.", "Маскируется под аирдроп.", "Вежлив. Это подозрительно."],
  },
];

export const leaders = [
  { rank: 1, name: "@crypto_knight", score: 2680, emoji: "🛡️", trend: "up" },
  { rank: 2, name: "@trader_pro", score: 2450, emoji: "🐕", you: true, trend: "up" },
  { rank: 3, name: "@whale_hunter", score: 1500, emoji: "🐋", trend: "down" },
  { rank: 4, name: "@fomo_queen", score: 1060, emoji: "👸", trend: "same" },
  { rank: 5, name: "@stop_loss_enjoyer", score: 940, emoji: "🧯", trend: "up" },
  { rank: 6, name: "@ret_est", score: 870, emoji: "🔁", trend: "down" },
  { rank: 7, name: "@no_leverage", score: 810, emoji: "🧘", trend: "same" },
];

export type Tournament = {
  id: string;
  title: string;
  kind: string;
  endsIn: string;
  players: number;
  prize: string;
  entry: string;
  color: string;
  desc: string;
  joined?: boolean;
};

export const tournaments: Tournament[] = [
  { id: "daily", title: "Ежедневный забег", kind: "DAILY", endsIn: "05:12:40", players: 1284, prize: "1 200 XP · Бейдж", entry: "Бесплатно", color: "bg-acid text-ink", desc: "10 боёв. Один рынок. Все против графика.", joined: true },
  { id: "blind", title: "Кубок слепого источника", kind: "WEEKLY", endsIn: "3д 14ч", players: 412, prize: "5 000 XP · Карта «Нарратив»", entry: "50 монет", color: "bg-violet text-white", desc: "Источники скрыты. Виден только результат. Как в жизни." },
  { id: "storm", title: "Сезон шторма", kind: "SEASON", endsIn: "19д", players: 8930, prize: "Титул · Proof of Skill", entry: "Уровень 10+", color: "bg-bad text-white", desc: "Волатильность временная. Рейтинг — навсегда." },
];

export type ShopItem = {
  id: string;
  name: string;
  kind: "card" | "boost" | "cosmetic";
  price: number;
  desc: string;
  emoji: string;
  owned?: boolean;
  rarity: "common" | "rare" | "epic";
};

export const shopItems: ShopItem[] = [
  { id: "s1", name: "Карта «Факт»", kind: "card", price: 320, desc: "Проверяет новость на наличие смысла. Обычно результат — «нет».", emoji: "📰", rarity: "rare" },
  { id: "s2", name: "Карта «Ончейн»", kind: "card", price: 480, desc: "Видит, что делает кит. Не видит, зачем.", emoji: "⛓️", rarity: "epic" },
  { id: "s3", name: "Второй взгляд", kind: "boost", price: 90, desc: "Один повтор скана источника. Рынок делает вид, что не заметил.", emoji: "👁️", rarity: "common" },
  { id: "s4", name: "Пауза паники", kind: "boost", price: 120, desc: "+15 секунд на решение. Департамент паники против.", emoji: "⏸️", rarity: "common" },
  { id: "s5", name: "Рамка «Выживший»", kind: "cosmetic", price: 200, desc: "Для тех, кто пережил 2022. Или говорит, что пережил.", emoji: "🖼️", rarity: "rare", owned: true },
  { id: "s6", name: "Титул «Не финсовет»", kind: "cosmetic", price: 150, desc: "Юридически безупречно. Морально — как обычно.", emoji: "🏷️", rarity: "common" },
];

export const tickerLines = [
  "РЕГУЛЯТОРЫ ОБЕСПОКОЕНЫ",
  "КИТ СЛУЧАЙНО НАЖАЛ КНОПКУ",
  "ВОЛАТИЛЬНОСТЬ ВРЕМЕННАЯ. ТВОЯ ОШИБКА — НАВСЕГДА",
  "РЫНОК СТАБИЛЕН. ЭТО ПОДОЗРИТЕЛЬНО",
  "НЕ ПОКУПАЙ НАДЕЖДУ. ОНА УЖЕ ПЕРЕОЦЕНЕНА",
  "ИНДЕКС ВЕРЫ В ГРАФИК: 62",
  "ВСЁ ИДЁТ ПО ПЛАНУ. ПЛАН НЕ НАЙДЕН",
];

export const weather = {
  state: "ШТОРМ",
  emoji: "⛈️",
  volatility: 74,
  faith: 62,
  note: "Рынок проверяет твою стратегию. Стратегия подала заявление об увольнении.",
};
