/**
 * 事件数据
 *
 * 字段：
 *   id, titleZh/En, bodyZh/En
 *   options: 数组，每项：
 *     {
 *       labelZh, labelEn,           按钮文案
 *       resultZh, resultEn,         选择后日志（可选）
 *       effects: [                  作用在 runState.player 的效果（由 eventSystem 处理）
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
    titleZh: '窗台上的月光',
    titleEn: 'Moonlight on the Windowsill',
    bodyZh:
      '你跳上窗台。月光像一条银色毯子铺在玻璃上。\n远处传来别的猫的叫声。',
    bodyEn:
      'You leap onto the windowsill. Moonlight spreads across the glass like a silver blanket.\nA distant cat calls from outside.',
    options: [
      {
        labelZh: '凝视月光',
        labelEn: 'Gaze at the Moonlight',
        resultZh: '月光抚平了伤口。',
        resultEn: 'The moonlight soothes your wounds.',
        effects: [{ type: 'heal', value: 8 }],
      },
      {
        labelZh: '对月亮喵一声',
        labelEn: 'Meow at the Moon',
        resultZh: '不知谁丢了一袋鱼干。但你的喉咙有些酸。',
        resultEn: 'Someone tossed up a bag of fish jerky. Your throat aches a little.',
        effects: [
          { type: 'gain_coins', value: 35 },
          { type: 'lose_hp', value: 5, floor: 1 },
        ],
      },
      {
        labelZh: '跳下窗台',
        labelEn: 'Hop Down',
        resultZh: '回到地板，肚子里似乎多了一份温暖。',
        resultEn: 'Back on the floor, a small warmth settles in your belly.',
        effects: [{ type: 'gain_fullness', value: 1 }],
      },
    ],
  },
};

export function getEventDef(id) {
  return EVENTS[id] || null;
}
