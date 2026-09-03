export type SkinId = 'terminal' | 'field-notes' | 'neon-district';

export interface SkinDef {
  id: SkinId;
  name: string;
  description: string;
  price: number;
  palette: {
    bg: number;
    inset: number;
    surface: number;
    elevated: number;
    hover: number;
    border: number;
    strong: number;
    accent: number;
    text: number;
    sub: number;
    muted: number;
    paper: number;
    ink: number;
  };
  texture: 'grid' | 'paper' | 'graffiti';
}

// Скин — только косметический слой. Он не содержит чисел баланса,
// правил механик, размеров hit-area или данных задания.
export const skins: SkinDef[] = [
  {
    id:'terminal', name:'Terminal', description:'Базовый служебный терминал', price:0, texture:'grid',
    palette:{ bg:0x070B14,inset:0x060A12,surface:0x0C1323,elevated:0x111B2E,hover:0x14223A,border:0x22304A,strong:0x344563,accent:0x31D6C4,text:0xE9F2FF,sub:0x93A3BC,muted:0x62708A,paper:0xE7DFD0,ink:0x1C1916 }
  },
  {
    id:'field-notes', name:'Field Notes', description:'Бумага, архив и полевые пометки', price:800, texture:'paper',
    palette:{ bg:0x15130F,inset:0x100F0C,surface:0x242019,elevated:0x302A21,hover:0x3B3327,border:0x655944,strong:0x8A795B,accent:0xE6B85C,text:0xF4EBD9,sub:0xC0B296,muted:0x827761,paper:0xE9DFC8,ink:0x241F17 }
  },
  {
    id:'neon-district', name:'Neon District', description:'Кислотный лайм и ночное граффити', price:1200, texture:'graffiti',
    palette:{ bg:0x080A0D,inset:0x050608,surface:0x11151A,elevated:0x191F25,hover:0x232B31,border:0x3D4850,strong:0x64717A,accent:0xB8F238,text:0xF2F5EA,sub:0xA5AEA0,muted:0x687064,paper:0xDDE2CF,ink:0x171A12 }
  }
];

export const skinById = Object.fromEntries(skins.map(s=>[s.id,s])) as Record<SkinId,SkinDef>;
