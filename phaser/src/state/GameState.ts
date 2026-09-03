import { balanceConfig } from '../config/balanceConfig';
import { getEpochForLevel } from '../config/epochConfig';
import type { GameProgress, SkinId } from '../types';
import { skinById } from '../config/skinConfig';

const STORAGE_KEY = 'arena_v4_progress';

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
    weather: 'TREND',
    activeSkin: 'terminal',
    ownedSkins: ['terminal']
  };
}

export class GameState {
  progress: GameProgress;
  constructor(){
    const saved = typeof localStorage!=='undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    try {
      this.progress = saved ? { ...defaultProgress(), ...JSON.parse(saved)} : defaultProgress();
    } catch {
      // Повреждённое локальное сохранение не должно оставлять игрока на пустом экране.
      this.progress = defaultProgress();
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
    if(!Array.isArray(this.progress.ownedSkins)) this.progress.ownedSkins=['terminal'];
    if(!skinById[this.progress.activeSkin]) this.progress.activeSkin='terminal';
    if(!this.progress.ownedSkins.includes('terminal')) this.progress.ownedSkins.unshift('terminal');
    this.refreshEpoch();
  }
  refreshEpoch(){
    this.progress.epoch = getEpochForLevel(this.progress.level) as any;
  }
  save(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress)); }catch{}
  }
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
  buySkin(id:SkinId): boolean {
    const skin=skinById[id];
    if(!skin || this.progress.ownedSkins.includes(id)) return !!skin;
    if(this.progress.coins<skin.price) return false;
    this.progress.coins-=skin.price;
    this.progress.ownedSkins.push(id);
    this.progress.activeSkin=id;
    this.save();
    return true;
  }
  equipSkin(id:SkinId): boolean {
    if(!this.progress.ownedSkins.includes(id)) return false;
    this.progress.activeSkin=id;
    this.save();
    return true;
  }
}

export const gameState = new GameState();
