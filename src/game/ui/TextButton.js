/**
 * TextButton：木牌按钮（中文单语版）
 * - 仅显示主标题，原副标题字段已下线
 * - hover glow 紧贴按钮本体（3px 外圈），不再外扩；scale 反馈走 BaseButton
 */
import { COLORS, HEX, FONTS, TEXTURES } from '../config/constants.js';
import { hasRealTexture } from '../systems/assetResolver.js';
import BaseButton from './BaseButton.js';

const FRAME_RADIUS = 12;
const GLOW_OUTSET = 3;
const GLOW_STROKE = 3;

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

    /* glow：始终在底图之上，但只画外圈金线，不会盖住文字 */
    this.glow = scene.add.graphics();
    this.add(this.glow);

    const primary = options.primaryLabel ?? '';

    /* 文字始终居中（origin 0.5 + 坐标 (0, 0)）；可选 1px 黑色描边提升可读性 */
    this.primaryText = scene.add
      .text(0, 0, primary, {
        fontFamily: FONTS.display,
        fontSize: options.primaryFontSize ?? '24px',
        color: HEX.cream,
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    this.add(this.primaryText);

    this._drawNormal();
  }

  setLabel(primary) {
    if (typeof primary === 'string') this.primaryText.setText(primary);
    return this;
  }

  /* ===== 视觉：normal / hover ===== */

  _drawNormal() {
    const w = this.btnWidth;
    const h = this.btnHeight;
    this.glow.clear();
    if (this.bgImg) {
      this.bgImg.clearTint();
    } else {
      this.bg.clear();
      this.bg.fillStyle(COLORS.wood, 1);
      this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, FRAME_RADIUS);
      this.bg.fillStyle(COLORS.woodDark, 0.4);
      this.bg.fillRoundedRect(-w / 2, 0, w, h / 2, FRAME_RADIUS);
      this.bg.lineStyle(2, COLORS.gold, 0.95);
      this.bg.strokeRoundedRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, FRAME_RADIUS - 1);
      this.bg.lineStyle(1, COLORS.goldSoft, 0.4);
      this.bg.strokeRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, FRAME_RADIUS - 3);
    }
    if (this.primaryText) this.primaryText.setColor(HEX.cream);
  }

  _drawHover() {
    const w = this.btnWidth;
    const h = this.btnHeight;
    if (this.bgImg) {
      /* 真图按钮：tint 提亮 */
      this.bgImg.setTint(0xfff1cf);
    } else {
      /* 占位 graphics：内层填亮，仍只画一圈细金线 */
      this.bg.clear();
      this.bg.fillStyle(COLORS.panelLight, 1);
      this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, FRAME_RADIUS);
      this.bg.fillStyle(COLORS.gold, 0.18);
      this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, FRAME_RADIUS);
      this.bg.lineStyle(2, COLORS.goldSoft, 1);
      this.bg.strokeRoundedRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, FRAME_RADIUS - 1);
    }

    /* 外圈 glow：紧贴按钮 3px、半透明金色，不再"飘在外面" */
    this.glow.clear();
    this.glow.lineStyle(GLOW_STROKE, COLORS.gold, 0.45);
    this.glow.strokeRoundedRect(
      -w / 2 - GLOW_OUTSET,
      -h / 2 - GLOW_OUTSET,
      w + GLOW_OUTSET * 2,
      h + GLOW_OUTSET * 2,
      FRAME_RADIUS + GLOW_OUTSET
    );

    if (this.primaryText) this.primaryText.setColor(HEX.goldSoft);
  }

  _setVisualEnabled(enabled) {
    this.setAlpha(enabled ? 1 : 0.45);
  }
}
