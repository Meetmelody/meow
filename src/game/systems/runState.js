/**
 * runState：单局玩家状态（牌组、HP、鱼干币、地图、清房进度等）
 * - 单例对象，整局生命周期内被各系统读写
 * - 只保存「长期状态」，战斗内临时数据由 combatSystem 管
 * - v0.2：地图推进改为「数据驱动」，按 rooms.js 的 nextRoomId 自动解锁
 */
import { PLAYER_INIT, ROOM_STATUS, ROOM_TYPE } from '../config/constants.js';
import { STARTER_DECK_RECIPE } from '../data/cards.js';
import { STARTER_RELICS } from '../data/relics.js';
import { DEMO_MAP_NODES, getRoomDef } from '../data/rooms.js';
import { deepClone, nextInstanceId, clamp } from '../utils/objectUtils.js';
import { writeSave, loadSave, clearSave } from './saveSystem.js';

const state = {
  player: null,
  deck: [],
  relics: [],
  map: [],
  clearedLivingRoom: false,
  demoCleared: false,
  runStarted: false,
};

/* ===== 内部工具 ===== */
function buildStarterDeck() {
  const deck = [];
  for (const { id, count } of STARTER_DECK_RECIPE) {
    for (let i = 0; i < count; i += 1) {
      deck.push({ instanceId: nextInstanceId('card'), cardId: id });
    }
  }
  return deck;
}

function buildInitialMap() {
  return DEMO_MAP_NODES.map((node) => ({
    roomId: node.roomId,
    status: node.initialStatus,
  }));
}

function buildInitialPlayer() {
  return deepClone(PLAYER_INIT);
}

/* ===== 启动 / 重置 ===== */
export function startNewRun() {
  state.player = buildInitialPlayer();
  state.deck = buildStarterDeck();
  state.relics = STARTER_RELICS.slice();
  state.map = buildInitialMap();
  state.clearedLivingRoom = false;
  state.demoCleared = false;
  state.runStarted = true;
  saveRun();
}

export function resetRun() {
  state.player = null;
  state.deck = [];
  state.relics = [];
  state.map = [];
  state.clearedLivingRoom = false;
  state.demoCleared = false;
  state.runStarted = false;
  clearSave();
}

/* ===== 读 ===== */
export function getPlayer() {
  return state.player;
}
export function getDeck() {
  return state.deck;
}
export function getRelics() {
  return state.relics;
}
export function getMap() {
  return state.map;
}
export function getRoomNode(roomId) {
  return state.map.find((n) => n.roomId === roomId) || null;
}
export function getRoomStatus(roomId) {
  return getRoomNode(roomId)?.status ?? ROOM_STATUS.LOCKED;
}
export function isLivingRoomCleared() {
  return state.clearedLivingRoom;
}
export function isDemoCleared() {
  return state.demoCleared;
}
export function isRunStarted() {
  return state.runStarted;
}

/* ===== 玩家数值（事件系统会用） ===== */
export function setPlayerHp(hp) {
  if (!state.player) return;
  state.player.hp = clamp(hp, 0, state.player.maxHp);
}
export function modifyPlayerHp(delta, floor = 0) {
  if (!state.player) return;
  state.player.hp = clamp(state.player.hp + delta, floor, state.player.maxHp);
}
export function setPlayerCoins(coins) {
  if (!state.player) return;
  state.player.fishCoins = Math.max(0, coins);
}
export function modifyPlayerCoins(delta) {
  if (!state.player) return;
  state.player.fishCoins = Math.max(0, state.player.fishCoins + delta);
}
export function modifyPlayerFullness(delta) {
  if (!state.player) return;
  const max = state.player.maxFullness ?? 12;
  state.player.fullness = clamp((state.player.fullness ?? 0) + delta, 0, max);
}

/* ===== 牌组 ===== */
export function addCardToDeck(cardId) {
  state.deck.push({ instanceId: nextInstanceId('card'), cardId });
}

/* ===== 房间推进 ===== */
export function setRoomStatus(roomId, status) {
  const node = state.map.find((n) => n.roomId === roomId);
  if (node) node.status = status;
}

/**
 * 标记房间已清理。
 * - 同步触发：解锁 nextRoomId（如果当前还是 locked）
 * - boss 房通关 → 设置 demoCleared
 * - 客厅特殊保留 clearedLivingRoom 兼容字段
 */
export function markRoomCleared(roomId) {
  const def = getRoomDef(roomId);
  setRoomStatus(roomId, ROOM_STATUS.CLEARED);

  if (roomId === 'living_room') state.clearedLivingRoom = true;

  if (def?.nextRoomId) {
    const nextStatus = getRoomStatus(def.nextRoomId);
    if (nextStatus === ROOM_STATUS.LOCKED) {
      setRoomStatus(def.nextRoomId, ROOM_STATUS.UNLOCKED);
    }
  }

  if (def?.type === ROOM_TYPE.BOSS) {
    state.demoCleared = true;
  }
}

/* ===== 存档 ===== */
export function saveRun() {
  if (!state.runStarted || !state.player) return;
  writeSave({
    player: deepClone(state.player),
    deck: deepClone(state.deck),
    relics: deepClone(state.relics),
    map: deepClone(state.map),
    clearedLivingRoom: state.clearedLivingRoom,
    demoCleared: state.demoCleared,
  });
}

export function loadRun() {
  const data = loadSave();
  if (!data || !data.player) return false;
  state.player = data.player;
  state.deck = data.deck ?? [];
  state.relics = data.relics ?? STARTER_RELICS.slice();
  state.map = data.map ?? buildInitialMap();
  state.clearedLivingRoom = !!data.clearedLivingRoom;
  state.demoCleared = !!data.demoCleared;
  state.runStarted = true;
  return true;
}
