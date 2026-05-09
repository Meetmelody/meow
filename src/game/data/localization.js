/**
 * UI 文案集中表
 * - 当前为中文单语版（v0.3.x 简化）
 * - 后续重启 i18n 时，把 STRINGS 改回 { zh, en } 嵌套并恢复 setLang 即可
 */

export const STRINGS = {
  title: '喵呜宅邸',
  subtitle: '重生之我是一只猫',

  btnStart: '开始游戏',
  btnContinue: '继续游戏',
  btnEndTurn: '结束回合',
  btnBackToMenu: '回到主菜单',
  btnRetry: '再来一次',
  btnSkipReward: '跳过奖励',
  btnEnterRoom: '进入',
  btnBackToMap: '返回地图',
  btnPlayAgain: '再来一局',

  labelHp: '生命',
  labelBlock: '格挡',
  labelEnergy: '能量',
  labelFullness: '饱腹',
  labelCoins: '鱼干币',
  labelDeck: '牌组',
  labelHand: '手牌',
  labelDraw: '抽牌堆',
  labelDiscard: '弃牌堆',
  labelIntent: '意图',
  labelLog: '战斗日志',
  labelTurn: '回合',

  statusWeak: '虚弱',
  statusSatisfied: '满足',
  statusWet: '潮湿',
  tooltipWeak: '虚弱：拥有该状态的目标，攻击伤害降低 25%。回合结束扣 1 层。',
  tooltipWet: '潮湿：下一回合开始时能量 -1，并消耗 1 层。',
  tooltipSatisfied: '满足：当饱腹值 ≥ 9 时获得，所有攻击牌额外造成 +2 伤害。',

  rewardTitle: '战斗胜利！',
  rewardSubtitle: '挑选一张卡牌加入牌组',
  gameOverTitle: '九命试炼失败',
  gameOverSubtitle: '宅邸再次沉入夜色…',
  demoClearTitle: '即将开放',
  demoClearSubtitle: '该房间将在后续版本开放，敬请期待。',
  demoClearTitleBig: 'Demo 通关！',
  demoClearBody:
    '你暂时平息了宅邸的异变。\n但阁楼深处，似乎还有更多秘密在等待。',

  nodeTypeCombat: '战斗',
  nodeTypeEvent: '事件',
  nodeTypeBoss: 'BOSS',
  nodeTypeRest: '休憩',
  nodeStatusLocked: '未解锁',
  nodeStatusUnlocked: '可探索',
  nodeStatusCleared: '已清理',

  noSaveHint: '暂无存档',
  saveHint: '进度自动保存',
  summaryTitle: '上次进度',
  summarySavedAt: '上次存档',
  summaryCurrentRoom: '当前房间',
  summaryDemoCleared: '已通关 Demo',
  summaryEmptyTitle: '暂无进度',
  saveLoadedToast: '已读取上次进度',

  cardCostLabel: '费',
  nextTurnDrawHint: '下回合多抽 1 张',

  weakAppliedLog: (n) => `敌人陷入 ${n} 层虚弱`,
  damageLog: (name, dmg) => `${name} 受到 ${dmg} 点伤害`,
  blockLog: (n) => `获得 ${n} 点格挡`,
  healLog: (n) => `回复 ${n} 点生命`,
  fullnessLog: (n) => `饱腹 +${n}`,
  drawLog: (n) => `抽 ${n} 张牌`,
  enemyAttackLog: (name, dmg) => `${name} 攻击造成 ${dmg} 点伤害`,
  enemyBlockLog: (name, n) => `${name} 获得 ${n} 点格挡`,
  enemyApplyWeakLog: (name, n) => `${name} 让你陷入 ${n} 层虚弱`,
  enemyApplyWetLog: (name, n) => `${name} 让你浑身潮湿（${n} 层）`,
  wetPenaltyLog: '潮湿让你少了 1 点能量。',
  turnStartLog: (turn) => `—— 第 ${turn} 回合 ——`,
  victoryLog: '战斗胜利！',
  defeatLog: '你倒下了…',
  eventResultLog: (text) => `> ${text}`,
};
