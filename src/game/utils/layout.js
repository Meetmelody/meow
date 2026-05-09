/**
 * 布局工具：手牌扇形排布 / 网格定位
 */
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';

export const CENTER_X = GAME_WIDTH / 2;
export const CENTER_Y = GAME_HEIGHT / 2;

/**
 * 手牌底部布局：等距铺开，按手牌数量自动收紧间距
 */
export function computeHandPositions(handCount, options = {}) {
  const baseY = options.baseY ?? GAME_HEIGHT - 130;
  const cardWidth = options.cardWidth ?? 160;
  const maxSpan = options.maxSpan ?? 800;
  const minSpacing = options.minSpacing ?? 30;

  if (handCount <= 0) return [];
  if (handCount === 1) {
    return [{ x: GAME_WIDTH / 2, y: baseY, angle: 0 }];
  }

  const spacingFromMax = maxSpan / (handCount - 1);
  const spacing = Math.min(cardWidth + minSpacing, spacingFromMax);
  const totalWidth = spacing * (handCount - 1);
  const startX = GAME_WIDTH / 2 - totalWidth / 2;

  const positions = [];
  for (let i = 0; i < handCount; i += 1) {
    positions.push({ x: startX + spacing * i, y: baseY, angle: 0 });
  }
  return positions;
}
