/**
 * RoomNodeView：地图房间节点卡
 *
 * 视觉层级：
 *   COMBAT  红色 icon，金色边框
 *   EVENT   蓝色 icon，金色边框
 *   BOSS    紫色 icon，紫金双层边框 + 呼吸光环 + "BOSS" 徽章
 *
 * 状态：
 *   LOCKED   灰色描边、降低透明度、显示锁文案
 *   UNLOCKED 金色描边，可 hover/点击
 *   CLEARED  绿色内描边 + ✓ 勾选 + 已清理文案
 */
import Phaser from 'phaser';
import { COLORS, HEX, FONTS, ROOM_STATUS, ROOM_TYPE } from '../config/constants.js';
import { t, getName, getDesc } from '../systems/localizationSystem.js';

const NODE_W = 200;
const NODE_H = 240;

const TYPE_COLOR = {
  [ROOM_TYPE.COMBAT]: 0xe05a4d,
  [ROOM_TYPE.EVENT]: 0x9bb8d8,
  [ROOM_TYPE.BOSS]: 0x9c6bb5,
  [ROOM_TYPE.REST]: 0xe89455,
};

const STATUS_KEY = {
  [ROOM_STATUS.LOCKED]: 'nodeStatusLocked',
  [ROOM_STATUS.UNLOCKED]: 'nodeStatusUnlocked',
  [ROOM_STATUS.CLEARED]: 'nodeStatusCleared',
};

const TYPE_KEY = {
  [ROOM_TYPE.COMBAT]: 'nodeTypeCombat',
  [ROOM_TYPE.EVENT]: 'nodeTypeEvent',
  [ROOM_TYPE.BOSS]: 'nodeTypeBoss',
  [ROOM_TYPE.REST]: 'nodeTypeRest',
};

