/**
 * effectResolver：解释卡牌 effect 指令
 * - 输入：effect 对象 + ctx { combat, log }
 * - 输出：直接修改 combat 状态；通过 ctx.log 输出日志
 *
 * combat 结构（与 combatSystem 保持一致）：
 *   {
 *     player: { hp, maxHp, block, energy, maxEnergy, fullness, maxFullness, statuses, attackBonus, nextTurnDrawBonus },
 *     enemy:  { hp, maxHp, block, statuses },
 *     piles:  { drawPile, hand, discardPile },
 *     turn,
 *     phase,
 *   }
 *
 * statuses 形如 { weak: 2, strength: 1 }
 */
import { drawCards } from './deckSystem.js';
import { RULES, STATUS } from '../config/constants.js';

/* ===================== 内部工具 ===================== */

function logT(ctx, key, ...args) {
  if (!ctx?.log) return;
  ctx.log(key, ...args);
}

function getEnemyName(combat) {
  return combat?.enemy?.name || combat?.enemy?.id || 'Enemy';
}

/**
 * 实际的"伤害落地"逻辑：考虑虚弱、目标格挡、HP 扣减
 */
function dealDamageToEnemy(combat, rawDamage, ctx) {
  const player = combat.player;
  let dmg = rawDamage;
  if (player.attackBonus) dmg += player.attackBonus;
  if ((player.statuses?.weak ?? 0) > 0) {
    dmg = Math.floor(dmg * RULES.weakDamageMultiplier);
  }
  dmg = Math.max(0, dmg);

  const enemy = combat.enemy;
  let remaining = dmg;
  if (enemy.block > 0) {
    const absorb = Math.min(enemy.block, remaining);
    enemy.block -= absorb;
    remaining -= absorb;
  }
  enemy.hp = Math.max(0, enemy.hp - remaining);
  logT(ctx, 'damageLog', getEnemyName(combat), dmg);
  return dmg;
}

/* ===================== 对外 API ===================== */

/**
 * 应用单条 effect。
 * @param {object} effect
 * @param {object} ctx { combat, log }
 */
export function applyEffect(effect, ctx) {
  const { combat } = ctx;
  if (!combat || !effect) return;

  switch (effect.type) {
    case 'damage': {
      let value = effect.value || 0;
      if (effect.bonusIfFullnessAtLeast) {
        const { threshold, value: bonus } = effect.bonusIfFullnessAtLeast;
        if ((combat.player.fullness ?? 0) >= threshold) value += bonus;
      }
      dealDamageToEnemy(combat, value, ctx);
      break;
    }
    case 'block': {
      combat.player.block = (combat.player.block ?? 0) + (effect.value || 0);
      logT(ctx, 'blockLog', effect.value || 0);
      break;
    }
    case 'gain_fullness': {
      const max = combat.player.maxFullness ?? 12;
      const before = combat.player.fullness ?? 0;
      combat.player.fullness = Math.min(max, before + (effect.value || 0));
      logT(ctx, 'fullnessLog', combat.player.fullness - before);
      break;
    }
    case 'draw': {
      const next = drawCards(combat.piles, effect.value || 0);
      combat.piles = next;
      logT(ctx, 'drawLog', effect.value || 0);
      break;
    }
    case 'apply_status': {
      const target = effect.target === 'self' ? combat.player : combat.enemy;
      if (!target.statuses) target.statuses = {};
      target.statuses[effect.status] = (target.statuses[effect.status] || 0) + (effect.value || 0);
      if (effect.status === STATUS.WEAK && effect.target !== 'self') {
        logT(ctx, 'weakAppliedLog', target.statuses[effect.status]);
      }
      break;
    }
    case 'heal': {
      const max = combat.player.maxHp;
      combat.player.hp = Math.min(max, (combat.player.hp ?? 0) + (effect.value || 0));
      logT(ctx, 'healLog', effect.value || 0);
      break;
    }
    case 'next_turn_draw_bonus': {
      combat.player.nextTurnDrawBonus = (combat.player.nextTurnDrawBonus || 0) + (effect.value || 0);
      break;
    }
    case 'attack_bonus_if_fullness_at_least': {
      if ((combat.player.fullness ?? 0) >= effect.threshold) {
        combat.player.attackBonus = (combat.player.attackBonus || 0) + (effect.value || 0);
      }
      break;
    }
    default: {
      console.warn('[effectResolver] unknown effect type', effect.type);
    }
  }
}

/**
 * 应用一张卡牌的全部 effects
 */
export function applyCardEffects(card, ctx) {
  if (!card?.effects) return;
  for (const eff of card.effects) {
    applyEffect(eff, ctx);
  }
}

/**
 * 计算「满足」状态附加的攻击伤害（在出牌前调用）
 */
export function applySatisfiedBonusIfAny(combat) {
  const player = combat.player;
  player.attackBonus = 0;
  if ((player.fullness ?? 0) >= RULES.fullnessThresholdSatisfied) {
    player.attackBonus = RULES.satisfiedAttackBonus;
    if (!player.statuses) player.statuses = {};
    player.statuses[STATUS.SATISFIED] = 1;
  } else if (player.statuses?.[STATUS.SATISFIED]) {
    delete player.statuses[STATUS.SATISFIED];
  }
}
