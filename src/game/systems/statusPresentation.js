/**
 * statusPresentation：把 statuses 字典转成 UI 友好的徽章数据
 *
 * 用途：
 *   - StatusPanel / EnemyPanel 不再各自硬编码图标和颜色
 *   - tooltip 文案集中维护（详见 data/localization.js 的 tooltipXxx）
 *
 * 扩展方式：
 *   - 新状态：在 STATUS_PRESENTS 加一项；并在 localization.js 加对应 statusXxx / tooltipXxx
 */
import { STATUS } from '../config/constants.js';

/**
 * 单状态的展示元数据
 * - icon       简化字符（占位）
 * - color      徽章主色（hex string，给 Phaser text 用）
 * - bgColor    徽章背景色（数字，给 Graphics 用）
 * - titleKey   徽章标题文案 key（在 localization.js）
 * - tooltipKey 徽章 hover 描述 key
 * - hasStacks  是否显示层数（false 则只显示图标 + 标题）
 */
export const STATUS_PRESENTS = {
  [STATUS.WEAK]: {
    key: STATUS.WEAK,
    icon: '☠',
    color: '#d6a4ee',
    bgColor: 0x9c6bb5,
    titleKey: 'statusWeak',
    tooltipKey: 'tooltipWeak',
    hasStacks: true,
  },
  [STATUS.WET]: {
    key: STATUS.WET,
    icon: '💧',
    color: '#9bd6e6',
    bgColor: 0x4a82b5,
    titleKey: 'statusWet',
    tooltipKey: 'tooltipWet',
    hasStacks: true,
  },
  [STATUS.SATISFIED]: {
    key: STATUS.SATISFIED,
    icon: '✦',
    color: '#f2d893',
    bgColor: 0xc88c2a,
    titleKey: 'statusSatisfied',
    tooltipKey: 'tooltipSatisfied',
    hasStacks: false,
  },
};

export function getStatusPresent(key) {
  return STATUS_PRESENTS[key] || null;
}

/**
 * 把单位的 statuses 字典 → 徽章列表
 * - 自动过滤掉 0 / 不存在的状态
 * - Satisfied 不计层数，但需要 stacks > 0 表示存在
 * - 顺序：weak → wet → satisfied → 其它
 */
export function listBadgesFromStatuses(statuses) {
  if (!statuses) return [];
  const order = [STATUS.WEAK, STATUS.WET, STATUS.SATISFIED];
  const seen = new Set();
  const out = [];

  for (const key of order) {
    const stacks = statuses[key] ?? 0;
    if (stacks > 0 && STATUS_PRESENTS[key]) {
      out.push({ present: STATUS_PRESENTS[key], stacks });
      seen.add(key);
    }
  }
  for (const [key, stacks] of Object.entries(statuses)) {
    if (seen.has(key)) continue;
    if (stacks > 0 && STATUS_PRESENTS[key]) {
      out.push({ present: STATUS_PRESENTS[key], stacks });
    }
  }
  return out;
}
