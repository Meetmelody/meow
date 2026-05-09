/**
 * 遗物数据（v0.1 占位）
 * - 第一版只显示一个起始遗物，作为后续扩展锚点
 */

export const RELICS = {
  warm_cushion: {
    id: 'warm_cushion',
    nameZh: '温暖的猫垫',
    nameEn: 'Warm Cushion',
    descZh: '战斗开始时获得 2 点格挡。（占位，效果暂未生效）',
    descEn: 'Gain 2 Block at the start of combat. (Placeholder)',
  },
};

export const STARTER_RELICS = ['warm_cushion'];

export function getRelicDef(id) {
  return RELICS[id] || null;
}
