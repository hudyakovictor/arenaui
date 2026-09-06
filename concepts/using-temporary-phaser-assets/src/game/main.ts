import Phaser from 'phaser';
import { CANVAS } from './ui/tokens';
import { resetSafeAreaCache } from './ui/layout';
import { BootScene } from './scenes/BootScene';
import { ArenaScene } from './scenes/ArenaScene';
import { AcademyScene } from './scenes/AcademyScene';
import { CollectionScene } from './scenes/CollectionScene';
import { MoreScene } from './scenes/MoreScene';
import { AssetGalleryScene } from './scenes/AssetGalleryScene';

export function bootGame(parent: string): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: CANVAS.w,
    height: CANVAS.h,
    backgroundColor: '#0a0b0d',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true, roundPixels: false },
    scene: [BootScene, ArenaScene, AcademyScene, CollectionScene, MoreScene, AssetGalleryScene],
  };
  const game = new Phaser.Game(config);
  window.addEventListener('resize', resetSafeAreaCache);
  window.addEventListener('orientationchange', resetSafeAreaCache);
  return game;
}
