/**
 * RewardScene：胜利后三选一
 * - 随机抽 3 张奖励卡 → 选 1 加入牌组 / 跳过
 * - 完成后回到 MapScene
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
import { addCardToDeck, saveRun } from '../systems/runState.js';
import { getCardDef } from '../data/cards.js';
import { rollRewardCardIds } from '../systems/rewardSystem.js';
import CardView, { CARD_VIEW_SIZE } from '../ui/CardView.js';
import TextButton from '../ui/TextButton.js';
import LanguageToggleButton from '../ui/LanguageToggleButton.js';

export default class RewardScene extends Phaser.Scene {
  constructor() {
    super(SCENES.REWARD);
  }

  init(data) {
    this.rewardData = data || {};
    this._cardIds = rollRewardCardIds(3);
    this._cardViews = [];
  }

  create() {
    /* 暗色蒙版背景 */
    const bg = this.add.graphics();
    bg.fillStyle(0x0c0908, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.fillStyle(COLORS.gold, 0.06);
    bg.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 320);

    this.add
      .text(GAME_WIDTH / 2, 110, t('rewardTitle'), {
        fontFamily: FONTS.display,
        fontSize: '64px',
        color: HEX.gold,
      })
      .setOrigin(0.5)
      .setShadow(0, 0, '#e8b84a', 24, true, true);

    this.add
      .text(GAME_WIDTH / 2, 184, t('rewardSubtitle'), {
        fontFamily: FONTS.body,
        fontSize: '18px',
        color: HEX.textSub,
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    /* 渲染奖励卡 */
    const cardW = CARD_VIEW_SIZE.width;
    const gap = 80;
    const totalWidth = cardW * 3 + gap * 2;
    const startX = GAME_WIDTH / 2 - totalWidth / 2 + cardW / 2;
    const y = GAME_HEIGHT / 2 + 30;

    this._cardIds.forEach((cardId, idx) => {
      const def = getCardDef(cardId);
      if (!def) return;
      const view = new CardView(this, startX + idx * (cardW + gap), y + 24, def, {
        playable: true,
      }).onPlay(() => this._handlePick(cardId));
      view.setAlpha(0);
      this.tweens.add({
        targets: view,
        alpha: 1,
        y: y,
        duration: 360,
        delay: 80 * idx,
        ease: 'Sine.easeOut',
      });
      this._cardViews.push(view);
    });

    /* 跳过按钮 */
    new TextButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 80, {
      width: 240,
      height: 60,
      primaryLabel: t('btnSkipReward'),
      secondaryLabel: 'Skip Reward',
      primaryFontSize: '20px',
    }).onClick(() => this._handleBack());

    /* 语言切换 */
    new LanguageToggleButton(this, GAME_WIDTH - 90, 38, {
      onChanged: () => this.scene.restart(),
    });
  }

  _handlePick(cardId) {
    addCardToDeck(cardId);
    saveRun();
    this._handleBack();
  }

  _handleBack() {
    this.scene.start(SCENES.MAP);
  }
}
