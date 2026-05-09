/**
 * TextButton：木牌按钮（中文单语版）
 * - 仅显示主标题，原副标题字段已下线
 * - 重启 i18n 时再恢复 secondaryLabel 双行排版
 */
import { COLORS, HEX, FONTS, TEXTURES } from '../config/constants.js';
import { hasRealTexture } from '../systems/assetResolver.js';
import BaseButton from './BaseButton.js';

export default class TextButton extends BaseButton {
  constructor(scene, x, y, options = {}) {
    const width = options.width ?? 240;
    const height = options.height ?? 64;
    super(scene, x, y, width, height);

    /* 底图：有真图（button_wood.png）→ 直接拉伸到按钮尺寸；否则走 Graphics 占位 */
    if (hasRealTexture(scene, TEXTURES.BUTTON_WOOD)) {
      this.bgImg = scene.add.image(0, 0, TEXTURES.BUTTON_WOOD).setOrigin(0.5);
      this.bgImg.setDisplaySize(width, height);
      this.add(this.bgImg);
    } else {
      this.bg = scene.add.graphics();
      this.add(this.bg);
    }

    this.glow = scene.add.graphics();
    this.add(this.glow);

    const primary = options.primaryLabel ?? '';

    this.primaryText = scene.add
      .text(0, 0, primary, {
        fontFamily: FONTS.display,
        fontSize: options.primaryFontSize ?? '24px',
        color: HEX.cream,
      })
      .setOrigin(0.5);
    this.add(this.primaryText);

    this._drawNormal();
  }

  setLabel(primary) {
    if (typeof primary === 'string') this.primaryText.setText(primary);
    return this;
  }

  _drawNormal() {
    const w = this.btnWidth;
    const h = this.btnHeight;
    this.glow.clear();
    if (this.bgImg) {
      this.bgImg.clearTint();
    } else {
      this.bg.clear();
      this.bg.fillStyle(COLORS.wood, 1);
      this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
      this.bg.fillStyle(COLORS.woodDark, 0.4);
      this.bg.fillRoundedRect(-w / 2, 0, w, h / 2, 12);
      this.bg.lineStyle(2, COLORS.gold, 0.95);
      this.bg.strokeRoundedRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, 11);
      this.bg.lineStyle(1, COLORS.goldSoft, 0.4);
      this.bg.strokeRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 9);
    }
    if (this.primaryText) this.primaryText.setColor(HEX.cream);
  }

  _drawHover() {
    const w = this.btnWidth;
    const h = this.btnHeight;
    if (this.bgImg) {
      /* 真图按钮：用淡金色 tint 提亮 + 外圈金光，不再画矩形覆盖 */
      this.bgImg.setTint(0xfff1cf);
      this.glow.clear();
      this.glow.lineStyle(6, COLORS.gold, 0.28);
      this.glow.strokeRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 14);
    } else {
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
    }

    if (this.primaryText) this.primaryText.setColor(HEX.goldSoft);
  }

  _setVisualEnabled(enabled) {
    this.setAlpha(enabled ? 1 : 0.45);
  }
}
