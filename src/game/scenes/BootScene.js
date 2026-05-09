/**
 * BootScene：极简的启动场景
 * - 仅作为整个游戏的入口锚点
 * - 不加载资源，不渲染 UI，只负责跳到 PreloadScene
 */
import Phaser from 'phaser';
import { SCENES } from '../config/constants.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  create() {
    this.scene.start(SCENES.PRELOAD);
  }
}
