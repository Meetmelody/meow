/**
 * enemyIntentSystem：解析 / 推进 / 执行敌人意图
 *
 * pattern 字符串格式（v0.2）：
 *   - 单动作：'atk:7' / 'atkx2:4' / 'atkxN:V' / 'blk:8' / 'debuff:weak:1'
 *   - 同回合多动作：用 '+' 连接，例如 'atk:6+debuff:wet:1'
 *
 * 解析后每个 token 变成一个 intent 对象：
 *   { kind: 'attack', value, hits }
 *   { kind: 'block',  value }
 *   { kind: 'debuff', status, value }
 */
import { RULES, STATUS } from '../config/constants.js';

/* ============ 解析 ============ */

/**
 * 解析单个 token（不含 '+'）
 */
export function parseSingleIntent(token) {
  if (!token) return null;

  /* atkx<N>:<V> */
  const matchAtkX = token.match(/^atkx(\d+):(\d+)$/);
  if (matchAtkX) {
    return { kind: 'attack', value: Number(matchAtkX[2]) || 0, hits: Number(matchAtkX[1]) || 1 };
  }
  /* atk:<V> */
  if (token.startsWith('atk:')) {
    return { kind: 'attack', value: Number(token.split(':')[1]) || 0, hits: 1 };
  }
  /* blk:<V> */
  if (token.startsWith('blk:')) {
    return { kind: 'block', value: Number(token.split(':')[1]) || 0 };
  }
  /* debuff:<status>:<V> */
  if (token.startsWith('debuff:')) {
    const [, status, val] = token.split(':');
    return { kind: 'debuff', status, value: Number(val) || 0 };
  }
  return { kind: 'unknown' };
}

/**
 * 解析整个回合的 token，返回一组 intents
 */
export function parseIntentTokens(rawToken) {
  if (!rawToken) return [];
  return String(rawToken)
    .split('+')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseSingleIntent)
    .filter(Boolean);
}

/* ============ 当前回合 ============ */

/**
 * 当前回合的全部意图（数组）
 */
export function getCurrentIntents(enemy) {
  if (!enemy?.pattern || enemy.pattern.length === 0) return [];
  const idx = enemy.patternIndex ?? 0;
  return parseIntentTokens(enemy.pattern[idx % enemy.pattern.length]);
}

/**
 * 推进到下一个回合的意图
 */
export function advanceIntent(enemy) {
  if (!enemy?.pattern) return;
  enemy.patternIndex = ((enemy.patternIndex ?? 0) + 1) % enemy.pattern.length;
}

/* ============ 执行 ============ */

function applySingleIntent(combat, intent, ctx) {
  if (!intent) return;
  const enemy = combat.enemy;
  const player = combat.player;

  if (intent.kind === 'attack') {
    const hits = intent.hits || 1;
    for (let i = 0; i < hits; i += 1) {
      let dmg = intent.value;
      if ((enemy.statuses?.weak ?? 0) > 0) {
        dmg = Math.floor(dmg * RULES.weakDamageMultiplier);
      }
      dmg = Math.max(0, dmg);
      let remaining = dmg;
      if (player.block > 0) {
        const absorb = Math.min(player.block, remaining);
        player.block -= absorb;
        remaining -= absorb;
      }
      player.hp = Math.max(0, player.hp - remaining);
      ctx?.log?.('enemyAttackLog', enemy.nameZh, dmg);
    }
  } else if (intent.kind === 'block') {
    enemy.block = (enemy.block || 0) + intent.value;
    ctx?.log?.('enemyBlockLog', enemy.nameZh, intent.value);
  } else if (intent.kind === 'debuff') {
    if (!player.statuses) player.statuses = {};
    player.statuses[intent.status] = (player.statuses[intent.status] || 0) + intent.value;
    if (intent.status === STATUS.WEAK) {
      ctx?.log?.('enemyApplyWeakLog', enemy.nameZh, intent.value);
    } else if (intent.status === STATUS.WET) {
      ctx?.log?.('enemyApplyWetLog', enemy.nameZh, intent.value);
    }
  }
}

/**
 * 执行当前回合的全部意图
 */
export function executeIntents(combat, ctx) {
  const intents = getCurrentIntents(combat.enemy);
  for (const intent of intents) {
    applySingleIntent(combat, intent, ctx);
    if (combat.player.hp <= 0) break;
  }
}

/* ============ 回合结束减层 ============ */

/**
 * 仅在「行动方」回合结束时调用：让目标身上的 weak / wet 衰减 1 层
 * - 比如玩家结束回合 → 削玩家的 wet（敌人造成的）
 * - 敌人执行完意图 → 削敌人的 weak（玩家造成的）
 */
export function tickStatusesAtTurnEnd(unit) {
  if (!unit?.statuses) return;
  for (const key of [STATUS.WEAK, STATUS.WET]) {
    if (unit.statuses[key]) {
      unit.statuses[key] -= 1;
      if (unit.statuses[key] <= 0) delete unit.statuses[key];
    }
  }
}

/* ============ 兼容旧 API ============ */

/**
 * 兼容 v0.1：返回当前回合「首个」意图，仅用于已有调用点
 */
export function getCurrentIntent(enemy) {
  return getCurrentIntents(enemy)[0] ?? null;
}
