/**
 * CardView：手牌中的单张卡牌（中文单语版）
 * - 顶部费用圆章，中部图标占位，底部羊皮纸描述
 * - hover 时上浮 + 金色发光，点击触发 onPlay
 */
import Phaser from 'phaser';
import { COLORS, HEX, FONTS, CARD_TYPE, TEXTURES } from '../config/constants.js';
import { getName, getDesc } from '../systems/localizationSystem.js';
import { hasRealTexture } from '../systems/assetResolver.js';

const CARD_W = 160;
const CARD_H = 220;

const TYPE_COLOR = {
  [CARD_TYPE.ATTACK]: 0xc14242,
  [CARD_TYPE.SKILL]: 0x6b8eb5,
  [CARD_TYPE.SNACK]: 0xe89455,
  [CARD_TYPE.TRICK]: 0x9c6bb5,
  [CARD_TYPE.POWER]: 0xa07a26,
};

const TYPE_LABEL = {
  attack: '攻击',
  skill: '技能',
  snack: '零食',
  trick: '捣乱',
  power: '能力',
};

export default class CardView extends Phaser.GameObjects.Container {
  constructor(scene, x, y, cardDef, options = {}) {
    super(scene, x, y);
    this.scene = scene;
    this.cardDef = cardDef;
    this.handIndex = options.handIndex ?? -1;
    this.playable = options.playable !== false;
    this._isHover = false;
    this._onPlay = null;
    this._baseY = y;

    scene.add.existing(this);
    this.setSize(CARD_W, CARD_H);

    this._build();
    this._bindInteractions();
    this._refreshVisual();
  }

  setHandIndex(idx) {
    this.handIndex = idx;
    return this;
  }

  setBaseY(y) {
    this._baseY = y;
    if (!this._isHover) this.y = y;
    return this;
  }

  setPlayable(playable) {
    this.playable = !!playable;
    this._refreshVisual();
    return this;
  }

  onPlay(cb) {
    this._onPlay = cb;
    return this;
  }

  /* ===== 内部绘制 ===== */
  _build() {
    /* 阴影 */
    this.shadow = this.scene.add.graphics();
    this.shadow.fillStyle(0x000000, 0.5);
    this.shadow.fillRoundedRect(-CARD_W / 2 + 4, -CARD_H / 2 + 8, CARD_W, CARD_H, 12);
    this.add(this.shadow);

    /* 卡牌底框：有真图（card_frame.png）→ 直接拉伸贴图，跳过 Graphics 描边和内层装饰
       （真图通常已自带金边和插画区，再叠 Graphics 会撞色撞线）*/
    this._useImageFrame = hasRealTexture(this.scene, TEXTURES.CARD_FRAME);
    if (this._useImageFrame) {
      this.frameImg = this.scene.add.image(0, 0, TEXTURES.CARD_FRAME).setOrigin(0.5);
      this.frameImg.setDisplaySize(CARD_W, CARD_H);
      this.add(this.frameImg);
    } else {
      /* 占位 Graphics 路径 */
      this.frame = this.scene.add.graphics();
      this.add(this.frame);

      this.typeBar = this.scene.add.graphics();
      this.add(this.typeBar);

      this.artBg = this.scene.add.graphics();
      this.add(this.artBg);
    }

    /* 名称 */
    this.nameText = this.scene.add
      .text(0, -CARD_H / 2 + 30, getName(this.cardDef), {
        fontFamily: FONTS.display,
        fontSize: '16px',
        color: HEX.textMain,
        align: 'center',
      })
      .setOrigin(0.5);
    this.add(this.nameText);

    /* 类型标签（小字）*/
    const typeLabel = TYPE_LABEL[this.cardDef.type] ?? this.cardDef.type;
    this.typeText = this.scene.add
      .text(0, 32, typeLabel, {
        fontFamily: FONTS.body,
        fontSize: '11px',
        color: HEX.textSub,
        align: 'center',
      })
      .setOrigin(0.5);
    this.add(this.typeText);

    /* 描述 */
    this.descText = this.scene.add
      .text(0, CARD_H / 2 - 38, getDesc(this.cardDef), {
        fontFamily: FONTS.body,
        fontSize: '12px',
        color: '#3a2a1c',
        align: 'center',
        wordWrap: { width: CARD_W - 24, useAdvancedWrap: true },
      })
      .setOrigin(0.5);
    this.add(this.descText);

    /* 费用圆章 */
    this.costBg = this.scene.add.graphics();
    this.add(this.costBg);
    this.costText = this.scene.add
      .text(-CARD_W / 2 + 18, -CARD_H / 2 + 18, String(this.cardDef.cost), {
        fontFamily: FONTS.display,
        fontSize: '20px',
        color: HEX.textMain,
      })
      .setOrigin(0.5);
    this.add(this.costText);

    this._drawStatic();
  }

