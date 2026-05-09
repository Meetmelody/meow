/**
 * 存档系统：localStorage 单存档槽
 * - 仅保存「玩家长期状态 + 地图状态」，战斗内的临时状态不存
 * - getSaveSummary 提供给 UI 用的"存档摘要"（无需全量解析 deck）
 */
import { SAVE_KEY, SAVE_VERSION, ROOM_STATUS } from '../config/constants.js';

export function hasSave() {
  try {
    return !!localStorage.getItem(SAVE_KEY);
  } catch {
    return false;
  }
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== SAVE_VERSION) return null;
    return data;
  } catch (e) {
    console.warn('[saveSystem] load failed', e);
    return null;
  }
}

export function writeSave(snapshot) {
  try {
    const payload = { version: SAVE_VERSION, savedAt: Date.now(), ...snapshot };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.warn('[saveSystem] save failed', e);
    return false;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* noop */
  }
}

/**
 * 存档摘要：用于 MainMenuScene Continue 区域展示
 * 返回 null 表示无存档
 *
 * currentRoomId 的判定：
 *   1. 第一个 unlocked 的房间（即"下一个可探索的房间"）
 *   2. 都 cleared → null（demoCleared 时显示通关）
 */
export function getSaveSummary() {
  const data = loadSave();
  if (!data || !data.player) return null;

  const map = data.map ?? [];
  const next = map.find((n) => n.status === ROOM_STATUS.UNLOCKED);
  const lastCleared = [...map].reverse().find((n) => n.status === ROOM_STATUS.CLEARED);
  const currentRoomId = next?.roomId || lastCleared?.roomId || null;

  return {
    savedAt: data.savedAt ?? null,
    currentRoomId,
    demoCleared: !!data.demoCleared,
    hp: data.player.hp ?? 0,
    maxHp: data.player.maxHp ?? 0,
    fishCoins: data.player.fishCoins ?? 0,
    deckSize: Array.isArray(data.deck) ? data.deck.length : 0,
  };
}
