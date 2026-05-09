/**
 * LanguageToggleButton：中英语言切换药丸按钮
 *
 * 视觉：两段药丸，当前语言段高亮金色
 * 行为：
 *   - 点击切换 → setLang(lang) → onChanged(lang) 回调
 *   - 默认 onChanged 不传时，自动 scene.scene.restart()
 *   - BattleScene 等不希望重启的场景，可传自定义 onChanged 做软刷新
 */
import Phaser from 'phaser';
import { COLORS, HEX, FONTS } from '../config/constants.js';
import { getLang, setLang } from '../systems/localizationSystem.js';

const SEG_W = 60;
const HEIGHT = 30;

export default class LanguageToggleButton extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x, y
   * @param {{ onChanged?: (lang: 'zh'|'en') => void }} options
   */
  constructor(scene, x, y, options = {}) {
    super(scene, x, y);
    scene.add.existing(this);

    this.options = options;
    this.setSize(SEG_W * 2, HEIGHT);

    this.bg = scene.add.graphics();
    this.add(this.bg);

    this.zhText = scene.add
      .text(-SEG_W / 2, 0, '中文', {
        fontFamily: FONTS.display,
        fontSize: '14px',
        color: HEX.cream,
      })
      .setOrigin(0.5);
    this.add(this.zhText);

    this.enText = scene.add
      .text(SEG_W / 2, 0, 'EN', {
        fontFamily: FONTS.display,
        fontSize: '14px',
        color: HEX.cream,
      })
      .setOrigin(0.5);
    this.add(this.enText);

    /* 两个分段独立 hit area */
    this._zhHit = this._makeSegment(-SEG_W, 'zh');
    this._enHit = this._makeSegment(0, 'en');

    this._draw();
  }

  _makeSegment(offsetX, lang) {
    const rect = this.scene.add
      .zone(offsetX, -HEIGHT / 2, SEG_W, HEIGHT)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true });
    this.add(rect);
    rect.on('pointerover', () => {
      this._hoverLang = lang;
      this._draw();
    });
    rect.on('pointerout', () => {
      this._hoverLang = null;
      this._draw();
    });
    rect.on('pointerup', () => this._handleClick(lang));
    return rect;
  }

  _handleClick(lang) {
    const prev = getLang();
    if (prev === lang) return;
    setLang(lang);
    this._draw();
    if (typeof this.options.onChanged === 'function') {
      this.options.onChanged(lang);
    } else {
      /* 默认行为：刷新当前场景 */
      this.scene.scene.restart();
    }
  }

  /* ============ 渲染 ============ */
  _draw() {
    const cur = getLang();
    const w = SEG_W * 2;
    this.bg.clear();
    /* 整体底 */
    this.bg.fillStyle(COLORS.panel, 0.92);
    this.bg.fillRoundedRect(-w / 2, -HEIGHT / 2, w, HEIGHT, HEIGHT / 2);
    this.bg.lineStyle(1, COLORS.gold, 0.7);
    this.bg.strokeRoundedRect(-w / 2 + 0.5, -HEIGHT / 2 + 0.5, w - 1, HEIGHT - 1, HEIGHT / 2);

    /* 当前激活段填充金色 */
    const activeX = cur === 'zh' ? -w / 2 : 0;
    this.bg.fillStyle(COLORS.gold, 0.32);
    this.bg.fillRoundedRect(activeX, -HEIGHT / 2, SEG_W, HEIGHT, HEIGHT / 2);
    this.bg.lineStyle(1, COLORS.goldSoft, 1);
    this.bg.strokeRoundedRect(activeX + 0.5, -HEIGHT / 2 + 0.5, SEG_W - 1, HEIGHT - 1, HEIGHT / 2);

    /* hover 段轻微高亮 */
    if (this._hoverLang && this._hoverLang !== cur) {
      const hoverX = this._hoverLang === 'zh' ? -w / 2 : 0;
      this.bg.fillStyle(COLORS.gold, 0.12);
      this.bg.fillRoundedRect(hoverX, -HEIGHT / 2, SEG_W, HEIGHT, HEIGHT / 2);
    }

    this.zhText.setColor(cur === 'zh' ? HEX.goldSoft : HEX.cream);
    this.enText.setColor(cur === 'en' ? HEX.goldSoft : HEX.cream);
  }
}

export const LANG_TOGGLE_SIZE = { width: SEG_W * 2, height: HEIGHT };
