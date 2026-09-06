import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';
const game = new Phaser.Game(gameConfig);
// dev-хук для smoke/e2e-прогонов (headless-проверка сцен без эмуляции пиксельных кликов)
if (typeof window !== 'undefined') (window as any).__game = game;
export default game;
