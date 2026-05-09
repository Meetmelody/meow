/**
 * DemoClearScene：v0.2 Demo 通关页
 * - 显示通关标题与寄语
 * - 提供「再来一局」与「返回主菜单」
 */
import Phaser from 'phaser';
import {
  SCENES,
  GAME_WIDTH,
  GAME_HEIGHT,
  HEX,
  COLORS,
  FONTS,
  TEXTURES,
} from '../config/constants.js';
import { t } from '../systems/localizationSystem.js';
import { resetRun, startNewRun } from '../systems/runState.js';
import TextButton from '../ui/TextButton.js';

export default class DemoClearScene extends Phaser.Scene {
  constructor() {
    super(SCENES.DEMO_CLEAR);
  }

  create() {
    /* 背景：宅邸夜景 + 暗色蒙版 */
    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, TEXTURES.BG_MAP)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.62);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    /* 月光光晕 */
    const halo = this.add.graphics();
    halo.fillStyle(COLORS.gold, 0.05);
    halo.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 360);
    halo.fillStyle(0xfff5d6, 0.08);
    halo.fillCircle(GAME_WIDTH / 2, 220, 160);

    /* 装饰：猫爪 */
    [
      [GAME_WIDTH / 2 - 380, 220],
      [GAME_WIDTH / 2 + 380, 240],
      [GAME_WIDTH / 2 - 220, GAME_HEIGHT - 200],
      [GAME_WIDTH / 2 + 220, GAME_HEIGHT - 220],
    ].forEach(([x, y], i) => {
      this.add
        .text(x, y, '☘', {
          fontFamily: FONTS.display,
          fontSize: i % 2 === 0 ? '34px' : '28px',
          color: HEX.goldSoft,
        })
        .setAlpha(0.45)
        .setOrigin(0.5);
    });

    /* 主标题（带呼吸 glow）*/
    const titleText = this.add
      .text(GAME_WIDTH / 2, 200, t('demoClearTitleBig'), {
        fontFamily: FONTS.display,
        fontSize: '76px',
        color: HEX.gold,
      })
      .setOrigin(0.5)
      .setShadow(0, 0, '#e8b84a', 32, true, true);
    /* 呼吸放大 + 阴影强弱节奏 */
    this.tweens.add({
      targets: titleText,
      scale: { from: 0.985, to: 1.02 },
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    /* 装饰分隔线 */
    const line = this.add.graphics();
    line.lineStyle(1, COLORS.gold, 0.55);
    line.lineBetween(GAME_WIDTH / 2 - 180, 296, GAME_WIDTH / 2 - 30, 296);
    line.lineBetween(GAME_WIDTH / 2 + 30, 296, GAME_WIDTH / 2 + 180, 296);
    this.add
      .text(GAME_WIDTH / 2, 296, '✦', {
        fontFamily: FONTS.display,
        fontSize: '18px',
        color: HEX.goldSoft,
      })
      .setOrigin(0.5);

    /* 寄语 */
    this.add
      .text(GAME_WIDTH / 2, 380, t('demoClearBody'), {
        fontFamily: FONTS.body,
        fontSize: '17px',
        color: HEX.cream,
        align: 'center',
        wordWrap: { width: 720 },
        lineSpacing: 8,
      })
      .setOrigin(0.5);

    /* 按钮：再来一局 */
    new TextButton(this, GAME_WIDTH / 2, 510, {
      width: 280,
      height: 64,
      primaryLabel: t('btnPlayAgain'),
      primaryFontSize: '22px',
    }).onClick(() => {
      resetRun();
      startNewRun();
      this.scene.start(SCENES.MAP);
    });

    /* 按钮：回主菜单 */
    new TextButton(this, GAME_WIDTH / 2, 590, {
      width: 280,
      height: 64,
      primaryLabel: t('btnBackToMenu'),
      primaryFontSize: '22px',
    }).onClick(() => {
      this.scene.start(SCENES.MAIN_MENU);
    });

    /* 入场淡入 */
    this.cameras.main.fadeIn(360, 0, 0, 0);
  }
}
