/**
 * 全局常量：尺寸、颜色、字体、纹理键、事件键、存档键
 * - 所有需要复用的"魔法值"集中在此，便于改动与查找
 */

/* ========== 画布与布局 ========== */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

/* ========== 配色 ========== */
export const COLORS = {
  bgDark: 0x1c1410,
  bgDarker: 0x0c0908,
  panel: 0x2a1f18,
  panelLight: 0x3b2c22,
  wood: 0x4a3424,
  woodDark: 0x2e2118,
  gold: 0xe8b84a,
  goldSoft: 0xf2d893,
  goldDeep: 0xa07a26,
  cream: 0xf5e7c6,
  textMain: 0xf5e7c6,
  textSub: 0xc9a97a,
  textMuted: 0x8a7559,
  moonBlue: 0x6b8eb5,
  bloodRed: 0xc14242,
  hpRed: 0xe05a4d,
  blockBlue: 0x6b8eb5,
  energyYellow: 0xf2c14e,
  fullnessOrange: 0xe89455,
  coinGold: 0xe8b84a,
  weakPurple: 0x9c6bb5,
  enemyGray: 0x4a4a52,
  shadow: 0x000000,
};

export const HEX = {
  bgDark: '#1c1410',
  bgDarker: '#0c0908',
  panel: '#2a1f18',
  wood: '#4a3424',
  gold: '#e8b84a',
  goldSoft: '#f2d893',
  cream: '#f5e7c6',
  textMain: '#f5e7c6',
  textSub: '#c9a97a',
  textMuted: '#8a7559',
  moonBlue: '#9bb8d8',
  hpRed: '#e05a4d',
  blockBlue: '#9bb8d8',
  energyYellow: '#f2c14e',
};

/* ========== 字体 ========== */
export const FONTS = {
  display: '"Ma Shan Zheng", "Noto Sans SC", serif',
  body: '"Noto Sans SC", system-ui, sans-serif',
};

/* ========== 场景键 ========== */
export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MAIN_MENU: 'MainMenuScene',
  MAP: 'MapScene',
  BATTLE: 'BattleScene',
  REWARD: 'RewardScene',
  EVENT: 'EventScene',
  GAME_OVER: 'GameOverScene',
  DEMO_CLEAR: 'DemoClearScene',
};

/* ========== 纹理 / 资源键 ========== */
export const TEXTURES = {
  PLACEHOLDER: 'placeholder',
  PANEL_WOOD: 'panel_wood',
  BUTTON_WOOD: 'button_wood',
  BUTTON_WOOD_HOVER: 'button_wood_hover',
  CARD_FRAME: 'card_frame',
  CARD_FRAME_HOVER: 'card_frame_hover',
  SIR_ORANGE: 'sir_orange',
  ROOMBA_GUARD: 'roomba_guard',
  BG_MAIN_MENU: 'bg_main_menu',
  BG_LIVING_ROOM: 'bg_living_room',
  BG_MAP: 'bg_map',
};

/* ========== 战斗 / 玩家事件键 ========== */
export const EVENTS = {
  PLAYER_CHANGED: 'player_changed',
  ENEMY_CHANGED: 'enemy_changed',
  HAND_CHANGED: 'hand_changed',
  PILE_CHANGED: 'pile_changed',
  TURN_STARTED: 'turn_started',
  TURN_ENDED: 'turn_ended',
  CARD_PLAYED: 'card_played',
  DAMAGE_DEALT: 'damage_dealt',
  BLOCK_GAINED: 'block_gained',
  FULLNESS_CHANGED: 'fullness_changed',
  LOG: 'battle_log',
  COMBAT_WIN: 'combat_win',
  COMBAT_LOSE: 'combat_lose',
};

/* ========== 玩家初始数值 ========== */
export const PLAYER_INIT = {
  id: 'sir_orange',
  maxHp: 80,
  hp: 80,
  energy: 3,
  maxEnergy: 3,
  block: 0,
  fullness: 0,
  maxFullness: 12,
  fishCoins: 99,
};

/* ========== 战斗规则 ========== */
export const RULES = {
  startingHandSize: 5,
  weakDamageMultiplier: 0.75,
  fullnessThresholdSatisfied: 9,
  fullnessThresholdHalf: 6,
  satisfiedAttackBonus: 2,
};

/* ========== 状态键 ========== */
export const STATUS = {
  WEAK: 'weak',
  STRENGTH: 'strength',
  SATISFIED: 'satisfied',
  WET: 'wet',
};

/* ========== 卡牌类型 ========== */
export const CARD_TYPE = {
  ATTACK: 'attack',
  SKILL: 'skill',
  TRICK: 'trick',
  SNACK: 'snack',
  POWER: 'power',
};

/* ========== 房间 / 节点类型 ========== */
export const ROOM_STATUS = {
  LOCKED: 'locked',
  UNLOCKED: 'unlocked',
  CLEARED: 'cleared',
};

export const ROOM_TYPE = {
  COMBAT: 'combat',
  EVENT: 'event',
  BOSS: 'boss',
  REST: 'rest',
};

/* ========== 存档 ========== */
export const SAVE_KEY = 'meow_manor_save_v1';
export const SAVE_VERSION = 1;

/* ========== 默认语言 ========== */
export const DEFAULT_LANG = 'zh';
