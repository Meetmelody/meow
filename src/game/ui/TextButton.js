/**
 * TextButton：木牌按钮，支持中英双语上下排版
 * - 主标题：中文（更大）
 * - 副标题：英文小字（可选）
 */
import { COLORS, HEX, FONTS } from '../config/constants.js';
import BaseButton from './BaseButton.js';

export default class TextButton extends BaseButton {
  constructor(scene, x, y, options = {}) {
    const width = options.width ?? 240;
    const height = options.height ?? 64;
    super(scene, x, y, width, height);

    this.bg = scene.add.graphics();
    this.add(this.bg);

    this.glow = scene.add.graphics();
    this.add(this.glow);

    const primary = options.primaryLabel ?? '';
    const secondary = options.secondaryLabel ?? '';

    this.primaryText = scene.add
      .text(0, secondary ? -10 : 0, primary, {
        fontFamily: FONTS.display,
        fontSize: options.primaryFontSize ?? '24px',
        color: HEX.cream,
      })
      .setOrigin(0.5);
    this.add(this.primaryText);

    if (secondary) {
      this.secondaryText = scene.add
        .text(0, 14, secondary, {
          fontFamily: FONTS.body,
          fontSize: options.secondaryFontSize ?? '12px',
          color: HEX.textSub,
          letterSpacing: 1,
        })
        .setOrigin(0.5);
      this.add(this.secondaryText);
    }

    this._drawNormal();
  }

  setLabel(primary, secondary) {
    if (typeof primary === 'string') this.primaryText.setText(primary);
    if (typeof secondary === 'string' && this.secondaryText) {
      this.secondaryText.setText(secondary);
    }
    return this;
  }

  _drawNormal() {
    const w = this.btnWidth;
    const h = this.btnHeight;
    this.bg.clear();
    this.bg.fillStyle(COLORS.wood, 1);
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    this.bg.fillStyle(COLORS.woodDark, 0.4);
    this.bg.fillRoundedRect(-w / 2, 0, w, h / 2, 12);
    this.bg.lineStyle(2, COLORS.gold, 0.95);
    this.bg.strokeRoundedRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, 11);
    this.bg.lineStyle(1, COLORS.goldSoft, 0.4);
    this.bg.strokeRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 9);
    this.glow.clear();
    if (this.primaryText) this.primaryText.setColor(HEX.cream);
    if (this.secondaryText) this.secondaryText.setColor(HEX.textSub);
  }

  _drawHover() {
    const w = this.btnWidth;
    const h = this.btnHeight;
    this.bg.clear();
    this.bg.fillStyle(COLORS.panelLight, 1);
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    this.bg.fillStyle(COLORS.gold, 0.18);
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    this.bg.lineStyle(2, COLORS.goldSoft, 1);
    this.bg.strokeRoundedRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, 11);

    this.glow.clear();
    this.glow.lineStyle(6, COLORS.gold, 0.18);
    this.glow.strokeRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 14);

    if (this.primaryText) this.primaryText.setColor(HEX.goldSoft);
  }

  _setVisualEnabled(enabled) {
    this.setAlpha(enabled ? 1 : 0.45);
  }
}
