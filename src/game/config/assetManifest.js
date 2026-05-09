/**
 * 资源清单（v0.3）
 *
 * 为什么把它独立出来？
 *   - PreloadScene 不再硬写每条 load.image
 *   - 美术替换：往 public/assets/... 丢同名文件即可自动覆盖占位
 *   - 新增贴图：只在这里加一行；占位 fallback 由 PreloadScene 自动处理
 *
 * 字段：
 *   key       Phaser texture key（务必唯一）
 *   path      相对 public/ 的资源路径
 *   type      'image' | 'audio'（v0.3 暂只用 image）
 *   fallback  缺失时使用哪个占位 key（PreloadScene 会保证占位 key 存在）
 */
import { TEXTURES } from './constants.js';

export const IMAGE_MANIFEST = [
  /* ========= 背景 ========= */
  { key: TEXTURES.BG_MAIN_MENU, path: 'assets/images/backgrounds/main_menu.png', fallback: TEXTURES.BG_MAIN_MENU },
  { key: TEXTURES.BG_MAP, path: 'assets/images/backgrounds/map_bg.png', fallback: TEXTURES.BG_MAP },
  { key: TEXTURES.BG_LIVING_ROOM, path: 'assets/images/backgrounds/living_room.png', fallback: TEXTURES.BG_LIVING_ROOM },
  { key: 'bg_kitchen', path: 'assets/images/backgrounds/kitchen.png', fallback: TEXTURES.BG_LIVING_ROOM },
  { key: 'bg_study', path: 'assets/images/backgrounds/study.png', fallback: TEXTURES.BG_LIVING_ROOM },
  { key: 'bg_attic', path: 'assets/images/backgrounds/attic.png', fallback: TEXTURES.BG_LIVING_ROOM },

  /* ========= 角色 ========= */
  { key: TEXTURES.SIR_ORANGE, path: 'assets/images/characters/sir_orange.png', fallback: TEXTURES.SIR_ORANGE },

  /* ========= 敌人 ========= */
  { key: TEXTURES.ROOMBA_GUARD, path: 'assets/images/enemies/roomba_guard.png', fallback: TEXTURES.ROOMBA_GUARD },
  { key: 'fridge_wisp', path: 'assets/images/enemies/fridge_wisp.png', fallback: TEXTURES.ROOMBA_GUARD },
  { key: 'paper_sprite', path: 'assets/images/enemies/paper_sprite.png', fallback: TEXTURES.ROOMBA_GUARD },
  { key: 'sofa_shadow', path: 'assets/images/enemies/sofa_shadow.png', fallback: TEXTURES.ROOMBA_GUARD },

  /* ========= UI ========= */
  { key: TEXTURES.CARD_FRAME, path: 'assets/images/ui/card_frame.png', fallback: TEXTURES.CARD_FRAME },
  { key: TEXTURES.BUTTON_WOOD, path: 'assets/images/ui/button_wood.png', fallback: TEXTURES.BUTTON_WOOD },
  { key: TEXTURES.PANEL_WOOD, path: 'assets/images/ui/panel_wood.png', fallback: TEXTURES.PANEL_WOOD },
  { key: 'icon_hp', path: 'assets/images/ui/icon_hp.png', fallback: TEXTURES.PLACEHOLDER },
  { key: 'icon_energy', path: 'assets/images/ui/icon_energy.png', fallback: TEXTURES.PLACEHOLDER },
  { key: 'icon_block', path: 'assets/images/ui/icon_block.png', fallback: TEXTURES.PLACEHOLDER },
  { key: 'icon_fullness', path: 'assets/images/ui/icon_fullness.png', fallback: TEXTURES.PLACEHOLDER },
  { key: 'icon_fishcoin', path: 'assets/images/ui/icon_fishcoin.png', fallback: TEXTURES.PLACEHOLDER },
];

/**
 * 房间 → 战斗背景纹理 key 的映射
 * BattleScene 通过 resolveBattleBackground(roomId) 取背景
 */
export const ROOM_BATTLE_BG = {
  living_room: TEXTURES.BG_LIVING_ROOM,
  kitchen: 'bg_kitchen',
  study: 'bg_study',
  attic: 'bg_attic',
};

/**
 * 敌人 id → 立绘纹理 key 的映射（缺失则回到 ROOMBA_GUARD 占位）
 */
export const ENEMY_PORTRAIT = {
  roomba_guard: TEXTURES.ROOMBA_GUARD,
  fridge_wisp: 'fridge_wisp',
  paper_sprite: 'paper_sprite',
  sofa_shadow: 'sofa_shadow',
};
