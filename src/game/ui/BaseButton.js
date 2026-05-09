/**
 * BaseButton：可复用的"可点击 Container"基类
 * - 处理 hover/down 视觉切换、enable/disable、点击回调
 * - 子类（TextButton 等）只需实现 _drawNormal/_drawHover/_setVisualEnabled
 */
import Phaser from 'phaser';

export default class BaseButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, height) {
    super(scene, x, y);
    this.btnWidth = width;
    this.btnHeight = height;
    this._enabled = true;
    this._isHover = false;
    this._isDown = false;
    this._onClick = null;

    scene.add.existing(this);

    this.setSize(width, height);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );

    this.on('pointerover', () => {
      if (!this._enabled) return;
      this._isHover = true;
      this._applyVisual();
    });
    this.on('pointerout', () => {
      this._isHover = false;
      this._isDown = false;
      this._applyVisual();
    });
    this.on('pointerdown', () => {
      if (!this._enabled) return;
      this._isDown = true;
      this._applyVisual();
    });
    this.on('pointerup', () => {
      if (!this._enabled) return;
      this._isDown = false;
      this._applyVisual();
      if (this._isHover && this._onClick) this._onClick();
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
    }
    this._applyVisual();
    return this;
  }

  isEnabled() {
    return this._enabled;
  }

  _applyVisual() {
    if (!this._enabled) {
      this._setVisualEnabled(false);
      return;
    }
    this._setVisualEnabled(true);
    if (this._isHover) this._drawHover();
    else this._drawNormal();
  }

  _drawNormal() {}
  _drawHover() {}
  _setVisualEnabled(_enabled) {}
}