export default class RoomNodeView extends Phaser.GameObjects.Container {
  constructor(scene, x, y, roomDef, status, options = {}) {
    super(scene, x, y);
    scene.add.existing(this);
    this.roomDef = roomDef;
    this.status = status;
    this._onClick = options.onClick ?? null;
    this._isHover = false;
    this._isBoss = roomDef.type === ROOM_TYPE.BOSS;

    this.setSize(NODE_W, NODE_H);

    /* Boss 专属：呼吸光晕（垫底）*/
    if (this._isBoss) {
      this.bossHalo = scene.add.graphics();
      this.add(this.bossHalo);
      this._drawBossHalo();
      this._startBossPulse();
    }

    this.bg = scene.add.graphics();
    this.add(this.bg);

    this.glow = scene.add.graphics();
    this.add(this.glow);

    this.iconCircle = scene.add.graphics();
    this.add(this.iconCircle);

    this.iconText = scene.add
      .text(0, -NODE_H / 2 + 60, this._iconChar(), {
        fontFamily: FONTS.display,
        fontSize: this._isBoss ? '40px' : '34px',
        color: this._isBoss ? '#d6a4ee' : HEX.gold,
      })
      .setOrigin(0.5);
    this.add(this.iconText);

    this.nameText = scene.add
      .text(0, -10, getName(roomDef), {
        fontFamily: FONTS.display,
        fontSize: this._isBoss ? '22px' : '20px',
        color: this._isBoss ? '#f0d4ff' : HEX.textMain,
      })
      .setOrigin(0.5);
    this.add(this.nameText);

    /* 类型徽章；Boss 用更夺目的 BOSS 徽章 */
    this.typeBadge = scene.add
      .text(0, 16, t(TYPE_KEY[roomDef.type] ?? 'nodeTypeCombat'), {
        fontFamily: FONTS.body,
        fontSize: this._isBoss ? '13px' : '11px',
        color: this._isBoss ? '#d6a4ee' : HEX.gold,
        letterSpacing: this._isBoss ? 6 : 2,
        fontStyle: this._isBoss ? 'bold' : 'normal',
      })
      .setOrigin(0.5);
    this.add(this.typeBadge);

    this.descText = scene.add
      .text(0, 52, getDesc(roomDef), {
        fontFamily: FONTS.body,
        fontSize: '11px',
        color: HEX.textSub,
        align: 'center',
        wordWrap: { width: NODE_W - 24, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0);
    this.add(this.descText);

    /* 已清理 ✓ */
    this.checkText = scene.add
      .text(NODE_W / 2 - 22, -NODE_H / 2 + 22, '✓', {
        fontFamily: FONTS.display,
        fontSize: '22px',
        color: '#7ad19b',
      })
      .setOrigin(0.5)
      .setVisible(false);
    this.add(this.checkText);

    this.statusText = scene.add
      .text(0, NODE_H / 2 - 18, '', {
        fontFamily: FONTS.body,
        fontSize: '11px',
        color: HEX.textSub,
      })
      .setOrigin(0.5);
    this.add(this.statusText);

    this.setInteractive(
      new Phaser.Geom.Rectangle(-NODE_W / 2, -NODE_H / 2, NODE_W, NODE_H),
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
      if (this._onClick) this._onClick(this.roomDef, this.status);
    });

    this._refreshVisual();
  }

  setStatus(status) {
    this.status = status;
    this._refreshVisual();
  }

  _iconChar() {
    if (this.roomDef.type === ROOM_TYPE.BOSS) return '☾';
    if (this.roomDef.type === ROOM_TYPE.EVENT) return '★';
    return '◈';
  }

  /* ============ Boss 呼吸光晕 ============ */
  _drawBossHalo() {
    if (!this.bossHalo) return;
    this.bossHalo.clear();
    /* 外层暗紫光环 */
    this.bossHalo.fillStyle(0x9c6bb5, 0.16);
    this.bossHalo.fillRoundedRect(-NODE_W / 2 - 12, -NODE_H / 2 - 12, NODE_W + 24, NODE_H + 24, 18);
    /* 内层暗红 */
    this.bossHalo.fillStyle(0xc14242, 0.08);
    this.bossHalo.fillRoundedRect(-NODE_W / 2 - 6, -NODE_H / 2 - 6, NODE_W + 12, NODE_H + 12, 14);
  }

  _startBossPulse() {
    if (!this.bossHalo) return;
    this.scene.tweens.add({
      targets: this.bossHalo,
      alpha: { from: 1, to: 0.55 },
      duration: 1300,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  /* ============ 主刷新 ============ */
  _refreshVisual() {
    const tint = TYPE_COLOR[this.roomDef.type] ?? 0xe8b84a;
    const isLocked = this.status === ROOM_STATUS.LOCKED;
    const isCleared = this.status === ROOM_STATUS.CLEARED;
    const baseStrokeColor = this._isBoss ? 0x9c6bb5 : COLORS.gold;
    const baseStrokeAlpha = isLocked ? 0.55 : 0.95;

    this.bg.clear();
    this.bg.fillStyle(COLORS.panel, 0.95);
    this.bg.fillRoundedRect(-NODE_W / 2, -NODE_H / 2, NODE_W, NODE_H, 14);
    /* 外金/紫描边 */
    this.bg.lineStyle(this._isBoss ? 3 : 2, baseStrokeColor, baseStrokeAlpha);
    this.bg.strokeRoundedRect(-NODE_W / 2 + 1, -NODE_H / 2 + 1, NODE_W - 2, NODE_H - 2, 13);
    /* 内描边：cleared → 绿；boss → 金；其它 → 暗金 */
    let innerColor = COLORS.goldDeep;
    let innerAlpha = 0.4;
    if (isCleared) {
      innerColor = 0x6dbb84;
      innerAlpha = 0.95;
    } else if (this._isBoss) {
      innerColor = COLORS.gold;
      innerAlpha = 0.7;
    }
    this.bg.lineStyle(1, innerColor, innerAlpha);
    this.bg.strokeRoundedRect(-NODE_W / 2 + 6, -NODE_H / 2 + 6, NODE_W - 12, NODE_H - 12, 10);

    this.iconCircle.clear();
    this.iconCircle.fillStyle(0x000000, 0.45);
    this.iconCircle.fillCircle(0, -NODE_H / 2 + 60, this._isBoss ? 32 : 28);
    this.iconCircle.lineStyle(this._isBoss ? 2 : 1, tint, this._isBoss ? 0.95 : 0.75);
    this.iconCircle.strokeCircle(0, -NODE_H / 2 + 60, this._isBoss ? 32 : 28);

    /* 状态行 */
    this.statusText.setText(t(STATUS_KEY[this.status] ?? 'nodeStatusLocked'));
    this.statusText.setColor(
      isCleared ? '#7ad19b' : isLocked ? HEX.textMuted : this._isBoss ? '#d6a4ee' : HEX.goldSoft
    );

    /* 已清理 ✓ */
    this.checkText.setVisible(isCleared);

    /* hover 高光 */
    this.glow.clear();
    if (this._isHover && !isLocked) {
      const glowColor = this._isBoss ? 0x9c6bb5 : COLORS.gold;
      this.glow.lineStyle(this._isBoss ? 8 : 6, glowColor, 0.32);
      this.glow.strokeRoundedRect(
        -NODE_W / 2 - 4,
        -NODE_H / 2 - 4,
        NODE_W + 8,
        NODE_H + 8,
        16
      );
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.04,
        scaleY: 1.04,
        duration: 120,
        ease: 'Sine.easeOut',
      });
    } else {
      this.scene.tweens.add({
        targets: this,
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: 'Sine.easeOut',
      });
    }

    /* locked 半透明，但 boss 始终保持一定可见度，让玩家看到"终点" */
    if (isLocked) {
      this.setAlpha(this._isBoss ? 0.7 : 0.55);
    } else {
      this.setAlpha(1);
    }

    /* Boss halo：cleared 时降淡；locked 时也保留呼吸 */
    if (this.bossHalo) {
      this.bossHalo.setVisible(true);
      if (isCleared) this.bossHalo.setAlpha(0.3);
    }
  }

}

export const ROOM_NODE_SIZE = { width: NODE_W, height: NODE_H };
