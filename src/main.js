/**
 * 应用入口：实例化 Phaser.Game
 * - 浏览器加载后由 index.html 引入
 * - v0.3：在创建 Game 之前，先读取 localStorage 中的语言偏好
 */
import Phaser from 'phaser';
import { createGameConfig } from './game/config/gameConfig.js';
import { initLangFromStorage } from './game/systems/localizationSystem.js';

initLangFromStorage();

const config = createGameConfig();
const game = new Phaser.Game(config);

if (typeof window !== 'undefined') {
  window.__MEOW_MANOR__ = game;
}
