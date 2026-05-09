/**
 * deckSystem：抽牌堆 / 弃牌堆 / 手牌的纯函数式操作
 * - 不依赖 Phaser，方便单元化
 */
import { shuffle } from '../utils/random.js';
import { nextInstanceId } from '../utils/objectUtils.js';

/**
 * 把 runState 的 deck 转换为战斗用的"牌实例"数组
 */
export function buildBattleDeck(runDeck) {
  return runDeck.map((c) => ({
    instanceId: c.instanceId ?? nextInstanceId('card'),
    cardId: c.cardId,
  }));
}

/**
 * 抽 N 张牌，返回新的 { drawPile, hand, discardPile }
 * 不够时从弃牌堆洗牌补充；都为空则停止
 */
export function drawCards(piles, count) {
  let { drawPile, hand, discardPile } = piles;
  drawPile = drawPile.slice();
  hand = hand.slice();
  discardPile = discardPile.slice();

  for (let i = 0; i < count; i += 1) {
    if (drawPile.length === 0) {
      if (discardPile.length === 0) break;
      drawPile = shuffle(discardPile);
      discardPile = [];
    }
    const card = drawPile.shift();
    if (card) hand.push(card);
  }

  return { drawPile, hand, discardPile };
}

/**
 * 把整个手牌弃掉
 */
export function discardHand(piles) {
  return {
    drawPile: piles.drawPile.slice(),
    hand: [],
    discardPile: piles.discardPile.concat(piles.hand),
  };
}

/**
 * 打出某张手牌（移到弃牌堆）
 */
export function discardCardAt(piles, indexOrInstanceId) {
  const hand = piles.hand.slice();
  let removed;
  if (typeof indexOrInstanceId === 'number') {
    removed = hand.splice(indexOrInstanceId, 1)[0];
  } else {
    const idx = hand.findIndex((c) => c.instanceId === indexOrInstanceId);
    if (idx >= 0) removed = hand.splice(idx, 1)[0];
  }
  const discardPile = piles.discardPile.slice();
  if (removed) discardPile.push(removed);
  return { drawPile: piles.drawPile.slice(), hand, discardPile };
}
