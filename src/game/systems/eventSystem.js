/**
 * eventSystem：处理"房间事件"的选项效果
 *
 * 与战斗效果完全分离：
 *   - effectResolver 处理战斗内的「卡牌效果」
 *   - eventSystem    处理事件内的「持久属性变更」（HP / 鱼干 / 饱腹 …）
 *
 * 输入：选项 effects 数组
 * 副作用：直接修改 runState.player；调用方负责保存与跳场景
 */
import {
  getPlayer,
  modifyPlayerHp,
  modifyPlayerCoins,
  modifyPlayerFullness,
} from './runState.js';

/**
 * 应用一个事件选项的全部效果
 * @returns 一份概览对象 { hpDelta, coinsDelta, fullnessDelta }
 */
export function applyEventOption(option) {
  const summary = { hpDelta: 0, coinsDelta: 0, fullnessDelta: 0 };
  if (!option?.effects) return summary;

  const player = getPlayer();
  if (!player) return summary;

  for (const eff of option.effects) {
    switch (eff.type) {
      case 'heal': {
        const before = player.hp;
        modifyPlayerHp(eff.value || 0);
        summary.hpDelta += player.hp - before;
        break;
      }
      case 'lose_hp': {
        const before = player.hp;
        modifyPlayerHp(-(eff.value || 0), eff.floor ?? 0);
        summary.hpDelta += player.hp - before;
        break;
      }
      case 'gain_coins': {
        modifyPlayerCoins(eff.value || 0);
        summary.coinsDelta += eff.value || 0;
        break;
      }
      case 'gain_fullness': {
        const before = player.fullness ?? 0;
        modifyPlayerFullness(eff.value || 0);
        summary.fullnessDelta += (player.fullness ?? 0) - before;
        break;
      }
      default:
        console.warn('[eventSystem] unknown effect type', eff.type);
    }
  }

  return summary;
}
