/**
 * 卡牌数据
 * - 每张卡的 effects 是 effectResolver 可识别的指令数组
 * - 不要在场景里写死任何卡牌行为
 *
 * effect 类型示例：
 *   { type: 'damage', value, bonusIfFullnessAtLeast?: { threshold, value } }
 *   { type: 'block', value }
 *   { type: 'gain_fullness', value }
 *   { type: 'draw', value }
 *   { type: 'apply_status', target: 'enemy'|'self', status, value }
 *   { type: 'heal', value }
 *   { type: 'next_turn_draw_bonus', value }
 *   { type: 'attack_bonus_if_fullness_at_least', threshold, value }
 */
import { CARD_TYPE } from '../config/constants.js';

export const CARD_RARITY = {
  BASIC: 'basic',
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
};

export const CARDS = {
  paw_punch: {
    id: 'paw_punch',
    nameZh: '猫猫拳',
    nameEn: 'Paw Punch',
    cost: 1,
    type: CARD_TYPE.ATTACK,
    rarity: CARD_RARITY.BASIC,
    descriptionZh: '造成 6 点伤害。\n饱腹 ≥ 9 时，额外 +2。',
    descriptionEn: 'Deal 6 damage.\nIf Fullness ≥ 9, deal +2 more.',
    effects: [
      {
        type: 'damage',
        value: 6,
        bonusIfFullnessAtLeast: { threshold: 9, value: 2 },
      },
    ],
  },

  belly_guard: {
    id: 'belly_guard',
    nameZh: '护住肚皮',
    nameEn: 'Belly Guard',
    cost: 1,
    type: CARD_TYPE.SKILL,
    rarity: CARD_RARITY.BASIC,
    descriptionZh: '获得 5 点格挡。',
    descriptionEn: 'Gain 5 Block.',
    effects: [{ type: 'block', value: 5 }],
  },

  sneak_fish_snack: {
    id: 'sneak_fish_snack',
    nameZh: '偷吃小鱼干',
    nameEn: 'Sneak a Fish Snack',
    cost: 1,
    type: CARD_TYPE.SNACK,
    rarity: CARD_RARITY.BASIC,
    descriptionZh: '获得 2 点饱腹。\n抽 1 张牌。',
    descriptionEn: 'Gain 2 Fullness.\nDraw 1 card.',
    effects: [
      { type: 'gain_fullness', value: 2 },
      { type: 'draw', value: 1 },
    ],
  },

  knock_over_cup: {
    id: 'knock_over_cup',
    nameZh: '打翻水杯',
    nameEn: 'Knock Over Cup',
    cost: 1,
    type: CARD_TYPE.TRICK,
    rarity: CARD_RARITY.COMMON,
    descriptionZh: '造成 4 点伤害。\n施加 1 层虚弱。',
    descriptionEn: 'Deal 4 damage.\nApply 1 Weak.',
    effects: [
      { type: 'damage', value: 4 },
      { type: 'apply_status', target: 'enemy', status: 'weak', value: 1 },
    ],
  },

  orange_crush: {
    id: 'orange_crush',
    nameZh: '橘座压顶',
    nameEn: 'Orange Crush',
    cost: 2,
    type: CARD_TYPE.ATTACK,
    rarity: CARD_RARITY.COMMON,
    descriptionZh: '造成 12 点伤害。\n饱腹 ≥ 6 额外 +8。\n饱腹 ≥ 9 攻击牌再 +2。',
    descriptionEn: 'Deal 12 damage.\nIf Fullness ≥ 6, deal +8 more.\nIf Fullness ≥ 9, all Attacks +2.',
    effects: [
      {
        type: 'damage',
        value: 12,
        bonusIfFullnessAtLeast: { threshold: 6, value: 8 },
      },
      {
        type: 'attack_bonus_if_fullness_at_least',
        threshold: 9,
        value: 2,
      },
    ],
  },

  healing_purr: {
    id: 'healing_purr',
    nameZh: '呼噜疗愈',
    nameEn: 'Healing Purr',
    cost: 1,
    type: CARD_TYPE.SKILL,
    rarity: CARD_RARITY.COMMON,
    descriptionZh: '回复 3 点生命。\n获得 4 点格挡。',
    descriptionEn: 'Heal 3 HP.\nGain 4 Block.',
    effects: [
      { type: 'heal', value: 3 },
      { type: 'block', value: 4 },
    ],
  },

  lazy_stretch: {
    id: 'lazy_stretch',
    nameZh: '懒洋洋',
    nameEn: 'Lazy Stretch',
    cost: 0,
    type: CARD_TYPE.SKILL,
    rarity: CARD_RARITY.COMMON,
    descriptionZh: '获得 2 点格挡。\n下回合多抽 1 张牌。',
    descriptionEn: 'Gain 2 Block.\nDraw +1 next turn.',
    effects: [
      { type: 'block', value: 2 },
      { type: 'next_turn_draw_bonus', value: 1 },
    ],
  },

  fish_snack_rain: {
    id: 'fish_snack_rain',
    nameZh: '鱼干雨',
    nameEn: 'Fish Snack Rain',
    cost: 2,
    type: CARD_TYPE.SNACK,
    rarity: CARD_RARITY.UNCOMMON,
    descriptionZh: '获得 5 点饱腹。',
    descriptionEn: 'Gain 5 Fullness.',
    effects: [{ type: 'gain_fullness', value: 5 }],
  },
};

/* ===== 起始牌组 ===== */
export const STARTER_DECK_RECIPE = [
  { id: 'paw_punch', count: 5 },
  { id: 'belly_guard', count: 4 },
  { id: 'sneak_fish_snack', count: 1 },
];

/* ===== 奖励池（v0.1）===== */
export const REWARD_POOL_IDS = [
  'knock_over_cup',
  'orange_crush',
  'healing_purr',
  'lazy_stretch',
  'fish_snack_rain',
];

export function getCardDef(id) {
  return CARDS[id] || null;
}

export function getAllCardDefs() {
  return Object.values(CARDS);
}
