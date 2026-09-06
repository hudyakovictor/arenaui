// Signal Arena — реестр ключей ассетов (совместимо с phaser/src/engine/assetKeys.ts).
export const ASSET_BASE = 'assets/render';

const n = (id: string) => id.replace('E', '');

export const enemyRenderKey = (id: string, stage: number) => `enemy_${n(id)}_s${stage}`;
export const enemyRenderUrl = (id: string, stage: number) => `${ASSET_BASE}/enemies/E${n(id)}_s${stage}.png`;
export const enemyIconKey = (id: string) => `enemy_${n(id)}_icon`;
export const enemyAvatarKey = (id: string) => `enemy_${n(id)}_avatar`;
export const cardKey = (id: string) => `card_${id}`;
export const iconKey = (id: string) => `icon_${id}`;

export const BG_WALL_KEY = 'bg-wall';
export const BG_WALL_URL = 'assets/bg-wall.jpg';
