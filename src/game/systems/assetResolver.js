/**
 * assetResolver：纹理 key 解析（含 fallback）
 *
 * 用法：
 *   - 加载阶段：PreloadScene 用 IMAGE_MANIFEST 尝试加载真实图片
 *   - 运行时：场景调用 resolveTexture(scene, key) 取最终能用的 key
 *     → 如果真实图片已加载成功，返回 key 本身
 *     → 否则返回 manifest 中声明的 fallback（保证占位贴图存在）
 *
 * 为什么这样设计？
 *   - 真实美术资源不到位时，游戏不能崩
 *   - 美术到位后，单点替换（往 public/assets 丢图），不需要改代码
 */
import { IMAGE_MANIFEST, ROOM_BATTLE_BG, ENEMY_PORTRAIT, EVENT_BG } from '../config/assetManifest.js';
import { TEXTURES } from '../config/constants.js';

const fallbackMap = new Map();
for (const item of IMAGE_MANIFEST) {
  fallbackMap.set(item.key, item.fallback || TEXTURES.PLACEHOLDER);
}

/**
 * 取最终可用的纹理 key
 * @param {Phaser.Scene} scene
 * @param {string} key
 */
export function resolveTexture(scene, key) {
  if (!scene?.textures) return key;
  if (scene.textures.exists(key)) return key;
  const fb = fallbackMap.get(key);
  if (fb && scene.textures.exists(fb)) return fb;
  return TEXTURES.PLACEHOLDER;
}

/**
 * 房间 id → 战斗背景纹理 key
 */
export function resolveBattleBackground(scene, roomId) {
  const desired = ROOM_BATTLE_BG[roomId] || TEXTURES.BG_LIVING_ROOM;
  return resolveTexture(scene, desired);
}

/**
 * 敌人 id → 立绘纹理 key
 */
export function resolveEnemyPortrait(scene, enemyId) {
  const desired = ENEMY_PORTRAIT[enemyId] || TEXTURES.ROOMBA_GUARD;
  return resolveTexture(scene, desired);
}

/**
 * 事件 id → 事件背景纹理 key
 * 缺失时回到 BG_MAP（与旧版 EventScene 行为一致）
 */
export function resolveEventBackground(scene, eventId) {
  const desired = EVENT_BG[eventId] || TEXTURES.BG_MAP;
  return resolveTexture(scene, desired);
}

/**
 * 已成功通过 Phaser Loader 加载的真实图片 key 集合
 * 由 PreloadScene 通过 markRealLoaded 在 filecomplete 事件中填充
 * 注意：PreloadScene 会为部分 UI key（CARD_FRAME / BUTTON_WOOD / PANEL_WOOD）
 *       生成 Graphics 占位贴图；scene.textures.exists() 无法区分"真 PNG"和"占位"，
 *       因此用单独的 Set 标记真正成功加载的资源
 */
const realLoadedKeys = new Set();

/**
 * 由 PreloadScene 在文件加载成功时调用
 */
export function markRealLoaded(key) {
  if (key) realLoadedKeys.add(key);
}

/**
 * 判断指定 key 的真实图片是否已加载（用于"有真图走真图、无真图走占位"分支）
 */
export function hasRealTexture(_scene, key) {
  return realLoadedKeys.has(key);
}
