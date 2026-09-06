// Минимальное состояние прогресса (совместимо по полям с phaser/src/state/GameState.ts).
import type { EpochId } from '../ui/palette';

export interface Progress {
  level: number;
  epoch: EpochId;
  xp: number;
  xpMax: number;
  coins: number;
  riskBudget: number;
  maxBudget: number;
  streak: number;
  /** id врага → максимальная стадия. */
  enemyStagesReached: Record<string, number>;
  defeated: string[];
  cardsOwned: string[];
}

const KEY = 'signal-arena-kit-v1';

function defaults(): Progress {
  return {
    level: 1, epoch: 'street', xp: 0, xpMax: 100, coins: 40,
    riskBudget: 100, maxBudget: 100, streak: 0,
    enemyStagesReached: {}, defeated: [], cardsOwned: [],
  };
}

class GameStateStore {
  progress: Progress;
  private flags: Record<string, boolean> = {};

  constructor() {
    this.progress = defaults();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.progress = { ...defaults(), ...parsed.progress };
        this.flags = parsed.flags ?? {};
      }
    } catch { /* localStorage недоступен — работаем в памяти */ }
  }

  save(): void {
    try { localStorage.setItem(KEY, JSON.stringify({ progress: this.progress, flags: this.flags })); } catch { /* noop */ }
  }

  getFlag(k: string): boolean { return !!this.flags[k]; }
  setFlag(k: string, v = true): void { this.flags[k] = v; this.save(); }

  setEpoch(e: EpochId): void { this.progress.epoch = e; this.save(); }

  meet(enemyId: string): void {
    const cur = this.progress.enemyStagesReached[enemyId] ?? 0;
    this.progress.enemyStagesReached[enemyId] = Math.max(cur, 1);
    this.save();
  }

  answer(enemyId: string, cardId: string, correct: boolean): { xp: number; coins: number; risk: number } {
    const p = this.progress;
    let d = { xp: 0, coins: 0, risk: 0 };
    if (correct) {
      p.streak += 1;
      d = { xp: 25 + p.streak * 5, coins: 10, risk: +5 };
      if (!p.defeated.includes(enemyId)) p.defeated.push(enemyId);
      if (!p.cardsOwned.includes(cardId)) p.cardsOwned.push(cardId);
    } else {
      p.streak = 0;
      d = { xp: 5, coins: 0, risk: -15 };
    }
    p.xp += d.xp;
    p.coins += d.coins;
    p.riskBudget = Math.max(0, Math.min(p.maxBudget, p.riskBudget + d.risk));
    while (p.xp >= p.xpMax) { p.xp -= p.xpMax; p.level += 1; p.xpMax = Math.round(p.xpMax * 1.25); }
    this.save();
    return d;
  }

  reset(): void { this.progress = defaults(); this.flags = {}; this.save(); }
}

export const gameState = new GameStateStore();
export type GameState = GameStateStore;
