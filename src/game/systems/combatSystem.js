/**
 * combatSystem：战斗状态机
 * - 拥有当前 combat 对象，并对外暴露动作 API
 * - BattleScene 通过 emitter 监听变化，刷新 UI
 */
import Phaser from 'phaser';

import { RULES, STATUS } from '../config/constants.js';
import { deepClone } from '../utils/objectUtils.js';
import { shuffle } from '../utils/random.js';
import { getCardDef } from '../data/cards.js';
import { getEnemyDef } from '../data/enemies.js';
import { buildBattleDeck, discardHand, drawCards, discardCardAt } from './deckSystem.js';
import {
  applyCardEffects,
  applySatisfiedBonusIfAny,
} from './effectResolver.js';
import {
  advanceIntent,
  executeIntents,
  tickStatusesAtTurnEnd,
} from './enemyIntentSystem.js';

/* ===== 内部状态 ===== */
let combat = null;
let emitter = null;

function ensureEmitter() {
  if (!emitter) emitter = new Phaser.Events.EventEmitter();
  return emitter;
}

export function getEmitter() {
  return ensureEmitter();
}

export function getCombat() {
  return combat;
}

/* ===== 内部工具 ===== */
function emit(event, payload) {
  ensureEmitter().emit(event, payload);
}

function makeLogger(EVENTS) {
  return (key, ...args) => emit(EVENTS.LOG, { key, args });
}

/* ===== 战斗初始化 ===== */
export function startCombat({ runDeck, runPlayer, enemyId }, { EVENTS }) {
  const enemyDef = getEnemyDef(enemyId);
  if (!enemyDef) throw new Error(`unknown enemy: ${enemyId}`);

  const enemy = {
    ...deepClone(enemyDef),
    hp: enemyDef.maxHp,
    block: 0,
    patternIndex: 0,
    statuses: {},
  };

  const player = {
    ...deepClone(runPlayer),
    block: 0,
    statuses: {},
    attackBonus: 0,
    nextTurnDrawBonus: 0,
  };

  const drawPile = shuffle(buildBattleDeck(runDeck));
  combat = {
    player,
    enemy,
    piles: { drawPile, hand: [], discardPile: [] },
    turn: 0,
    phase: 'idle',
    runDeck,
  };

  emit(EVENTS.PLAYER_CHANGED, player);
  emit(EVENTS.ENEMY_CHANGED, enemy);
  emit(EVENTS.PILE_CHANGED, combat.piles);

  beginPlayerTurn({ EVENTS });
}

/* ===== 玩家回合 ===== */
export function beginPlayerTurn({ EVENTS }) {
  if (!combat) return;
  combat.turn += 1;
  combat.phase = 'player';
  combat.player.block = 0;
  combat.enemy.block = 0;

  /* Wet：本回合能量 -1，并消耗 1 层。最低 0。 */
  let wetPenalty = 0;
  if ((combat.player.statuses?.[STATUS.WET] ?? 0) > 0) {
    wetPenalty = 1;
    combat.player.statuses[STATUS.WET] -= 1;
    if (combat.player.statuses[STATUS.WET] <= 0) delete combat.player.statuses[STATUS.WET];
  }
  combat.player.energy = Math.max(0, combat.player.maxEnergy - wetPenalty);

  const drawCount = RULES.startingHandSize + (combat.player.nextTurnDrawBonus || 0);
  combat.player.nextTurnDrawBonus = 0;
  combat.piles = drawCards(combat.piles, drawCount);

  applySatisfiedBonusIfAny(combat);

  const log = makeLogger(EVENTS);
  log('turnStartLog', combat.turn);
  if (wetPenalty > 0) log('wetPenaltyLog');

  emit(EVENTS.TURN_STARTED, { turn: combat.turn });
  emit(EVENTS.PLAYER_CHANGED, combat.player);
  emit(EVENTS.ENEMY_CHANGED, combat.enemy);
  emit(EVENTS.HAND_CHANGED, combat.piles.hand);
  emit(EVENTS.PILE_CHANGED, combat.piles);
}

/* ===== 出牌 ===== */
export function canPlayCard(handIndex) {
  if (!combat || combat.phase !== 'player') return false;
  const inst = combat.piles.hand[handIndex];
  if (!inst) return false;
  const def = getCardDef(inst.cardId);
  if (!def) return false;
  return combat.player.energy >= def.cost;
}

export function playCard(handIndex, { EVENTS }) {
  if (!canPlayCard(handIndex)) return false;
  const inst = combat.piles.hand[handIndex];
  const def = getCardDef(inst.cardId);

  combat.player.energy -= def.cost;
  applySatisfiedBonusIfAny(combat);

  const log = makeLogger(EVENTS);
  applyCardEffects(def, { combat, log });

  combat.piles = discardCardAt(combat.piles, handIndex);

  emit(EVENTS.CARD_PLAYED, { card: def, instance: inst });
  emit(EVENTS.PLAYER_CHANGED, combat.player);
  emit(EVENTS.ENEMY_CHANGED, combat.enemy);
  emit(EVENTS.HAND_CHANGED, combat.piles.hand);
  emit(EVENTS.PILE_CHANGED, combat.piles);

  if (combat.enemy.hp <= 0) {
    combat.phase = 'win';
    log('victoryLog');
    emit(EVENTS.COMBAT_WIN, {});
  }
  return true;
}

/* ===== 结束回合 ===== */
export function endTurn({ EVENTS }) {
  if (!combat || combat.phase !== 'player') return;
  combat.phase = 'enemy';

  combat.piles = discardHand(combat.piles);
  emit(EVENTS.HAND_CHANGED, combat.piles.hand);

  const log = makeLogger(EVENTS);
  executeIntents(combat, { log });
  advanceIntent(combat.enemy);

  /* 回合结束削减敌人身上的 weak（玩家施加的状态） */
  tickStatusesAtTurnEnd(combat.enemy);
  /* 注：Wet 的削减放在玩家回合开始（已处理），这里不再削玩家的 wet */

  emit(EVENTS.PLAYER_CHANGED, combat.player);
  emit(EVENTS.ENEMY_CHANGED, combat.enemy);

  if (combat.player.hp <= 0) {
    combat.phase = 'lose';
    log('defeatLog');
    emit(EVENTS.COMBAT_LOSE, {});
    return;
  }

  beginPlayerTurn({ EVENTS });
}

/* ===== 重置（场景切换前调用）===== */
export function clearCombat() {
  combat = null;
}
