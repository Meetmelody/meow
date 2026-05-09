/**
 * IntentView：敌人意图视觉
 * - 接收一组 intents（v0.2 起；旧调用传单个对象会被自动包成数组）
 * - 攻击：⚔ + 数值（× hits）  红
 * - 格挡：🛡 + 数值            蓝
 * - 调试：☠ + status            紫
 *
 * 同回合多个 intent 会逐行排列在 label 下方。
 */
import Phaser from 'phaser';
import { COLORS, HEX, FONTS, STATUS } from '../config/constants.js';
import { t } from '../systems/localizationSystem.js';

const ROW_H = 24;

export default class IntentView extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);

    this.label = scene.add
      .text(0, -16, t('labelIntent'), {
        fontFamily: FONTS.body,
        fontSize: '11px',
        color: HEX.textSub,
      });
    this.add(this.label);

    /* 复用一组 row 容器；最多预备 3 行（足够 v0.2 所有意图） */
    this._rows = [];
    for (let i = 0; i < 3; i += 1) {
      const row = this._createRow(i);
      row.setVisible(false);
      this._rows.push(row);
    }
  }

  _createRow(index) {
    const row = this.scene.add.container(0, index * ROW_H);
    const bg = this.scene.add.graphics();
    row.add(bg);
    const icon = this.scene.add.text(0, 0, '', {
      fontFamily: FONTS.display,
      fontSize: '18px',
      color: HEX.cream,
    });
    row.add(icon);
    const text = this.scene.add.text(26, 2, '', {
      fontFamily: FONTS.display,
      fontSize: '17px',
      color: HEX.cream,
    });
    row.add(text);
    row._bg = bg;
    row._icon = icon;
    row._text = text;
    this.add(row);
    return row;
  }

  update(intents) {
    this.label.setText(t('labelIntent'));
    let arr = intents;
    if (!arr) arr = [];
    else if (!Array.isArray(arr)) arr = [arr];

    /* 隐藏全部，再按需显示 */
    this._rows.forEach((row) => row.setVisible(false));

    if (arr.length === 0) {
      const row = this._rows[0];
      row.setVisible(true);
      this._renderEmpty(row);
      return;
    }

    arr.slice(0, this._rows.length).forEach((intent, i) => {
      const row = this._rows[i];
      row.setVisible(true);
      this._renderIntent(row, intent);
    });
  }

  /* ============ 单行渲染 ============ */

  _renderEmpty(row) {
    row._bg.clear();
    row._text.setText('—');
    row._icon.setText('');
  }

  _renderIntent(row, intent) {
    row._bg.clear();
    if (intent.kind === 'attack') {
      const hits = intent.hits || 1;
      row._text.setText(hits > 1 ? `${intent.value} × ${hits}` : `${intent.value}`);
      row._icon.setText('⚔');
      row._icon.setColor('#e05a4d');
      row._bg.fillStyle(COLORS.bloodRed, 0.18);
      row._bg.fillRoundedRect(-6, -2, 130, 26, 6);
      row._bg.lineStyle(1, COLORS.bloodRed, 0.5);
      row._bg.strokeRoundedRect(-6, -2, 130, 26, 6);
    } else if (intent.kind === 'block') {
      row._text.setText(`${intent.value}`);
      row._icon.setText('🛡');
      row._icon.setColor('#9bb8d8');
      row._bg.fillStyle(COLORS.blockBlue, 0.18);
      row._bg.fillRoundedRect(-6, -2, 130, 26, 6);
      row._bg.lineStyle(1, COLORS.blockBlue, 0.5);
      row._bg.strokeRoundedRect(-6, -2, 130, 26, 6);
    } else if (intent.kind === 'debuff') {
      const labelKey = intent.status === STATUS.WEAK ? 'statusWeak' : intent.status === STATUS.WET ? 'statusWet' : null;
      const label = labelKey ? t(labelKey) : intent.status;
      row._text.setText(`${label} ${intent.value}`);
      row._icon.setText('☠');
      row._icon.setColor('#c98ade');
      row._bg.fillStyle(COLORS.weakPurple, 0.18);
      row._bg.fillRoundedRect(-6, -2, 130, 26, 6);
      row._bg.lineStyle(1, COLORS.weakPurple, 0.5);
      row._bg.strokeRoundedRect(-6, -2, 130, 26, 6);
    } else {
      row._text.setText('?');
      row._icon.setText('?');
    }
  }
}
