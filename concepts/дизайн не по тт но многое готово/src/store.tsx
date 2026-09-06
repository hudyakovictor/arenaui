import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { levels } from "./data/game";

export type Tab = "arena" | "academy" | "bestiary" | "market" | "tournaments";

export type Mistake = { id: string; levelId: string; enemyId: string; text: string; lesson: string; at: number };

export type State = {
  booted: boolean;
  xp: number;
  coins: number;
  streak: number;
  combo: number;
  bestCombo: number;
  capital: number; // demo deposit
  completed: Record<string, { stars: number; best: number }>;
  enemyStage: Record<string, number>; // 0 silhouette .. 3 trophy
  enemyMet: Record<string, number>;
  enemyBeaten: Record<string, number>;
  cardRank: Record<string, number>;
  mistakes: Mistake[];
  passLevel: number;
  owned: string[];
  quests: Record<string, number>;
  battles: number;
  wins: number;
  cardsUnlocked: string[];
  academyDone: number[];
};

const initial: State = {
  booted: false,
  xp: 0, coins: 500, streak: 3, combo: 0, bestCombo: 0, capital: 10000,
  completed: {}, enemyStage: { "false-breakout": 1 }, enemyMet: { "false-breakout": 1 }, enemyBeaten: {},
  cardRank: { volume: 2, retest: 1, patience: 1, stop: 1, size: 1 },
  mistakes: [], passLevel: 12, owned: [], quests: { q1: 0, q2: 0, q3: 0 }, battles: 0, wins: 0,
  cardsUnlocked: ["volume", "retest", "patience", "stop", "size"], academyDone: [],
};

type Action =
  | { type: "BOOT" }
  | { type: "FINISH_BATTLE"; levelId: string; enemyId: string; win: boolean; xp: number; pnl: number; stars: number; evidence: number; flat: boolean; mistake?: Omit<Mistake, "id" | "at"> }
  | { type: "BUY"; id: string; price: number }
  | { type: "ACADEMY_DONE"; chapter: number; cardId: string }
  | { type: "CLAIM_QUEST"; id: string; reward: number }
  | { type: "RESET" };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "BOOT": return { ...s, booted: true };
    case "FINISH_BATTLE": {
      const stage = Math.min(3, (s.enemyStage[a.enemyId] ?? 0) + (a.win ? 1 : 0.5));
      const prev = s.completed[a.levelId];
      const combo = a.win ? s.combo + 1 : 0;
      const mistakes = a.mistake ? [{ ...a.mistake, id: `${Date.now()}`, at: Date.now() }, ...s.mistakes].slice(0, 20) : s.mistakes;
      return {
        ...s,
        xp: s.xp + a.xp,
        coins: s.coins + Math.round(a.xp / 4),
        combo, bestCombo: Math.max(s.bestCombo, combo),
        capital: Math.max(0, Math.round(s.capital * (1 + a.pnl / 100))),
        completed: { ...s.completed, [a.levelId]: { stars: Math.max(prev?.stars ?? 0, a.stars), best: Math.max(prev?.best ?? 0, a.xp) } },
        enemyStage: { ...s.enemyStage, [a.enemyId]: Math.floor(stage) },
        enemyMet: { ...s.enemyMet, [a.enemyId]: (s.enemyMet[a.enemyId] ?? 0) + 1 },
        enemyBeaten: { ...s.enemyBeaten, [a.enemyId]: (s.enemyBeaten[a.enemyId] ?? 0) + (a.win ? 1 : 0) },
        mistakes,
        passLevel: Math.min(30, s.passLevel + (a.win ? 1 : 0)),
        battles: s.battles + 1, wins: s.wins + (a.win ? 1 : 0),
        quests: {
          ...s.quests,
          q1: Math.min(3, (s.quests.q1 ?? 0) + 1),
          q2: Math.min(2, (s.quests.q2 ?? 0) + (a.evidence >= 2 ? 1 : 0)),
          q3: Math.min(1, (s.quests.q3 ?? 0) + (a.flat && a.win ? 1 : 0)),
        },
      };
    }
    case "BUY":
      if (s.coins < a.price || s.owned.includes(a.id)) return s;
      return { ...s, coins: s.coins - a.price, owned: [...s.owned, a.id] };
    case "ACADEMY_DONE":
      if (s.academyDone.includes(a.chapter)) return s;
      return {
        ...s, xp: s.xp + 60, academyDone: [...s.academyDone, a.chapter],
        cardRank: { ...s.cardRank, [a.cardId]: (s.cardRank[a.cardId] ?? 0) + 1 },
        cardsUnlocked: s.cardsUnlocked.includes(a.cardId) ? s.cardsUnlocked : [...s.cardsUnlocked, a.cardId],
      };
    case "CLAIM_QUEST":
      return { ...s, xp: s.xp + a.reward, quests: { ...s.quests, [a.id]: -1 } };
    case "RESET": return { ...initial, booted: true };
  }
}

const KEY = "signal-arena-v1";
const Ctx = createContext<{ s: State; d: (a: Action) => void } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, initial, (init) => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...init, ...JSON.parse(raw), booted: false };
    } catch { /* ignore */ }
    return init;
  });
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } }, [s]);
  const v = useMemo(() => ({ s, d }), [s]);
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("no store");
  return c;
}

export function levelFromXp(xp: number) {
  const lvl = Math.floor(Math.sqrt(xp / 100)) + 1;
  const cur = (lvl - 1) ** 2 * 100;
  const next = lvl ** 2 * 100;
  return { lvl, cur, next, pct: Math.min(100, ((xp - cur) / (next - cur)) * 100) };
}

export function isLevelUnlocked(s: State, levelId: string) {
  const idx = levels.findIndex((l) => l.id === levelId);
  if (idx <= 0) return true;
  return !!s.completed[levels[idx - 1].id];
}

export function rankTitle(lvl: number) {
  if (lvl >= 8) return "Холодная голова";
  if (lvl >= 5) return "Охотник за стопами";
  if (lvl >= 3) return "Выживший";
  return "Ликвидность";
}
