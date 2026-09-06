// Mini roguelike run simulation used by the playable prototype.
// Pure functions only — no React, no DB.

export type Action = "long" | "short" | "wait" | "hedge";
export type Size = 25 | 50 | 100;
export type CardId = "stop" | "half" | "funding" | "volume" | "patience" | "onchain";

export type Card = {
  id: CardId;
  name: string;
  domain: string;
  color: string;
  desc: string;
};

export const CARDS: Record<CardId, Card> = {
  stop: { id: "stop", name: "СТОП-ЛОСС", domain: "risk", color: "var(--color-risk)", desc: "Убыток не больше 12 хладнокровия. Скучно. Работает." },
  half: { id: "half", name: "ПОЛОВИНА", domain: "risk", color: "var(--color-risk)", desc: "Размер позиции делится на два. Прибыль тоже. Смерть — нет." },
  funding: { id: "funding", name: "ФАНДИНГ", domain: "crypto", color: "var(--color-crypto)", desc: "Открывает вкладку фандинга. Если все в лонге — кто-то платит." },
  volume: { id: "volume", name: "ОБЪЁМ", domain: "technical", color: "var(--color-technical)", desc: "Показывает объём пробоя. Без объёма пробой — это слух." },
  patience: { id: "patience", name: "ТЕРПЕНИЕ", domain: "cognitive", color: "var(--color-cognitive)", desc: "«Ждать» приносит +6 хладнокровия, если это было верно." },
  onchain: { id: "onchain", name: "ОНЧЕЙН", domain: "crypto", color: "var(--color-crypto)", desc: "Показывает движение китов. Кит не покупает — он перекладывается." },
};

export type Enemy = {
  id: string;
  name: string;
  family: string;
  // which action is correct
  best: Action[];
  // hint that appears if the matching card is played
  hints: Partial<Record<CardId, string>>;
  briefing: string;
  reveal: string;
  seed: number;
  fundingVisible: string;
  sentiment: string;
};

export const ENEMIES: Enemy[] = [
  {
    id: "phantom",
    name: "Fake Breakout Phantom",
    family: "ТЕХНИЧЕСКИЙ",
    best: ["wait", "short"],
    hints: { volume: "Объём на пробое −40% к среднему. Пробой без покупателей.", funding: "Фандинг нейтральный. Никто не верит, кроме тебя." },
    briefing: "Цена пробила сопротивление, на которое все смотрели три недели. Чат ликует. Свеча красивая. Слишком.",
    reveal: "Пробой был без объёма. Стадо вошло, кит вышел. Стандартная процедура.",
    seed: 3,
    fundingVisible: "+0.01%",
    sentiment: "ЭЙФОРИЯ 81%",
  },
  {
    id: "goblin",
    name: "Leverage Goblin",
    family: "РИСК",
    best: ["wait", "long"],
    hints: { funding: "Фандинг +0.21%. Лонги переплачивают за право быть ликвидированными.", half: "С половиной позиции ты переживёшь тень. С полной — нет." },
    briefing: "Тренд вверх, всё подтверждено. Гоблин шепчет: «Полный размер. Иначе зачем ты здесь?»",
    reveal: "Направление было верным. Размер — нет. Тень свечи собрала всех, кто вошёл на всё.",
    seed: 11,
    fundingVisible: "+0.21%",
    sentiment: "ЖАДНОСТЬ 74%",
  },
  {
    id: "siren",
    name: "Narrative Siren",
    family: "НАРРАТИВ",
    best: ["wait", "hedge"],
    hints: { onchain: "Кошельки фонда из новости не двигались 9 месяцев. Новость — старая.", funding: "Фандинг подскочил за 4 минуты. Новость уже в цене." },
    briefing: "СРОЧНО: крупный фонд «рассматривает» покупку. Заголовок повторён 40 каналами. Все уже купили.",
    reveal: "Фонд рассматривал. Рассмотрел. Не купил. Ты купил новость, а не актив.",
    seed: 17,
    fundingVisible: "+0.14%",
    sentiment: "ВЕРА 88%",
  },
  {
    id: "kraken",
    name: "Stop-Hunt Kraken",
    family: "ЛИКВИДНОСТЬ",
    best: ["long", "wait"],
    hints: { volume: "Резкая свеча вниз на огромном объёме, и мгновенный откуп. Кто-то собирал стопы.", onchain: "Биржевые резервы падают. Продавать некому." },
    briefing: "Внезапная свеча вниз пробила все очевидные стопы. Паника в чате. Цена уже возвращается.",
    reveal: "Кракен забрал стопы и ушёл. Те, кто продал в панике, дали ликвидность тем, кто ждал.",
    seed: 23,
    fundingVisible: "−0.06%",
    sentiment: "ПАНИКА 67%",
  },
  {
    id: "wraith",
    name: "FOMO Wraith",
    family: "ПСИХОЛОГИЯ",
    best: ["wait"],
    hints: { patience: "Восемь зелёных свечей подряд. Девятая — редко.", funding: "Фандинг +0.3%. Рекорд сезона. Рекорды сезона плохо заканчиваются." },
    briefing: "+38% за день. Все твои знакомые уже там. Ты ещё нет. Это ощущение — и есть враг.",
    reveal: "Ты вошёл на вершине или не вошёл вообще. Второе — это навык. Первое — это статистика.",
    seed: 29,
    fundingVisible: "+0.30%",
    sentiment: "FOMO 93%",
  },
  {
    id: "whale",
    name: "Whale Syndicate",
    family: "ВЛИЯНИЕ · БОСС",
    best: ["short", "hedge"],
    hints: { onchain: "40 000 монет ушли на биржу с кошелька, о котором никто не знал.", volume: "Продажи в стакане прячутся айсбергом. Кит не спешит." },
    briefing: "Босс. Рынок спокоен. Слишком спокоен. Ончейн шумит, чат молчит. Кит принимает решение за тебя.",
    reveal: "Кит выгрузил позицию в тишине. Рынок «пересмотрел» твои жизненные планы на −22%.",
    seed: 37,
    fundingVisible: "+0.05%",
    sentiment: "СПОКОЙСТВИЕ 52%",
  },
];

