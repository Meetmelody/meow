/**
 * Phaser 主配置：渲染器、画布、场景列表、缩放策略
 * - 引入所有场景类，按顺序注册（Boot → Preload → MainMenu → ...）
 */
import Phaser from 'phaser';

import { GAME_WIDTH, GAME_HEIGHT, HEX } from './constants.js';
import BootScene from '../scenes/BootScene.js';
import PreloadScene from '../scenes/PreloadScene.js';
import MainMenuScene from '../scenes/MainMenuScene.js';
import MapScene from '../scenes/MapScene.js';
import BattleScene from '../scenes/BattleScene.js';
import RewardScene from '../scenes/RewardScene.js';
import EventScene from '../scenes/EventScene.js';
import GameOverScene from '../scenes/GameOverScene.js';
import DemoClearScene from '../scenes/DemoClearScene.js';

export function createGameConfig() {
  return {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: HEX.bgDark,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelArt: false,
    antialias: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      roundPixels: true,
    },
    scene: [
      BootScene,
      PreloadScene,
      MainMenuScene,
      MapScene,
      BattleScene,
      RewardScene,
      EventScene,
      GameOverScene,
      DemoClearScene,
    ],
  };
}
