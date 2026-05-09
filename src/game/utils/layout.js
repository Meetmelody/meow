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

/**
 * 等比缩放图片到指定包围盒内（不裁剪、不变形）
 * - 用 setDisplaySize 取代 setScale，使最终尺寸不依赖源图分辨率
 * - 取宽高比例的较小值，保证图整体落入 maxWidth × maxHeight
 *
 * @param {Phaser.GameObjects.Image|Phaser.GameObjects.Sprite} image
 * @param {number} maxWidth
 * @param {number} maxHeight
 * @returns {{ width: number, height: number, scale: number }}
 */
export function fitImageWithin(image, maxWidth, maxHeight) {
  const w = image?.width || 0;
  const h = image?.height || 0;
  if (!w || !h) return { width: 0, height: 0, scale: 1 };
  const scale = Math.min(maxWidth / w, maxHeight / h);
  image.setScale(scale);
  return { width: w * scale, height: h * scale, scale };
}
