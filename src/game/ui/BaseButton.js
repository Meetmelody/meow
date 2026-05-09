/**
 * BaseButton：可复用的"可点击 Container"基类
 * - 完整按钮区域作为命中区域；鼠标 hover 自动切换到 hand cursor
 * - hover/down/up 触发 scale 微动画，反馈贴合按钮本体
 * - 子类（TextButton 等）只需实现 _drawNormal/_drawHover/_setVisualEnabled
 */
import Phaser from 'phaser';

const HOVER_SCALE = 1.03;
const PRESS_SCALE = 0.97;

export default class BaseButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, height) {
    super(scene, x, y);
    this.btnWidth = width;
    this.btnHeight = height;
    this._enabled = true;
    this._isHover = false;
    this._isDown = false;
    this._onClick = null;
    this._scaleTween = null;

    scene.add.existing(this);
    this.setSize(width, height);

    /* 整个按钮矩形作为命中区域 + hand cursor 让用户感知边界 */
    this.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    this.on('pointerover', () => {
      if (!this._enabled) return;
      this._isHover = true;
      this._applyVisual();
      this._tweenScaleTo(HOVER_SCALE, 120);
    });
    this.on('pointerout', () => {
      const wasDown = this._isDown;
      this._isHover = false;
      this._isDown = false;
      this._applyVisual();
      this._tweenScaleTo(1, wasDown ? 100 : 140);
    });
    this.on('pointerdown', () => {
      if (!this._enabled) return;
      this._isDown = true;
      this._applyVisual();
      this._tweenScaleTo(PRESS_SCALE, 80);
    });
    this.on('pointerup', () => {
      if (!this._enabled) return;
      const wasHover = this._isHover;
      this._isDown = false;
      this._applyVisual();
      this._tweenScaleTo(wasHover ? HOVER_SCALE : 1, 100);
      if (wasHover && this._onClick) this._onClick();
    });
  }

  onClick(cb) {
    this._onClick = cb;
    return this;
  }

  setEnabled(enabled) {
    this._enabled = !!enabled;
    if (!enabled) {
      this._isHover = false;
      this._isDown = false;
      this._tweenScaleTo(1, 80);
    }
    this._applyVisual();
    return this;
  }

  isEnabled() {
    return this._enabled;
  }

  /* ===== 内部 ===== */
  _applyVisual() {
    if (!this._enabled) {
      this._setVisualEnabled(false);
      return;
    }
    this._setVisualEnabled(true);
    if (this._isHover) this._drawHover();
    else this._drawNormal();
  }

  /**
   * 仅追踪 scale 这一条 tween；不触碰 alpha/y 等场景入场动画
   */
  _tweenScaleTo(target, duration) {
    if (this._scaleTween) this._scaleTween.stop();
    this._scaleTween = this.scene.tweens.add({
      targets: this,
      scaleX: target,
      scaleY: target,
      duration,
      ease: 'Sine.easeOut',
    });
  }

  _drawNormal() {}
  _drawHover() {}
  _setVisualEnabled(_enabled) {}
}
