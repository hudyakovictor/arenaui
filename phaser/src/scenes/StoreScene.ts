import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { skins, type SkinDef } from '../config/skinConfig';

const UI={bg:0x070B14,surface:0x0C1323,elevated:0x111B2E,border:0x22304A,cyan:0x31D6C4,text:'#E9F2FF',sub:'#93A3BC',muted:'#62708A',good:'#3BDE8A',warn:'#FFB341'};
const mono={fontFamily:'IBM Plex Mono, Consolas, monospace'};
const font={fontFamily:'Inter, system-ui, sans-serif'};

export class StoreScene extends Phaser.Scene {
  constructor(){ super({key:'StoreScene'}); }
  create():void{
    this.cameras.main.setBackgroundColor(UI.bg);
    this.add.text(14,16,'Скины', {...font,fontSize:'22px',color:UI.text});
    this.add.text(14,44,'КОСМЕТИКА · НЕ МЕНЯЕТ МЕХАНИКУ', {...mono,fontSize:'8px',color:UI.muted});
    this.add.text(292,20,`◉ ${gameState.progress.coins} SIG`, {...mono,fontSize:'10px',color:UI.warn});
    this.add.rectangle(14,66,362,48,UI.surface).setStrokeStyle(1,UI.border).setOrigin(0);
    this.add.text(24,76,'Скин меняет chrome, палитру и текстуру.\nДанные, ответы, бюджет и hit-area неизменны.', {...mono,fontSize:'8px',color:UI.sub,lineSpacing:4});

    skins.forEach((skin,i)=>this.createSkinCard(skin,14,132+i*154));

    this.add.text(14,610,'АРХИТЕКТУРА ДЛЯ БУДУЩИХ НАБОРОВ', {...mono,fontSize:'8px',color:UI.muted});
    this.add.text(14,628,'Новые темы добавляются записью SkinConfig и ассет-паком.\nСцены и баланс не копируются.', {...font,fontSize:'11px',color:UI.sub,wordWrap:{width:350},lineSpacing:4});
    this.add.rectangle(14,700,362,44,UI.elevated).setStrokeStyle(1,UI.border).setOrigin(0).setInteractive().on('pointerdown',()=>this.scene.start('MoreScene'));
    this.add.text(195,722,'← ПРОФИЛЬ И НАСТРОЙКИ', {...mono,fontSize:'9px',color:UI.sub}).setOrigin(0.5);
    this.createBottomNav();
  }

  private createSkinCard(skin:SkinDef,x:number,y:number){
    const owned=gameState.progress.ownedSkins.includes(skin.id);
    const active=gameState.progress.activeSkin===skin.id;
    this.add.rectangle(x,y,362,138,skin.palette.surface).setStrokeStyle(active?2:1,active?skin.palette.accent:skin.palette.border).setOrigin(0);
    this.add.rectangle(x+12,y+12,104,78,skin.palette.bg).setStrokeStyle(1,skin.palette.strong).setOrigin(0);
    this.add.rectangle(x+22,y+22,84,10,skin.palette.elevated).setStrokeStyle(1,skin.palette.border).setOrigin(0);
    this.add.rectangle(x+22,y+40,84,38,skin.palette.surface).setStrokeStyle(1,skin.palette.accent).setOrigin(0);
    this.add.rectangle(x+28,y+48,48,4,skin.palette.accent).setOrigin(0);
    this.add.rectangle(x+28,y+58,68,3,skin.palette.muted).setOrigin(0);
    this.add.text(x+128,y+14,skin.name,{...font,fontSize:'14px',color:'#E9F2FF'});
    this.add.text(x+128,y+36,skin.description,{...mono,fontSize:'7px',color:'#93A3BC',wordWrap:{width:214}});
    this.add.text(x+128,y+62,`texture: ${skin.texture}`,{...mono,fontSize:'7px',color:'#62708A'});
    const label=active?'ИСПОЛЬЗУЕТСЯ':owned?'ПРИМЕНИТЬ':skin.price===0?'БЕСПЛАТНО':`◉ ${skin.price}`;
    const enabled=!active && (owned || gameState.progress.coins>=skin.price);
    const button=this.add.rectangle(x+12,y+100,338,28,active?skin.palette.hover:skin.palette.accent,enabled||active?1:0.35).setOrigin(0);
    button.setInteractive().on('pointerdown',()=>{
      if(active) return;
      const ok=owned?gameState.equipSkin(skin.id):gameState.buySkin(skin.id);
      if(ok) this.scene.restart(); else this.cameras.main.flash(100,255,89,109);
    });
    this.add.text(x+181,y+114,label,{...mono,fontSize:'8px',color:active?'#93A3BC':'#07100D'}).setOrigin(0.5);
  }

  private createBottomNav(){
    const items=[{label:'ACADEMY',go:'AcademyScene'},{label:'ARENA',go:'ArenaScene'},{label:'COLLECTION',go:'CollectionScene'},{label:'MORE',go:'MoreScene'}];
    items.forEach(({label,go},i)=>{
      const x=i*97.5;
      this.add.rectangle(x,784,97.5,60,UI.elevated).setStrokeStyle(1,UI.border).setOrigin(0).setInteractive().on('pointerdown',()=>this.scene.start(go));
      this.add.text(x+48.75,814,label,{...mono,fontSize:'7px',color:label==='MORE'?'#31D6C4':UI.muted}).setOrigin(0.5);
    });
  }
}
