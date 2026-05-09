/**
 * EnemyPanel：右上敌人卡片
 * - 名称 / HP / Block / 当前意图（IntentView）
 */
import Phaser from 'phaser';
import { COLORS, HEX, FONTS, TEXTURES } from '../config/constants.js';
import { t, getName } from '../systems/localizationSystem.js';
import IntentView from './IntentView.js';
import StatusBadge from './StatusBadge.js';
import { listBadgesFromStatuses } from '../systems/statusPresentation.js';

const PANEL_W = 280;
const PANEL_H = 200;

export default class EnemyPanel extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setSize(PANEL_W, PANEL_H);

    this.bg = scene.add.graphics();
    this.add(this.bg);
    this._drawBg();

    this.portrait = scene.add
      .image(-PANEL_W / 2 + 60, 0, TEXTURES.ROOMBA_GUARD)
      .setOrigin(0.5)
      .setScale(0.7);
    this.add(this.portrait);

    this.nameText = scene.add
      .text(-PANEL_W / 2 + 110, -PANEL_H / 2 + 14, '', {
        fontFamily: FONTS.display,
        fontSize: '20px',
        color: HEX.gold,
      });
    this.add(this.nameText);

    this.hpLabel = scene.add
      .text(-PANEL_W / 2 + 110, -PANEL_H / 2 + 44, t('labelHp'), {
        fontFamily: FONTS.body,
        fontSize: '12px',
        color: HEX.textSub,
      });
    this.add(this.hpLabel);

    this.hpText = scene.add
      .text(-PANEL_W / 2 + 150, -PANEL_H / 2 + 40, '0', {
        fontFamily: FONTS.display,
        fontSize: '20px',
        color: HEX.hpRed,
      });
    this.add(this.hpText);

    this.blockLabel = scene.add
      .text(-PANEL_W / 2 + 110, -PANEL_H / 2 + 80, t('labelBlock'), {
        fontFamily: FONTS.body,
        fontSize: '12px',
        color: HEX.textSub,
      });
    this.add(this.blockLabel);

    this.blockText = scene.add
      .text(-PANEL_W / 2 + 150, -PANEL_H / 2 + 76, '0', {
        fontFamily: FONTS.display,
        fontSize: '18px',
        color: HEX.blockBlue,
      });
    this.add(this.blockText);

    this.intentView = new IntentView(scene, -PANEL_W / 2 + 110, PANEL_H / 2 - 50);
    this.add(this.intentView);

    /* 状态徽章容器 */
    this.badgeContainer = scene.add.container(-PANEL_W / 2 + 14, PANEL_H / 2 - 22);
    this.add(this.badgeContainer);
    this._badges = [];
  }

  update(enemy, intentOrIntents) {
    if (!enemy) return;
    this.nameText.setText(getName(enemy));
    this.hpText.setText(`${enemy.hp} / ${enemy.maxHp}`);
    this.blockText.setText(`${enemy.block ?? 0}`);
    this.intentView.update(intentOrIntents);

    this._renderBadges(listBadgesFromStatuses(enemy.statuses || {}));
  }

  refreshLanguage() {
    if (this.hpLabel) this.hpLabel.setText(t('labelHp'));
    if (this.blockLabel) this.blockLabel.setText(t('labelBlock'));
    if (this.intentView?.update) this.intentView.update(this.intentView.lastIntents);
    for (const badge of this._badges) badge.refreshLanguage();
  }

  _renderBadges(badges) {
    for (const b of this._badges) b.destroy();
    this._badges = [];

    let cursorX = 0;
    badges.forEach(({ present, stacks }) => {
      const badge = new StatusBadge(this.scene, cursorX, 0, present, stacks);
      this.badgeContainer.add(badge);
      this._badges.push(badge);
      cursorX += (badge.width || 60) + 6;
    });
  }

  shake() {
    const baseX = this.x;
    this.scene.tweens.add({
      targets: this,
      x: { from: baseX - 8, to: baseX },
      duration: 120,
      yoyo: false,
      ease: 'Sine.easeOut',
      onStart: () => {
        this.scene.tweens.add({
          targets: this,
          x: { from: baseX + 6, to: baseX },
          duration: 80,
          repeat: 1,
        });
      },
    });
  }

  _drawBg() {
    this.bg.clear();
    this.bg.fillStyle(COLORS.panel, 0.95);
    this.bg.fillRoundedRect(-PANEL_W / 2, -PANEL_H / 2, PANEL_W, PANEL_H, 14);
    this.bg.lineStyle(2, COLORS.gold, 0.9);
    this.bg.strokeRoundedRect(-PANEL_W / 2 + 1, -PANEL_H / 2 + 1, PANEL_W - 2, PANEL_H - 2, 13);
  }
}

export const ENEMY_PANEL_SIZE = { width: PANEL_W, height: PANEL_H };
