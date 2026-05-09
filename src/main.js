/**
 * 应用入口：实例化 Phaser.Game
 * - 浏览器加载后由 index.html 引入
 */
import Phaser from 'phaser';
import { createGameConfig } from './game/config/gameConfig.js';

const config = createGameConfig();
const game = new Phaser.Game(config);

if (typeof window !== 'undefined') {
  window.__MEOW_MANOR__ = game;
}
