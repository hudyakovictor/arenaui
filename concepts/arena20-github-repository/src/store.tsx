import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

export type Tab = "arena" | "academy" | "bestiary" | "market" | "tournaments";

type State = {
  xp: number;
  level: number;
  coins: number;
  streak: number;
  deposit: number; // mock deposit in USDT
  wins: number;
  fights: number;
  owned: Set<string>;
  revealed: Set<string>; // enemy ids revealed via battle
};

type Store = State & {
  addXp: (n: number) => void;
  addCoins: (n: number) => void;
  spend: (n: number) => boolean;
  applyPnl: (pct: number) => void;
  recordFight: (win: boolean) => void;
  own: (id: string) => void;
  reveal: (id: string) => void;
  toast: (msg: string, tone?: "acid" | "bad" | "gold") => void;
  toastState: { msg: string | null; tone: "acid" | "bad" | "gold" };
};

const Ctx = createContext<Store | null>(null);

export const xpForLevel = (lvl: number) => 400 + lvl * 120;

export function GameProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>({
    xp: 310,
    level: 12,
    coins: 640,
    streak: 6,
    deposit: 10000,
    wins: 27,
    fights: 41,
    owned: new Set(["s5"]),
    revealed: new Set(),
  });
  const [toastState, setToast] = useState<{ msg: string | null; tone: "acid" | "bad" | "gold" }>({ msg: null, tone: "acid" });
  const timer = useRef<number | null>(null);

  const toast = useCallback((msg: string, tone: "acid" | "bad" | "gold" = "acid") => {
    setToast({ msg, tone });
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast({ msg: null, tone }), 2200);
  }, []);

  const addXp = useCallback((n: number) => {
    setS((p) => {
      let xp = p.xp + n;
      let level = p.level;
      while (xp >= xpForLevel(level)) {
        xp -= xpForLevel(level);
        level += 1;
      }
      return { ...p, xp, level };
    });
  }, []);

  const addCoins = useCallback((n: number) => setS((p) => ({ ...p, coins: p.coins + n })), []);
  const spend = useCallback(
    (n: number) => {
      if (s.coins < n) return false;
      setS((p) => ({ ...p, coins: p.coins - n }));
      return true;
    },
    [s.coins]
  );
  const applyPnl = useCallback((pct: number) => setS((p) => ({ ...p, deposit: Math.max(0, Math.round(p.deposit * (1 + pct / 100))) })), []);
  const recordFight = useCallback(
    (win: boolean) => setS((p) => ({ ...p, fights: p.fights + 1, wins: p.wins + (win ? 1 : 0), streak: win ? p.streak + 1 : 0 })),
    []
  );
  const own = useCallback((id: string) => setS((p) => ({ ...p, owned: new Set([...p.owned, id]) })), []);
  const reveal = useCallback((id: string) => setS((p) => ({ ...p, revealed: new Set([...p.revealed, id]) })), []);

  const value = useMemo<Store>(
    () => ({ ...s, addXp, addCoins, spend, applyPnl, recordFight, own, reveal, toast, toastState }),
    [s, addXp, addCoins, spend, applyPnl, recordFight, own, reveal, toast, toastState]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGame() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGame outside provider");
  return c;
}
