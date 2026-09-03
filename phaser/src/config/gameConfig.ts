import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { ArenaScene } from '../scenes/ArenaScene';
import { AcademyScene } from '../scenes/AcademyScene';
import { CollectionScene } from '../scenes/CollectionScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 390,
  height: 844,
  backgroundColor: '#070B14',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, ArenaScene, AcademyScene, CollectionScene],
  physics: { default: 'arcade', arcade: { debug: false } }
};