  _drawStatic() {
    const tColor = TYPE_COLOR[this.cardDef.type] ?? 0x8a7559;

    /* 占位路径下绘制木框 + 类型色条 + 插画底；用真图时全部跳过 */
    if (this.frame) {
      this.frame.clear();
      this.frame.fillStyle(COLORS.panel, 1);
      this.frame.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 12);
      this.frame.fillStyle(0xefe2c2, 0.96);
      this.frame.fillRoundedRect(-CARD_W / 2 + 8, -CARD_H / 2 + 8, CARD_W - 16, CARD_H - 16, 9);
      this.frame.lineStyle(2, COLORS.gold, 1);
      this.frame.strokeRoundedRect(-CARD_W / 2 + 1, -CARD_H / 2 + 1, CARD_W - 2, CARD_H - 2, 11);
      this.frame.lineStyle(1, COLORS.goldDeep, 0.55);
      this.frame.strokeRoundedRect(-CARD_W / 2 + 8, -CARD_H / 2 + 8, CARD_W - 16, CARD_H - 16, 9);
    }

    if (this.typeBar) {
      this.typeBar.clear();
      this.typeBar.fillStyle(tColor, 0.5);
      this.typeBar.fillRect(-CARD_W / 2 + 8, -CARD_H / 2 + 56, CARD_W - 16, 4);
    }

    if (this.artBg) {
      this.artBg.clear();
      this.artBg.fillStyle(tColor, 0.18);
      this.artBg.fillRoundedRect(-CARD_W / 2 + 16, -10, CARD_W - 32, 76, 8);
      this.artBg.lineStyle(1, tColor, 0.5);
      this.artBg.strokeRoundedRect(-CARD_W / 2 + 16, -10, CARD_W - 32, 76, 8);
    }

    /* 费用圆章：始终绘制（攻防数值是核心信息）*/
    this.costBg.clear();
    this.costBg.fillStyle(0x1c1410, 0.95);
    this.costBg.fillCircle(-CARD_W / 2 + 18, -CARD_H / 2 + 18, 18);
    this.costBg.lineStyle(2, COLORS.gold, 1);
    this.costBg.strokeCircle(-CARD_W / 2 + 18, -CARD_H / 2 + 18, 18);
  }

  _bindInteractions() {
    this.setInteractive(
      new Phaser.Geom.Rectangle(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H),
      Phaser.Geom.Rectangle.Contains
    );
    this.on('pointerover', () => {
      this._isHover = true;
      this._refreshVisual();
    });
    this.on('pointerout', () => {
      this._isHover = false;
      this._refreshVisual();
    });
    this.on('pointerup', () => {
      if (!this.playable) return;
      if (this._onPlay) this._onPlay(this.handIndex, this.cardDef);
    });
  }

  _refreshVisual() {
    const targetY = this._isHover && this.playable ? this._baseY - 24 : this._baseY;
    const targetScale = this._isHover && this.playable ? 1.04 : 1;
    this.scene.tweens.add({
      targets: this,
      y: targetY,
      scaleX: targetScale,
      scaleY: targetScale,
      duration: 120,
      ease: 'Sine.easeOut',
    });
    if (!this.playable) {
      this.setAlpha(0.55);
    } else {
      this.setAlpha(this._isHover ? 1 : 0.96);
    }
    /* hover 字体颜色微调（费用环境），不重画底框 */
    if (this.costText) {
      this.costText.setColor(this._isHover ? HEX.goldSoft : HEX.textMain);
    }
    /* 简单 glow：放在最下层避免遮罩描述文字 */
    if (!this.glow) {
      this.glow = this.scene.add.graphics();
      this.addAt(this.glow, 1);
    }
    this.glow.clear();
    if (this._isHover && this.playable) {
      this.glow.lineStyle(8, COLORS.gold, 0.22);
      this.glow.strokeRoundedRect(-CARD_W / 2 - 4, -CARD_H / 2 - 4, CARD_W + 8, CARD_H + 8, 14);
    }
  }

}

export const CARD_VIEW_SIZE = { width: CARD_W, height: CARD_H };
