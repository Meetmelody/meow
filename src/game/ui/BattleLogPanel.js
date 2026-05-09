/**
 * BattleLogPanel：右下战斗日志
 * - 滚动显示最近 N 行
 * - 通过 push(msg) 追加；自动裁剪超出
 */
import Phaser from 'phaser';
import { COLORS, HEX, FONTS } from '../config/constants.js';
import { t } from '../systems/localizationSystem.js';

const PANEL_W = 280;
const PANEL_H = 200;
const MAX_LINES = 8;

export default class BattleLogPanel extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setSize(PANEL_W, PANEL_H);

    this.bg = scene.add.graphics();
    this.add(this.bg);
    this._drawBg();

    this.title = scene.add
      .text(-PANEL_W / 2 + 14, -PANEL_H / 2 + 10, t('labelLog'), {
        fontFamily: FONTS.display,
        fontSize: '14px',
        color: HEX.gold,
      });
    this.add(this.title);

    this.body = scene.add.text(-PANEL_W / 2 + 14, -PANEL_H / 2 + 36, '', {
      fontFamily: FONTS.body,
      fontSize: '12px',
      color: HEX.textMain,
      wordWrap: { width: PANEL_W - 28, useAdvancedWrap: true },
    });
    this.add(this.body);

    this._lines = [];
  }

  push(line) {
    if (!line) return;
    this._lines.push(line);
    if (this._lines.length > MAX_LINES) this._lines.shift();
    this.body.setText(this._lines.join('\n'));
  }

  clear() {
    this._lines = [];
    this.body.setText('');
  }

  _drawBg() {
    this.bg.clear();
    this.bg.fillStyle(COLORS.panel, 0.92);
    this.bg.fillRoundedRect(-PANEL_W / 2, -PANEL_H / 2, PANEL_W, PANEL_H, 14);
    this.bg.lineStyle(2, COLORS.gold, 0.85);
    this.bg.strokeRoundedRect(-PANEL_W / 2 + 1, -PANEL_H / 2 + 1, PANEL_W - 2, PANEL_H - 2, 13);
  }
}

export const BATTLE_LOG_SIZE = { width: PANEL_W, height: PANEL_H };
