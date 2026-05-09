/**
 * Tooltip：场景级共享的 hover 提示
 *
 * 设计：
 *   - 一个场景只创建一个 Tooltip 实例（通过 getOrCreateTooltip）
 *   - 任意 UI 调用 tooltip.show(x, y, title, desc) / tooltip.hide()
 *   - 不依赖 DOM，纯 Phaser 渲染，深色面板 + 金边
 */
import Phaser from 'phaser';
import { COLORS, HEX, FONTS } from '../config/constants.js';

const PADDING_X = 12;
const PADDING_Y = 10;
const MAX_WIDTH = 220;

class Tooltip {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setDepth(9999).setVisible(false);
    this.bg = scene.add.graphics();
    this.titleText = scene.add.text(PADDING_X, PADDING_Y, '', {
      fontFamily: FONTS.display,
      fontSize: '14px',
      color: HEX.gold,
      wordWrap: { width: MAX_WIDTH - PADDING_X * 2, useAdvancedWrap: true },
    });
    this.descText = scene.add.text(PADDING_X, PADDING_Y + 18, '', {
      fontFamily: FONTS.body,
      fontSize: '12px',
      color: HEX.cream,
      wordWrap: { width: MAX_WIDTH - PADDING_X * 2, useAdvancedWrap: true },
    });
    this.container.add([this.bg, this.titleText, this.descText]);
  }

  /**
   * 在某个屏幕坐标上方显示 tooltip
   */
  show(anchorX, anchorY, title, desc) {
    this.titleText.setText(title || '');
    this.descText.setText(desc || '');

    /* 临时让文本布局，再算尺寸 */
    const titleW = this.titleText.width;
    const descW = this.descText.width;
    const contentW = Math.min(MAX_WIDTH, Math.max(titleW, descW) + PADDING_X * 2);
    const contentH = PADDING_Y + this.titleText.height + 4 + this.descText.height + PADDING_Y;

    this.bg.clear();
    this.bg.fillStyle(0x0c0908, 0.95);
    this.bg.fillRoundedRect(0, 0, contentW, contentH, 10);
    this.bg.lineStyle(2, COLORS.gold, 0.9);
    this.bg.strokeRoundedRect(1, 1, contentW - 2, contentH - 2, 9);
    this.bg.lineStyle(1, COLORS.goldDeep, 0.4);
    this.bg.strokeRoundedRect(5, 5, contentW - 10, contentH - 10, 7);

    /* 默认显示在 anchor 上方居中；超出屏幕则翻转到下方/夹在边界 */
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    let x = anchorX - contentW / 2;
    let y = anchorY - contentH - 16;
    if (y < 8) y = anchorY + 24;
    if (x < 8) x = 8;
    if (x + contentW > w - 8) x = w - 8 - contentW;
    if (y + contentH > h - 8) y = h - 8 - contentH;

    this.container.setPosition(x, y);
    this.container.setAlpha(1);
    this.container.setVisible(true);
  }

  hide() {
    this.container.setVisible(false);
  }
}

export function getOrCreateTooltip(scene) {
  if (!scene.__tooltip || scene.__tooltip.scene !== scene) {
    scene.__tooltip = new Tooltip(scene);
  }
  return scene.__tooltip;
}

/**
 * 给一个 GameObject 绑定 hover tooltip
 * @param {Phaser.GameObjects.GameObject} target  必须已 setInteractive
 * @param {() => { title: string, desc: string }} provider
 */
export function attachTooltip(target, provider) {
  const scene = target.scene;
  const tooltip = getOrCreateTooltip(scene);

  target.on('pointerover', () => {
    const data = provider() || {};
    /* 用对象屏幕中心点作为锚点 */
    const b = target.getBounds ? target.getBounds() : null;
    const anchorX = b ? b.centerX : target.x;
    const anchorY = b ? b.top : target.y;
    tooltip.show(anchorX, anchorY, data.title, data.desc);
  });
  target.on('pointermove', () => {
    /* 光标移动时不重画 tooltip 位置（保持在徽章上方），避免抖动 */
  });
  target.on('pointerout', () => tooltip.hide());

  /* 兜底：场景关闭时隐藏 */
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => tooltip.hide());
}

export default Tooltip;
