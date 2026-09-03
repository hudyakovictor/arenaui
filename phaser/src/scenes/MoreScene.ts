import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { epochOf } from '../config/epochConfig';
import { skinById } from '../config/skinConfig';

const C={bg:0x070B14,surface:0x0C1323,elevated:0x111B2E,border:0x22304A,cyan:0x31D6C4,text:'#E9F2FF',sub:'#93A3BC',muted:'#62708A',warn:'#FFB341'};
const mono={fontFamily:'IBM Plex Mono, Consolas, monospace'};
const font={fontFamily:'Inter, system-ui, sans-serif'};

export class MoreScene extends Phaser.Scene{
  constructor(){super({key:'MoreScene'});}
  create():void{
    const p=gameState.progress, epoch=epochOf(p.level), skin=skinById[p.activeSkin];
    this.cameras.main.setBackgroundColor(skin.palette.bg);
    this.add.text(14,16,'Профиль', {...font,fontSize:'22px',color:C.text});
    this.add.text(14,44,'АРХИВИСТ · ПРОГРЕСС · КОСМЕТИКА', {...mono,fontSize:'8px',color:C.muted});
    this.add.circle(48,102,30,skin.palette.surface).setStrokeStyle(2,skin.palette.accent);
    this.add.text(48,102,`L${p.level}`,{...mono,fontSize:'13px',color:'#E9F2FF'}).setOrigin(0.5);
    this.add.text(92,78,`ЭПОХА: ${epoch.name}`,{...mono,fontSize:'9px',color:C.sub});
    this.add.text(92,98,`XP ${p.xp}/${p.xpMax} · БЮДЖЕТ ${p.riskBudget}/${p.maxBudget}`,{...mono,fontSize:'8px',color:C.muted});
    this.add.text(92,118,`СКИН: ${skin.name.toUpperCase()}`,{...mono,fontSize:'8px',color:'#31D6C4'});

    const rows=[
      {title:'Коллекция и трофеи',sub:'Карты, стадии врагов, комбо',go:'CollectionScene'},
      {title:'Свиток ошибок',sub:`Открытых записей: ${p.errorScroll.filter(e=>!e.closed).length}`,go:'CollectionScene'},
      {title:'Скины и косметика',sub:`В коллекции: ${p.ownedSkins.length} · SIG ${p.coins}`,go:'StoreScene'},
      {title:'Настройки',sub:'Звук, motion, язык — контракт архива',go:''},
    ];
    rows.forEach((row,i)=>{
      const y=164+i*70;
      this.add.rectangle(14,y,362,58,C.surface).setStrokeStyle(1,C.border).setOrigin(0).setInteractive().on('pointerdown',()=>{
        if(row.go)this.scene.start(row.go); else this.showSettings();
      });
      this.add.text(26,y+12,row.title,{...font,fontSize:'13px',color:C.text});
      this.add.text(26,y+34,row.sub,{...mono,fontSize:'7px',color:C.muted});
      this.add.text(354,y+29,'›',{...font,fontSize:'18px',color:C.sub}).setOrigin(0.5);
    });
    this.add.rectangle(14,474,362,74,C.surface).setStrokeStyle(1,C.border).setOrigin(0);
    this.add.text(26,486,'ПРИНЦИП СКИНОВ',{...mono,fontSize:'8px',color:C.warn});
    this.add.text(26,506,'Меняется оформление. Не меняются подсказки,\nисточники, ответы и экономика.',{...font,fontSize:'10px',color:C.sub,lineSpacing:4});
    this.createBottomNav();
  }
  private showSettings(){
    const shade=this.add.rectangle(0,0,390,844,C.bg,0.96).setOrigin(0).setDepth(10).setInteractive();
    const objects:Phaser.GameObjects.GameObject[]=[shade];
    const title=this.add.text(20,180,'Настройки',{...font,fontSize:'20px',color:C.text}).setDepth(11); objects.push(title);
    ['ЗВУК: ВКЛ','REDUCED MOTION: АВТО','ЯЗЫК: RU'].forEach((t,i)=>{
      const r=this.add.rectangle(20,230+i*54,350,42,C.surface).setStrokeStyle(1,C.border).setOrigin(0).setDepth(11); objects.push(r);
      const tx=this.add.text(32,244+i*54,t,{...mono,fontSize:'9px',color:C.sub}).setDepth(12); objects.push(tx);
    });
    const close=this.add.text(195,440,'✕ ЗАКРЫТЬ',{...font,fontSize:'12px',color:C.sub}).setOrigin(0.5).setDepth(12).setInteractive();
    close.on('pointerdown',()=>objects.forEach(o=>o.destroy())); objects.push(close);
  }
  private createBottomNav(){
    const items=[{label:'ACADEMY',go:'AcademyScene'},{label:'ARENA',go:'ArenaScene'},{label:'COLLECTION',go:'CollectionScene'},{label:'MORE',go:'MoreScene'}];
    items.forEach(({label,go},i)=>{
      const x=i*97.5;
      this.add.rectangle(x,784,97.5,60,C.elevated).setStrokeStyle(1,C.border).setOrigin(0).setInteractive().on('pointerdown',()=>this.scene.start(go));
      this.add.text(x+48.75,814,label,{...mono,fontSize:'7px',color:label==='MORE'?'#31D6C4':C.muted}).setOrigin(0.5);
    });
  }
}
