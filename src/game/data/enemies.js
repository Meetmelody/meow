/**
 * 敌人数据
 *
 * pattern 字符串约定（详见 enemyIntentSystem.js）：
 *   'atk:N'              造成 N 点伤害
 *   'atkx2:N'            造成 N 点伤害，重复 2 次
 *   'atkx3:N'            造成 N 点伤害，重复 3 次
 *   'blk:N'              获得 N 点格挡
 *   'debuff:weak:N'      给玩家施加 N 层虚弱
 *   'debuff:wet:N'       给玩家施加 N 层潮湿
 *   '<a>+<b>+...'        同回合多动作（用 + 连接）
 */

export const ENEMIES = {
  /* 客厅：扫地机器人 */
  roomba_guard: {
    id: 'roomba_guard',
    name: '扫地机器人',
    tier: 'normal',
    maxHp: 42,
    block: 0,
    pattern: ['atk:7', 'blk:8', 'atkx2:4'],
  },

  /* 厨房：冰箱冷气怪
   * 第 3 回合是「Attack 6 + Wet」混合意图
   */
  fridge_wisp: {
    id: 'fridge_wisp',
    name: '冰箱冷气怪',
    tier: 'normal',
    maxHp: 48,
    block: 0,
    pattern: ['debuff:weak:1', 'atk:9', 'atk:6+debuff:wet:1'],
  },

  /* 书房：纸团精 */
  paper_sprite: {
    id: 'paper_sprite',
    name: '纸团精',
    tier: 'normal',
    maxHp: 52,
    block: 0,
    pattern: ['atk:8', 'debuff:weak:1', 'blk:10', 'atkx2:5'],
  },

  /* 阁楼：沙发之下的巨影（v0.2 Boss） */
  sofa_shadow: {
    id: 'sofa_shadow',
    name: '沙发之下的巨影',
    tier: 'boss',
    maxHp: 88,
    block: 0,
    pattern: ['atk:14', 'debuff:weak:2', 'blk:16', 'atkx3:6', 'atk:18'],
  },
};

export function getEnemyDef(id) {
  return ENEMIES[id] || null;
}
