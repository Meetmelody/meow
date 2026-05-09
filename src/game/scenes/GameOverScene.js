/**
 * GameOverScene：玩家失败
 */
import Phaser from 'phaser';
import {
  SCENES,
  GAME_WIDTH,
  GAME_HEIGHT,
  HEX,
  COLORS,
  FONTS,
} from '../config/constants.js';
import { t } from '../systems/localizationSystem.js';
import { resetRun, startNewRun } from '../systems/runState.js';
import TextButton from '../ui/TextButton.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENES.GAME_OVER);
  }

  create() {
    const bg = this.add.graphics();
    bg.fillStyle(0x080605, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.fillStyle(0xc14242, 0.06);
    bg.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 360);

    this.add
      .text(GAME_WIDTH / 2, 200, t('gameOverTitle'), {
        fontFamily: FONTS.display,
        fontSize: '60px',
        color: '#e05a4d',
      })
      .setOrigin(0.5)
      .setShadow(0, 0, '#e05a4d', 18, true, true);

    this.add
      .text(GAME_WIDTH / 2, 280, t('gameOverSubtitle'), {
        fontFamily: FONTS.body,
        fontSize: '18px',
        color: HEX.textSub,
      })
      .setOrigin(0.5);

    new TextButton(this, GAME_WIDTH / 2, 420, {
      width: 280,
      height: 64,
      primaryLabel: t('btnRetry'),
      primaryFontSize: '22px',
    }).onClick(() => {
      resetRun();
      startNewRun();
      this.scene.start(SCENES.MAP);
    });

    new TextButton(this, GAME_WIDTH / 2, 500, {
      width: 280,
      height: 64,
      primaryLabel: t('btnBackToMenu'),
      primaryFontSize: '22px',
    }).onClick(() => {
      resetRun();
      this.scene.start(SCENES.MAIN_MENU);
    });

    void COLORS;
  }
}
