import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { epochOf } from '../config/epochConfig';
import { skinById } from '../config/skinConfig';

export class BootScene extends Phaser.Scene {
  constructor(){ super({ key: 'BootScene' }); }
  preload(): void {
    // в проде здесь загрузка атласов врагов (1500px мастера + слои S2-S4)
  }
  create(): void {
    const p = gameState.progress;
    // реестр в Phaser registry для совместимости со старым прототипом + новый стейт
    this.registry.set('level', p.level);
    this.registry.set('xp', p.xp);
    this.registry.set('xpMax', p.xpMax);
    this.registry.set('coins', p.coins);
    this.registry.set('riskBudget', p.riskBudget);
    this.registry.set('epoch', p.epoch);

    // короткая заставка эпохи — токены меняются без новой сцены (ТЗ Часть 2 §4)
    const ep = epochOf(p.level);
    const skin = skinById[p.activeSkin] ?? skinById.terminal;
    this.cameras.main.setBackgroundColor(skin.id==='terminal' ? ep.tokens.bg : skin.palette.bg);
    const title = this.add.text(195, 340, 'SIGNAL ARENA', { fontFamily:'Inter, system-ui, sans-serif', fontSize:'22px', color:'#E9F2FF', fontStyle:'italic' }).setOrigin(0.5);
    const sub = this.add.text(195, 372, `${ep.name} · УРОВЕНЬ ${p.level}`, { fontFamily:'IBM Plex Mono, monospace', fontSize:'10px', color:'#'+skin.palette.accent.toString(16).padStart(6,'0') }).setOrigin(0.5);
    const motto = this.add.text(195, 400, ep.motto, { fontFamily:'Inter, sans-serif', fontSize:'10px', color:'#93A3BC', align:'center', wordWrap:{width:300}}).setOrigin(0.5);
    this.add.text(195, 520, 'КОШЕЛЁК — НЕ ТЕРМИНАЛ. ТЕРМИНАЛ — НЕ КАЗИНО.', { fontFamily:'IBM Plex Mono, monospace', fontSize:'8px', color:'#62708A'}).setOrigin(0.5);
    this.time.delayedCall(900, ()=> this.scene.start('ArenaScene'));
  }
}
