/**
 * BattleScene：战斗场景
 * - 通过 init({ roomId, enemyId }) 接收战斗参数
 * - 数据流：combatSystem 修改 combat 对象 → 通过 emitter 触发 EVENTS → UI 刷新
 */
import Phaser from 'phaser';
import {
  SCENES,
  EVENTS,
  GAME_WIDTH,
  GAME_HEIGHT,
  HEX,
  FONTS,
  TEXTURES,
} from '../config/constants.js';
import { t } from '../systems/localizationSystem.js';
import {
  getDeck,
  getPlayer,
  setPlayerHp,
  modifyPlayerHp,
  markRoomCleared,
  saveRun,
} from '../systems/runState.js';
import { getCardDef } from '../data/cards.js';
import { getEnemyDef } from '../data/enemies.js';
import { resolveBattleBackground, resolveEnemyPortrait } from '../systems/assetResolver.js';
import { STRINGS } from '../data/localization.js';
import {
  startCombat,
  playCard,
  endTurn,
  getEmitter,
  getCombat,
  clearCombat,
} from '../systems/combatSystem.js';
import { getCurrentIntents } from '../systems/enemyIntentSystem.js';
import StatusPanel from '../ui/StatusPanel.js';
import EnemyPanel from '../ui/EnemyPanel.js';
import BattleLogPanel from '../ui/BattleLogPanel.js';
import TextButton from '../ui/TextButton.js';
import CardView, { CARD_VIEW_SIZE } from '../ui/CardView.js';
import { computeHandPositions, fitImageWithin } from '../utils/layout.js';

/* 立绘包围盒（最大宽 × 最大高，等比缩放后不变形）
 * 注意：用包围盒而非 setScale，避免不同源图分辨率导致显示尺寸跑偏 */
