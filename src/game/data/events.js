/**
 * 事件数据
 *
 * 字段：
 *   id, title, body
 *   options: 数组，每项：
 *     {
 *       label,                按钮文案
 *       result,               选择后日志（可选）
 *       effects: [            作用在 runState.player 的效果（由 eventSystem 处理）
 *         { type: 'heal', value }                          回血（不超过 maxHp）
 *         { type: 'lose_hp', value, floor }                掉血（最低保留 floor，默认 0）
 *         { type: 'gain_coins', value }                    加鱼干币
 *         { type: 'gain_fullness', value }                 加饱腹（不超过 maxFullness）
 *       ]
 *     }
 */

export const EVENTS = {
  moonlight_windowsill: {
    id: 'moonlight_windowsill',
    title: '窗台上的月光',
    body:
      '你跳上窗台。月光像一条银色毯子铺在玻璃上。\n远处传来别的猫的叫声。',
    options: [
      {
        label: '凝视月光',
        result: '月光抚平了伤口。',
        effects: [{ type: 'heal', value: 8 }],
      },
      {
        label: '对月亮喵一声',
        result: '不知谁丢了一袋鱼干。但你的喉咙有些酸。',
        effects: [
          { type: 'gain_coins', value: 35 },
          { type: 'lose_hp', value: 5, floor: 1 },
        ],
      },
      {
        label: '跳下窗台',
        result: '回到地板，肚子里似乎多了一份温暖。',
        effects: [{ type: 'gain_fullness', value: 1 }],
      },
    ],
  },
};

export function getEventDef(id) {
  return EVENTS[id] || null;
}
