import { balanceConfig } from '../config/balanceConfig';
import { getEpochForLevel } from '../config/epochConfig';
import type { GameProgress } from '../types';
import { nextSeed } from '../engine/mutator';

const STORAGE_KEY = 'arena_v4_progress';
const FLAGS_KEY = 'arena_v4_flags';
const ARENA_KEY = 'arena_v4_arena';

// Текущая встреча Арены. Переживает scene.restart() (смена вкладок, слепой источник,
// выбор карт) и перезагрузку страницы: задание не меняется до конца встречи (M11).
export interface ArenaSession {
  enemyId: string;
  stage: number;
  seed: number;
  activeSource: string | null;
  blindOpened: boolean;
  selectedEvidence: string[];
  selectedAnswer: number | null;
  selectedSequence: string[];
  verdictFactor: 'A' | 'B' | null;
  confidence: 'low' | 'mid' | 'high' | null;
}

function readJson<T>(key: string): T | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null; // битый localStorage не должен ронять приложение
  }
}
function writeJson(key: string, v: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
}

function defaultProgress(): GameProgress {
  return {
    level: 4, xp: 680, xpMax: 1000, coins: 1240,
    riskBudget: balanceConfig.riskBudget.initial,
    maxBudget: balanceConfig.riskBudget.max,
    streak: 2, epoch: getEpochForLevel(4) as any,
    cardRanks: { C1:1, C2:1, C3:0, C4:1 },
    enemyStagesReached: { E02:1 },
    errorScroll: [],
    combosUnlocked: [],
    calibration: [],
    weather: 'TREND'
  };
}

export class GameState {
  progress: GameProgress;
  private encounterSeed = 0;

  constructor(){
    const saved = readJson<Partial<GameProgress>>(STORAGE_KEY);
    this.progress = saved ? { ...defaultProgress(), ...saved } : defaultProgress();
    this.refreshEpoch();
  }
  refreshEpoch(){
    this.progress.epoch = getEpochForLevel(this.progress.level) as any;
  }
  save(){ writeJson(STORAGE_KEY, this.progress); }
  addXp(v:number){
    this.progress.xp += v;
    while(this.progress.xp >= this.progress.xpMax){
      this.progress.xp -= this.progress.xpMax;
      this.progress.level++;
      this.progress.xpMax = Math.round(this.progress.xpMax*1.4);
      this.refreshEpoch();
    }
    this.save();
  }
  addCoins(v:number){ this.progress.coins+=v; this.save(); }
  changeBudget(delta:number){
    this.progress.riskBudget = Math.max(0, Math.min(this.progress.maxBudget, this.progress.riskBudget+delta));
    this.save();
    return this.progress.riskBudget;
  }
  pushError(enemy:string, atom:string, missedEvidence:string){
    this.progress.errorScroll.unshift({ id: 'e'+Date.now(), enemy, atom, missedEvidence, createdAt: Date.now(), closed:false, mutationDepth:0});
    if(this.progress.errorScroll.length>balanceConfig.errorScroll.maxEntries) this.progress.errorScroll.pop();
    this.save();
  }
  closeError(id:string){ const e=this.progress.errorScroll.find(x=>x.id===id); if(e) e.closed=true; this.save(); }
  addCalibration(predicted:number, actual:number){ this.progress.calibration.push({predicted,actual}); if(this.progress.calibration.length>50) this.progress.calibration.shift(); this.save(); }
  isCardUnlocked(cardId:string){
    // по ТЗ Часть 1 §4.4
    const lvl = this.progress.level;
    const map: Record<string,number> = {C1:1,C2:4,C3:8,C4:12,C5:16,C8:21,C7:26,C6:31,C9:36,C10:41,C11:46,C12:51,C13:56,C14:61,C15:66,C16:72,C17:78};
    return lvl >= (map[cardId]??99);
  }

  // ── Текущая встреча Арены ──
  getArena(): ArenaSession | null { return readJson<ArenaSession>(ARENA_KEY); }
  startArena(enemyId: string, stage: number): ArenaSession {
    // seed детерминирован цепочкой от предыдущего (nextSeed), без Date.now —
    // одна и та же встреча воспроизводится после рестарта сцены и на сервере (ТЗ Ч6 §2.1)
    const seed = nextSeed((this.encounterSeed || (this.progress.level*100000 + this.progress.xp)) >>> 0);
    this.encounterSeed = seed;
    const s: ArenaSession = {
      enemyId, stage, seed,
      activeSource: null, blindOpened: false,
      selectedEvidence: [], selectedAnswer: null, selectedSequence: [],
      verdictFactor: null, confidence: null,
    };
    writeJson(ARENA_KEY, s);
    return s;
  }
  patchArena(patch: Partial<ArenaSession>): void {
    const cur = this.getArena();
    if (!cur) return;
    writeJson(ARENA_KEY, { ...cur, ...patch });
  }
  endArena(): void {
    try { localStorage.removeItem(ARENA_KEY); } catch {}
  }

  // ── флаги юзерфлоу (онбординг, разминка дня, переход эпохи и т.д.) ──
  getFlag(key:string): boolean { return this.getFlagOr(key, false); }
  getFlagOr(key:string, def:boolean): boolean {
    const f = readJson<Record<string, boolean>>(FLAGS_KEY) ?? {};
    return key in f ? !!f[key] : def;
  }
  setFlag(key:string, val:boolean = true): void {
    const f = readJson<Record<string, boolean>>(FLAGS_KEY) ?? {};
    f[key]=val;
    writeJson(FLAGS_KEY, f);
  }
  // сброс для демо: вернуть флаги и прогресс к первому входу
  resetAll(): void {
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(FLAGS_KEY); localStorage.removeItem(ARENA_KEY); } catch {}
    this.progress = defaultProgress();
    this.encounterSeed = 0;
    this.refreshEpoch();
    this.save();
  }
}

export const gameState = new GameState();