const SPRITE_BOX = {
  player: { w: 300, h: 340 },
  enemy: { w: 320, h: 360 },
  boss: { w: 400, h: 440 },
};

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BATTLE);
  }

  init(data) {
    this.battleData = data || {};
    this._cardViews = [];
  }

  create() {
    const { roomId, enemyId, isBoss } = this.battleData;
    this.currentRoomId = roomId;
    this.isBoss = !!isBoss;

    /* 入场淡入 */
    this.cameras.main.fadeIn(280, 0, 0, 0);

    /* 背景：按 roomId 解析，缺失则回到客厅占位 */
    const bgKey = resolveBattleBackground(this, roomId);
    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, bgKey)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, this.isBoss ? 0.55 : 0.42);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    /* 状态面板 */
    this.statusPanel = new StatusPanel(this, 145, GAME_HEIGHT / 2 - 30);

    /* 敌人面板 */
    this.enemyPanel = new EnemyPanel(this, GAME_WIDTH - 165, 130);

    /* 日志面板 */
    this.logPanel = new BattleLogPanel(this, GAME_WIDTH - 165, GAME_HEIGHT / 2 + 50);

    /* 玩家立绘：用包围盒等比缩放，不依赖源图分辨率 */
    this.playerSprite = this.add
      .image(360, GAME_HEIGHT / 2 + 80, TEXTURES.SIR_ORANGE)
      .setOrigin(0.5);
    fitImageWithin(this.playerSprite, SPRITE_BOX.player.w, SPRITE_BOX.player.h);

    /* 敌人立绘（按 enemyId 选纹理 / 染色 / 包围盒）*/
    this.enemySprite = this._createEnemySprite(enemyId);

    /* 抽弃牌堆显示 */
    this.drawText = this.add.text(290, GAME_HEIGHT - 30, '', {
      fontFamily: FONTS.body,
      fontSize: '13px',
      color: HEX.textSub,
    });
    this.discardText = this.add
      .text(GAME_WIDTH - 350, GAME_HEIGHT - 30, '', {
        fontFamily: FONTS.body,
        fontSize: '13px',
        color: HEX.textSub,
      })
      .setOrigin(1, 0);

    /* 回合数 */
    this.turnText = this.add
      .text(GAME_WIDTH / 2, 30, '', {
        fontFamily: FONTS.display,
        fontSize: '22px',
        color: HEX.gold,
      })
      .setOrigin(0.5);

    /* 结束回合按钮 */
    this.endTurnBtn = new TextButton(this, GAME_WIDTH - 165, GAME_HEIGHT - 70, {
      width: 220,
      height: 60,
      primaryLabel: t('btnEndTurn'),
      primaryFontSize: '20px',
    }).onClick(() => endTurn({ EVENTS }));

    /* 浮动伤害容器 */
    this.fxLayer = this.add.container(0, 0);

    /* 满足状态弹窗节流：避免每个 PLAYER_CHANGED 都弹 */
    this._wasSatisfied = false;

    /* 注册事件 */
    this._bindCombatEvents();

    /* 启动战斗（动态加载 enemyId）*/
    startCombat(
      {
        runDeck: getDeck(),
        runPlayer: getPlayer(),
        enemyId,
      },
      { EVENTS }
    );
  }

  /* ============ 敌人立绘 ============
   * - 通过 resolveEnemyPortrait 取真实贴图 key
   * - 用包围盒等比缩放（boss 用更大的包围盒）
   * - 真实贴图存在时不做染色；缺失（落回 ROOMBA_GUARD 占位）时按敌人 id 染色区分
   */
  _createEnemySprite(enemyId) {
    const def = getEnemyDef(enemyId);
    const x = GAME_WIDTH - 480;
    const y = GAME_HEIGHT / 2 + 60;
    const portraitKey = resolveEnemyPortrait(this, enemyId);
    const sprite = this.add.image(x, y, portraitKey).setOrigin(0.5);
    sprite.clearTint();

    /* boss 走加大包围盒，普通敌人走标准 */
    const box = enemyId === 'sofa_shadow' ? SPRITE_BOX.boss : SPRITE_BOX.enemy;
    fitImageWithin(sprite, box.w, box.h);

    if (!def) return sprite;
    /* 真实美术尚未到位时（fallback 到 ROOMBA_GUARD）才染色区分 */
    const isPlaceholder = portraitKey === TEXTURES.ROOMBA_GUARD && enemyId !== 'roomba_guard';
    if (isPlaceholder) {
      switch (enemyId) {
        case 'fridge_wisp':
          sprite.setTint(0x9bd6e6);
          break;
        case 'paper_sprite':
          sprite.setTint(0xf2e5c2);
          break;
        case 'sofa_shadow':
          sprite.setTint(0x6b4a8a);
          break;
        default:
          break;
      }
    }
    return sprite;
  }

  /* ===================== 事件绑定 ===================== */

  _bindCombatEvents() {
    const ee = getEmitter();
    /* 清掉旧绑定，避免重复 */
    ee.removeAllListeners();

    ee.on(EVENTS.PLAYER_CHANGED, (player) => {
      this.statusPanel.update(player);
      /* 监测「满足」状态首次进入，弹出短暂提示 */
      const isSatisfied = (player.fullness ?? 0) >= 9;
      if (isSatisfied && !this._wasSatisfied) {
        this._showSatisfiedFlash();
      }
      this._wasSatisfied = isSatisfied;
    });
    ee.on(EVENTS.ENEMY_CHANGED, (enemy) => {
      this.enemyPanel.update(enemy, getCurrentIntents(enemy));
    });
    ee.on(EVENTS.HAND_CHANGED, () => {
      this._refreshHand();
    });
    ee.on(EVENTS.PILE_CHANGED, (piles) => {
      this.drawText.setText(`${t('labelDraw')}：${piles.drawPile.length}`);
      this.discardText.setText(`${t('labelDiscard')}：${piles.discardPile.length}`);
    });
    ee.on(EVENTS.TURN_STARTED, ({ turn }) => {
      this.turnText.setText(`${t('labelTurn')} ${turn}`);
    });
    ee.on(EVENTS.LOG, ({ key, args }) => {
      const entry = STRINGS[key];
      const message = typeof entry === 'function' ? entry(...args) : entry ?? key;
      this.logPanel.push(message);
      /* 触发常见效果反馈 */
      if (key === 'damageLog') {
        const dmg = args[1];
        if (dmg > 0) {
          this.enemyPanel.shake();
          this._spawnFloatingNumber(this.enemySprite.x, this.enemySprite.y - 60, `-${dmg}`, '#e05a4d');
        }
      } else if (key === 'enemyAttackLog') {
        const dmg = args[1];
        if (dmg > 0) {
          this._shakePlayer();
          this._spawnFloatingNumber(this.playerSprite.x, this.playerSprite.y - 80, `-${dmg}`, '#e05a4d');
        }
      } else if (key === 'blockLog') {
        const v = args[0];
        this._spawnFloatingNumber(this.playerSprite.x, this.playerSprite.y - 80, `+${v}`, '#9bb8d8');
      } else if (key === 'fullnessLog') {
        const v = args[0];
        this._spawnFloatingNumber(this.playerSprite.x, this.playerSprite.y - 100, `+${v} 🐟`, '#e89455');
      } else if (key === 'healLog') {
        const v = args[0];
        this._spawnFloatingNumber(this.playerSprite.x, this.playerSprite.y - 80, `+${v}`, '#7ad19b');
      }
    });
    ee.on(EVENTS.COMBAT_WIN, () => {
      this._handleVictory();
    });
    ee.on(EVENTS.COMBAT_LOSE, () => {
      this._handleDefeat();
    });
  }

  /* ===================== 手牌刷新 ===================== */

  _refreshHand() {
    const combat = getCombat();
    if (!combat) return;
    const hand = combat.piles.hand;

    /* 销毁现有 */
    for (const v of this._cardViews) v.destroy();
    this._cardViews = [];

    const positions = computeHandPositions(hand.length, {
      baseY: GAME_HEIGHT - 130,
      cardWidth: CARD_VIEW_SIZE.width,
      maxSpan: 800,
      minSpacing: 20,
    });

    hand.forEach((inst, idx) => {
      const def = getCardDef(inst.cardId);
      if (!def) return;
      const pos = positions[idx];
      const view = new CardView(this, pos.x, pos.y, def, {
        handIndex: idx,
        playable: combat.player.energy >= def.cost && combat.phase === 'player',
      }).onPlay((handIndex) => this._handlePlayCard(handIndex));
      this._cardViews.push(view);
    });
  }

  _handlePlayCard(handIndex) {
    const before = getCombat();
    const cardInst = before?.piles?.hand?.[handIndex];
    const cardDef = cardInst ? getCardDef(cardInst.cardId) : null;
    const fromView = this._cardViews[handIndex];
    if (fromView && cardDef) {
      this.tweens.add({
        targets: fromView,
        y: fromView.y - 80,
        alpha: 0,
        scaleX: 0.85,
        scaleY: 0.85,
        duration: 220,
        ease: 'Sine.easeIn',
      });
    }
    playCard(handIndex, { EVENTS });
  }

  /* ===================== 反馈动效 ===================== */

  _shakePlayer() {
    const baseX = this.playerSprite.x;
    this.tweens.add({
      targets: this.playerSprite,
      x: { from: baseX - 10, to: baseX },
      duration: 100,
      yoyo: true,
      repeat: 1,
    });
  }

  _spawnFloatingNumber(x, y, text, color) {
    const txt = this.add
      .text(x, y, text, {
        fontFamily: FONTS.display,
        fontSize: '28px',
        color,
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    this.fxLayer.add(txt);
    this.tweens.add({
      targets: txt,
      y: y - 40,
      alpha: 0,
      duration: 700,
      ease: 'Sine.easeOut',
      onComplete: () => txt.destroy(),
    });
  }

  /* ===================== 胜负 ===================== */

  /**
   * 战斗胜利：
   *   - 同步 HP 到 runState
   *   - 标记房间已清理（runState 内自动解锁 nextRoomId / boss → demoCleared）
   *   - boss 房 → DemoClearScene；普通房 → RewardScene
   */
  _handleVictory() {
    const player = getPlayer();
    const combat = getCombat();
    if (player && combat) {
      setPlayerHp(combat.player.hp);
    }
    if (this.currentRoomId) markRoomCleared(this.currentRoomId);
    saveRun();

    this.time.delayedCall(700, () => {
      clearCombat();
      if (this.isBoss) {
        this.scene.start(SCENES.DEMO_CLEAR);
      } else {
        this.scene.start(SCENES.REWARD, { fromRoomId: this.currentRoomId });
      }
    });
  }

  _handleDefeat() {
    /* 玩家 HP 已经在 combat 中被扣到 0；此处直接归零 runState 防止数据漂移 */
    modifyPlayerHp(-9999);
    saveRun();
    this.time.delayedCall(700, () => {
      clearCombat();
      this.scene.start(SCENES.GAME_OVER);
    });
  }

  shutdown() {
    getEmitter().removeAllListeners();
  }

  /* ============ 满足状态闪现提示 ============ */
  _showSatisfiedFlash() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2 - 80;
    const txt = this.add
      .text(cx, cy, `🐟 ${t('statusSatisfied')} +2`, {
        fontFamily: FONTS.display,
        fontSize: '36px',
        color: HEX.goldSoft,
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setShadow(0, 0, '#e8b84a', 24, true, true)
      .setAlpha(0);
    this.fxLayer.add(txt);
    this.tweens.add({
      targets: txt,
      alpha: { from: 0, to: 1 },
      y: cy - 16,
      scale: { from: 0.85, to: 1.05 },
      duration: 260,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: txt,
          alpha: 0,
          y: cy - 36,
          duration: 600,
          delay: 700,
          onComplete: () => txt.destroy(),
        });
      },
    });
  }
}
