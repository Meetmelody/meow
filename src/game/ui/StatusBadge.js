/**
 * StatusBadge：单个状态徽章
 *
 * 视觉：圆角小药丸 = 图标 + 名字 + 层数
 * 交互：hover 触发 tooltip（标题 + 描述）
 *
 * 复用：所有需要表达"目标身上挂着的状态"的 UI 都应该用这个组件
 */
import Phaser from 'phaser';
import { COLORS, HEX, FONTS } from '../config/constants.js';
import { t } from '../systems/localizationSystem.js';
import { attachTooltip } from './Tooltip.js';

const PAD_X = 8;
const HEIGHT = 22;

export default class StatusBadge extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x, y
   * @param {object} present  来自 statusPresentation.STATUS_PRESENTS
   * @param {number} stacks   层数；hasStacks=false 时仍传 1 表示存在
   */
  constructor(scene, x, y, present, stacks) {
    super(scene, x, y);
    scene.add.existing(this);

    this.present = present;
    this.stacks = stacks ?? 1;

    this.bg = scene.add.graphics();
    this.add(this.bg);

    /* glow（满足时高亮）*/
    this.glow = scene.add.graphics();
    this.add(this.glow);

    this.iconText = scene.add
      .text(PAD_X, HEIGHT / 2, present.icon, {
        fontFamily: FONTS.display,
        fontSize: '14px',
        color: present.color,
      })
      .setOrigin(0, 0.5);
    this.add(this.iconText);

    this.titleText = scene.add
      .text(PAD_X + 18, HEIGHT / 2, this._labelText(), {
        fontFamily: FONTS.body,
        fontSize: '12px',
        color: HEX.cream,
      })
      .setOrigin(0, 0.5);
    this.add(this.titleText);

    this._layout();
    this._bindHover();
  }

  setStacks(stacks) {
    this.stacks = stacks ?? 1;
    this.titleText.setText(this._labelText());
    this._layout();
  }

  /* ===== 内部 ===== */
  _labelText() {
    const name = t(this.present.titleKey);
    if (this.present.hasStacks) return `${name} ${this.stacks}`;
    return name;
  }

  _layout() {
    const w = PAD_X + 18 + this.titleText.width + PAD_X;
    this.bg.clear();
    this.bg.fillStyle(this.present.bgColor, 0.32);
    this.bg.fillRoundedRect(0, 0, w, HEIGHT, 10);
    this.bg.lineStyle(1, this.present.bgColor, 0.85);
    this.bg.strokeRoundedRect(0.5, 0.5, w - 1, HEIGHT - 1, 9);

    /* Satisfied 高亮 glow */
    this.glow.clear();
    if (this.present.key === 'satisfied') {
      this.glow.lineStyle(4, COLORS.gold, 0.25);
      this.glow.strokeRoundedRect(-2, -2, w + 4, HEIGHT + 4, 12);
    }

    /* 重新设置交互区域 */
    this.setSize(w, HEIGHT);
    this.disableInteractive();
    this.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, w, HEIGHT),
      Phaser.Geom.Rectangle.Contains
    );
  }

  _bindHover() {
    /* 通过 tooltip 显示完整说明 */
    attachTooltip(this, () => ({
      title: t(this.present.titleKey),
      desc: t(this.present.tooltipKey),
    }));
  }
}