export type Traits = {
  calibration: number;
  patience: number;
  immunity: number;
  discipline: number;
  antibias: number;
};

export const TRAIT_LABELS: Record<keyof Traits, string> = {
  calibration: "КАЛИБРОВКА",
  patience: "ТЕРПЕНИЕ",
  immunity: "ИММУНИТЕТ К НАРРАТИВАМ",
  discipline: "ДИСЦИПЛИНА РИСКА",
  antibias: "АНТИ-ПРЕДВЗЯТОСТЬ",
};

export type Resolution = {
  correct: boolean;
  composureDelta: number;
  capitalDelta: number; // multiplier delta, e.g. +0.12
  traitDelta: Partial<Traits>;
  verdict: string;
};

export function resolve(
  enemy: Enemy,
  action: Action,
  size: Size,
  played: CardId[],
): Resolution {
  const correct = enemy.best.includes(action);
  const primaryCorrect = enemy.best[0] === action;
  const hasStop = played.includes("stop");
  const hasHalf = played.includes("half");
  const effSize = hasHalf ? size / 2 : size;

  let composureDelta = 0;
  let capitalDelta = 0;
  const traitDelta: Partial<Traits> = {};

  if (action === "wait") {
    if (correct) {
      composureDelta = 6 + (played.includes("patience") ? 6 : 0);
      capitalDelta = primaryCorrect ? 0.04 : 0.02;
      traitDelta.patience = 3;
      traitDelta.calibration = 2;
    } else {
      composureDelta = -4;
      capitalDelta = 0;
      traitDelta.patience = 1;
      traitDelta.calibration = -1;
    }
  } else if (correct) {
    const gain = Math.round(effSize * (primaryCorrect ? 0.28 : 0.16));
    composureDelta = Math.min(20, Math.round(gain / 2));
    capitalDelta = gain / 100;
    traitDelta.calibration = 3;
    if (effSize <= 25) traitDelta.discipline = 2;
    if (enemy.id === "siren" || enemy.id === "wraith") traitDelta.immunity = 3;
  } else {
    const rawLoss = Math.round(effSize * 0.42);
    const loss = hasStop ? Math.min(12, rawLoss) : rawLoss;
    composureDelta = -loss;
    capitalDelta = -loss / 100;
    traitDelta.calibration = -2;
    if (hasStop) traitDelta.discipline = 2;
    if (!hasStop && effSize >= 100) traitDelta.discipline = -3;
    if (enemy.id === "siren" || enemy.id === "wraith") traitDelta.immunity = -3;
    if (enemy.id === "goblin") traitDelta.antibias = -2;
  }

  if (action === "hedge") {
    // hedge dampens both sides
    composureDelta = Math.round(composureDelta * 0.6);
    capitalDelta = capitalDelta * 0.6;
    traitDelta.discipline = (traitDelta.discipline ?? 0) + 1;
  }

  // anti-bias: using an informational card before acting
  if (played.some((c) => c === "funding" || c === "volume" || c === "onchain")) {
    traitDelta.antibias = (traitDelta.antibias ?? 0) + 2;
  }

  const verdict = correct
    ? primaryCorrect
      ? "РЕШЕНИЕ ПРИНЯТО РЫНКОМ. Не привыкай — система уже заметила твою самоуверенность."
      : "ВЫЖИЛ. Не лучший вариант, но рынок сегодня великодушен. Это подозрительно."
    : hasStop
      ? "ОШИБКА ОГРАНИЧЕНА. Стоп-лосс сработал. Скучно. Живой."
      : "РЫНОК ПЕРЕСМОТРЕЛ ТВОИ ПЛАНЫ. Ликвидность зафиксирована. Благодарим за сотрудничество.";

  return { correct, composureDelta, capitalDelta, traitDelta, verdict };
}

export function drawHand(rng: () => number, n = 3): CardId[] {
  const pool: CardId[] = ["stop", "half", "funding", "volume", "patience", "onchain"];
  const out: CardId[] = [];
  while (out.length < n && pool.length) {
    const i = Math.floor(rng() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

export function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildRun(seed: number): Enemy[] {
  const rng = mulberry32(seed);
  const regular = ENEMIES.filter((e) => e.id !== "whale");
  const shuffled = [...regular].sort(() => rng() - 0.5).slice(0, 4);
  return [...shuffled, ENEMIES.find((e) => e.id === "whale")!];
}
