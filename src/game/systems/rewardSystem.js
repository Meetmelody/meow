/**
 * rewardSystem：胜利后的卡牌奖励池
 */
import { REWARD_POOL_IDS } from '../data/cards.js';
import { pickRandomN } from '../utils/random.js';

export function rollRewardCardIds(n = 3) {
  return pickRandomN(REWARD_POOL_IDS, n);
}
