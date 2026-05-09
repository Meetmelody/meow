/**
 * 遗物数据（v0.1 占位）
 * - 第一版只显示一个起始遗物，作为后续扩展锚点
 */

export const RELICS = {
  warm_cushion: {
    id: 'warm_cushion',
    name: '温暖的猫垫',
    desc: '战斗开始时获得 2 点格挡。（占位，效果暂未生效）',
  },
};

export const STARTER_RELICS = ['warm_cushion'];

export function getRelicDef(id) {
  return RELICS[id] || null;
}
