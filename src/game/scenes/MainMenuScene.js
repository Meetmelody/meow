/**
 * MainMenuScene：主菜单
 * - 标题 + 副标题 + Start / Continue + 语言切换
 * - Continue 区域显示存档摘要（v0.3）
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
import { startNewRun, loadRun, isRunStarted } from '../systems/runState.js';
import { hasSave, getSaveSummary } from '../systems/saveSystem.js';
import TextButton from '../ui/TextButton.js';
import LanguageToggleButton from '../ui/LanguageToggleButton.js';
import SaveSummaryPanel from '../ui/SaveSummaryPanel.js';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MAIN_MENU);
  }

  create() {
    const cx = GAME_WIDTH / 2;

    /* 背景 */
    this.add.image(cx, GAME_HEIGHT / 2, TEXTURES.BG_MAIN_MENU).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.45);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    /* 月光圆 */
    const moon = this.add.graphics();
    moon.fillStyle(0xfff5d6, 0.06);
    moon.fillCircle(cx, 220, 220);
    moon.fillStyle(0xfff5d6, 0.12);
    moon.fillCircle(cx, 220, 120);

    /* 主标题 */
    this.add
      .text(cx, 200, t('title'), {
        fontFamily: FONTS.display,
        fontSize: '88px',
        color: HEX.gold,
      })
      .setOrigin(0.5)
      .setShadow(0, 0, '#e8b84a', 24, true, true);

    /* 副标题（中文） */
    this.add
      .text(cx, 280, t('subtitle'), {
        fontFamily: FONTS.body,
        fontSize: '22px',
        color: HEX.cream,
        letterSpacing: 6,
      })
      .setOrigin(0.5);

    /* 英文小字 */
    this.add
      .text(cx, 318, t('titleEn'), {
        fontFamily: FONTS.body,
        fontSize: '14px',
        color: HEX.textSub,
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    /* 装饰分隔线 */
    const line = this.add.graphics();
    line.lineStyle(1, COLORS.gold, 0.6);
    line.lineBetween(cx - 160, 348, cx - 30, 348);
    line.lineBetween(cx + 30, 348, cx + 160, 348);
    this.add
      .text(cx, 348, '✦', {
        fontFamily: FONTS.display,
        fontSize: '18px',
        color: HEX.goldSoft,
      })
      .setOrigin(0.5);

    /* 按钮：开始 / 继续 */
    const startBtn = new TextButton(this, cx, 420, {
      width: 280,
      height: 70,
      primaryLabel: t('btnStart'),
      secondaryLabel: 'Start Game',
      primaryFontSize: '26px',
    }).onClick(() => this._handleStart());

    const continueBtn = new TextButton(this, cx, 510, {
      width: 280,
      height: 70,
      primaryLabel: t('btnContinue'),
      secondaryLabel: 'Continue',
      primaryFontSize: '26px',
    }).onClick(() => this._handleContinue());

    if (!hasSave()) {
      continueBtn.setEnabled(false);
    }

    /* 入场淡入 */
    [startBtn, continueBtn].forEach((b, i) => {
      b.setAlpha(0);
      this.tweens.add({
        targets: b,
        alpha: hasSave() || i === 0 ? 1 : 0.45,
        y: b.y - 6,
        duration: 360,
        delay: 100 + i * 80,
        ease: 'Sine.easeOut',
      });
    });

    /* 存档摘要面板（在 Continue 按钮右侧）*/
    this.summaryPanel = new SaveSummaryPanel(this, cx + 280, 510);
    this.summaryPanel.update(getSaveSummary());

    /* 语言切换按钮（右上角）*/
    new LanguageToggleButton(this, GAME_WIDTH - 90, 38, {
      onChanged: () => this.scene.restart(),
    });

    /* 底部存档提示 */
    this.add
      .text(cx, GAME_HEIGHT - 40, hasSave() ? t('saveHint') : t('noSaveHint'), {
        fontFamily: FONTS.body,
        fontSize: '12px',
        color: HEX.textMuted,
      })
      .setOrigin(0.5);

    /* 入场相机淡入 */
    this.cameras.main.fadeIn(280, 0, 0, 0);
  }

  _handleStart() {
    startNewRun();
    this.scene.start(SCENES.MAP);
  }

  _handleContinue() {
    const ok = loadRun() || isRunStarted();
    if (!ok) return;
    this._toast(t('saveLoadedToast'));
    this.time.delayedCall(420, () => this.scene.start(SCENES.MAP));
  }

  _toast(message) {
    if (this._toastObj) this._toastObj.destroy();
    const toast = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 90, message, {
        fontFamily: FONTS.display,
        fontSize: '16px',
        color: HEX.goldSoft,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5);
    this._toastObj = toast;
    this.tweens.add({
      targets: toast,
      alpha: 0,
      duration: 1200,
      delay: 800,
      onComplete: () => toast.destroy(),
    });
  }
}
