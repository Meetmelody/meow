/**
 * MapScene：宅邸地图
 * - 5 个房间节点横向排布
 * - 客厅 unlocked 可点击 → BattleScene；其它 locked → DemoClear 提示
 */
import Phaser from 'phaser';
import {
  SCENES,
  GAME_WIDTH,
  GAME_HEIGHT,
  HEX,
  COLORS,
  FONTS,
  TEXTURES,
  ROOM_STATUS,
  ROOM_TYPE,
} from '../config/constants.js';
import { t, getName } from '../systems/localizationSystem.js';
import {
  getMap,
  getPlayer,
  isRunStarted,
  isDemoCleared,
  startNewRun,
  saveRun,
} from '../systems/runState.js';
import { getRoomDef } from '../data/rooms.js';
import RoomNodeView from '../ui/RoomNodeView.js';
import TextButton from '../ui/TextButton.js';

export default class MapScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MAP);
  }

  create() {
    /* 兜底：如果直接进入 MapScene 但 run 未启动 */
    if (!isRunStarted()) startNewRun();

    /* 已通关 → 走 DemoClearScene */
    if (isDemoCleared()) {
      this.scene.start(SCENES.DEMO_CLEAR);
      return;
    }

    /* 背景 */
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, TEXTURES.BG_MAP).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    /* 顶栏 */
    this._drawTopBar();

    /* 节点区 */
    this._drawNodes();

    /* 底栏：返回主菜单 */
    new TextButton(this, GAME_WIDTH - 150, GAME_HEIGHT - 50, {
      width: 220,
      height: 56,
      primaryLabel: t('btnBackToMenu'),
      primaryFontSize: '20px',
    }).onClick(() => {
      saveRun();
      this.scene.start(SCENES.MAIN_MENU);
    });

    saveRun();

    /* 入场淡入 */
    this.cameras.main.fadeIn(280, 0, 0, 0);
  }

  _drawTopBar() {
    const bar = this.add.graphics();
    bar.fillStyle(0x000000, 0.55);
    bar.fillRect(0, 0, GAME_WIDTH, 90);
    bar.lineStyle(1, COLORS.gold, 0.4);
    bar.lineBetween(0, 90, GAME_WIDTH, 90);

    this.add
      .text(40, 18, t('title'), {
        fontFamily: FONTS.display,
        fontSize: '28px',
        color: HEX.gold,
      });
    this.add
      .text(40, 56, t('subtitle'), {
        fontFamily: FONTS.body,
        fontSize: '12px',
        color: HEX.textSub,
        letterSpacing: 4,
      });

    const player = getPlayer();
    if (player) {
      this.add
        .text(GAME_WIDTH / 2, 30, `${t('labelHp')} ${player.hp}/${player.maxHp}`, {
          fontFamily: FONTS.display,
          fontSize: '18px',
          color: HEX.hpRed,
        })
        .setOrigin(0.5, 0);
      this.add
        .text(GAME_WIDTH / 2, 56, `${t('labelCoins')}：${player.fishCoins}`, {
          fontFamily: FONTS.body,
          fontSize: '13px',
          color: HEX.goldSoft,
        })
        .setOrigin(0.5, 0);
    }
  }

  _drawNodes() {
    const map = getMap();
    const startX = 140;
    const stepX = (GAME_WIDTH - 280) / Math.max(1, map.length - 1);
    const y = GAME_HEIGHT / 2 + 40;

    map.forEach((node, idx) => {
      const def = getRoomDef(node.roomId);
      if (!def) return;
      const view = new RoomNodeView(
        this,
        startX + stepX * idx,
        y,
        def,
        node.status,
        {
          onClick: (roomDef) => this._enterRoom(roomDef, node.status),
        }
      );
      /* 入场淡入 */
      view.setAlpha(0);
      view.y = y + 16;
      this.tweens.add({
        targets: view,
        alpha: 1,
        y,
        duration: 360,
        delay: 80 * idx,
        ease: 'Sine.easeOut',
      });
    });
  }

  /**
   * 房间进入路由：根据 status + type 分发
   * - locked  → toast 提示，不跳场景
   * - cleared → toast 提示，不重复进入
   * - combat / boss → BattleScene
   * - event → EventScene
   */
  _enterRoom(roomDef, status) {
    if (status === ROOM_STATUS.LOCKED) {
      this._toast(`${getName(roomDef)} · ${t('nodeStatusLocked')}`);
      return;
    }
    if (status === ROOM_STATUS.CLEARED) {
      this._toast(`${getName(roomDef)} · ${t('nodeStatusCleared')}`);
      return;
    }

    saveRun();
    this.cameras.main.fadeOut(220, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (roomDef.type === ROOM_TYPE.EVENT) {
        this.scene.start(SCENES.EVENT, {
          eventId: roomDef.eventId,
          fromRoomId: roomDef.id,
        });
      } else {
        /* combat / boss */
        this.scene.start(SCENES.BATTLE, {
          roomId: roomDef.id,
          enemyId: roomDef.enemyId,
          isBoss: roomDef.type === ROOM_TYPE.BOSS,
        });
      }
    });
  }

  _toast(message) {
    if (this._toastObj) this._toastObj.destroy();
    const toast = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 120, message, {
        fontFamily: FONTS.body,
        fontSize: '14px',
        color: HEX.cream,
        backgroundColor: 'rgba(0,0,0,0.65)',
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5);
    this._toastObj = toast;
    this.tweens.add({
      targets: toast,
      alpha: 0,
      duration: 1600,
      delay: 600,
      onComplete: () => toast.destroy(),
    });
  }
}
