# PROJECT_CONTEXT.md

> 这份文档是 **《喵呜宅邸：重生之我是一只猫》** 的项目上下文索引，写给"下一位接手开发的人/AI"。  
> 阅读完这份文档后，应当能在不阅读全部源码的前提下，安全地继续开发，知道：在哪里改、为什么这么设计、不要碰什么。

---

## 1. 项目简介

- **中文名**：喵呜宅邸：重生之我是一只猫
- **英文名**：Meow Manor: Reborn as a Cat
- **类型**：2D Web 单机卡牌 Roguelike Demo
- **当前版本**：v0.3（Polishing Sprint 完成）
- **目标体验**：温暖、神秘、轻怪诞的"猫咪宅邸夜晚冒险"
- **当前 Demo 体量**：1 局可通关流程，5 个房间（客厅 → 厨房 → 窗台 → 书房 → 阁楼 Boss）
- **不要做**：登录、注册、多人、后端、数据库。所有持久化走 `localStorage`。

---

## 2. 技术栈

| 项 | 选型 |
| --- | --- |
| 语言 | **JavaScript**（纯 JS，**不要引入 TypeScript**）|
| 框架 | **Phaser 3.90.x**（`AUTO` 渲染）|
| 构建 | **Vite 7.x** |
| Lint | ESLint 9.x（`@eslint/js` recommended + 轻量 unused-vars 配置）|
| 包管理 | npm |
| 字体 | Google Fonts: `Ma Shan Zheng`（display）、`Noto Sans SC`（body）|
| 持久化 | `localStorage`（单存档槽 + 语言偏好）|
| 图形 | Phaser `Graphics.generateTexture` 生成占位贴图，真实美术放进 `public/assets/...` 自动覆盖 |

> ⚠️ **不要引入** React / Vue / Tailwind / TypeScript / 任何 UI 框架。  
> ⚠️ **不要把 Phaser 装进 React 项目**，过去尝试过，已经废弃。

### 命令
```bash
npm install        # 安装
npm run dev        # 启动 Vite 本地服务器（默认 http://127.0.0.1:5173）
npm run build      # 生产构建（输出 dist/）
npm run lint       # ESLint
npm run preview    # 预览生产构建
```

---

## 3. 当前目录结构

```
reborn-as-a-cat/
├── index.html                         # 唯一 HTML 入口；挂载 #game-container
├── package.json
├── vite.config.js                     # base './' + dev 端口 5173
├── eslint.config.js                   # 平铺式 v9 配置
├── PROJECT_CONTEXT.md                 # ← 本文档
├── public/
│   └── assets/
│       ├── images/
│       │   ├── backgrounds/           # main_menu/map_bg/living_room/kitchen/study/attic.png
│       │   ├── characters/            # sir_orange.png
│       │   ├── enemies/               # roomba_guard / fridge_wisp / paper_sprite / sofa_shadow.png
│       │   ├── ui/                    # card_frame / button_wood / panel_wood / icon_*.png
│       │   ├── cards/                 # 预留
│       │   └── icons/                 # 预留
│       └── audio/{bgm,sfx}/           # 预留（v0.4 用）
└── src/
    ├── main.js                        # 入口：先 initLangFromStorage()，再 new Phaser.Game()
    └── game/
        ├── config/
        │   ├── constants.js           # 颜色 / 字体 / 场景键 / 纹理键 / 事件键 / PLAYER_INIT / RULES / STATUS / 房间状态 / SAVE_KEY
        │   ├── gameConfig.js          # createGameConfig()，注册 8 个场景
        │   └── assetManifest.js       # 真实图片路径清单 + ROOM_BATTLE_BG + ENEMY_PORTRAIT + EVENT_BG
        ├── data/                      # ↓↓↓ 全部"数据驱动"，新增内容主要在这里
        │   ├── cards.js               # 8 张卡 + STARTER_DECK_RECIPE + REWARD_POOL_IDS
        │   ├── enemies.js             # 4 个敌人（含 Boss）+ pattern 字符串
        │   ├── rooms.js               # 5 个房间 + DEMO_MAP_NODES + nextRoomId 链
        │   ├── relics.js              # 占位（warm_cushion，效果未生效）
        │   ├── events.js              # moonlight_windowsill 事件
        │   └── localization.js        # zh / en 文案
        ├── systems/                   # ↓↓↓ 业务逻辑层（不依赖 Phaser，除 combatSystem 用 EE）
        │   ├── runState.js            # 单例：玩家长期状态 / 牌组 / 地图进度
        │   ├── saveSystem.js          # localStorage 读写 + getSaveSummary()
        │   ├── localizationSystem.js  # setLang/onLangChanged/initLangFromStorage
        │   ├── deckSystem.js          # drawCards / discardHand / discardCardAt
        │   ├── effectResolver.js      # 卡牌 effect 分发
        │   ├── enemyIntentSystem.js   # pattern 解析（含 + 多动作）
        │   ├── combatSystem.js        # 战斗状态机 + Phaser EventEmitter
        │   ├── rewardSystem.js        # 抽奖励卡 ids
        │   ├── eventSystem.js         # 事件选项效果（HP/Coins/Fullness）
        │   ├── statusPresentation.js  # 状态徽章元数据 + listBadgesFromStatuses
        │   └── assetResolver.js       # 真实图 vs 占位 fallback
        ├── ui/                        # ↓↓↓ 全部继承 Phaser.GameObjects.Container
        │   ├── BaseButton.js          # 通用可点击容器基类
        │   ├── TextButton.js          # 木牌按钮（中英双行）
        │   ├── CardView.js            # 单张卡牌
        │   ├── StatusPanel.js         # 玩家左侧状态面板（含 StatusBadge）
        │   ├── EnemyPanel.js          # 敌人面板（含 IntentView + StatusBadge）
        │   ├── IntentView.js          # 意图多行视图（攻击/格挡/调试）
        │   ├── BattleLogPanel.js      # 战斗日志（最近 8 行）
        │   ├── RoomNodeView.js        # 地图节点（Boss 强化版）
        │   ├── StatusBadge.js         # 单个状态徽章（hover → tooltip）
        │   ├── Tooltip.js             # 场景级共享 tooltip + attachTooltip()
        │   ├── SaveSummaryPanel.js    # 主菜单存档摘要
        │   └── LanguageToggleButton.js# 中英药丸切换
        ├── scenes/
        │   ├── BootScene.js           # 空跳板 → PreloadScene
        │   ├── PreloadScene.js        # 加载 manifest + 生成占位贴图
        │   ├── MainMenuScene.js       # Start / Continue / 摘要 / 语言
        │   ├── MapScene.js            # 5 个房间节点
        │   ├── BattleScene.js         # 通用战斗（任何 enemyId）
        │   ├── RewardScene.js         # 三选一 + 跳过
        │   ├── EventScene.js          # 标题 + 正文 + 三选项
        │   ├── GameOverScene.js       # 失败 → 重来 / 主菜单
        │   └── DemoClearScene.js      # Boss 通关页
        └── utils/
            ├── random.js              # shuffle / pickRandomN / randInt
            ├── objectUtils.js         # deepClone / clamp / nextInstanceId
            └── layout.js              # 手牌位置布局 + fitImageWithin（立绘等比缩放）
```

---

## 4. 已实现功能（v0.1 → v0.3）

### v0.1：最小可玩闭环
- 主菜单 → 客厅战斗（roomba_guard）→ 奖励三选一 → 返回地图
- 卡牌 8 张（5 攻击 + 3 技能/零食 + 4 奖励池）
- 抽牌堆 / 手牌 / 弃牌堆 / 能量 / 格挡 / 饱腹值
- 敌人意图（atk:N、atkx2:N、blk:N）

### v0.2：完整 Demo 流程
- 5 房间线性推进：客厅 → 厨房 → 窗台 → 书房 → 阁楼 Boss → 通关页
- 新敌人：`fridge_wisp`、`paper_sprite`、`sofa_shadow`（Boss）
- 意图字符串扩展：`atkx3:N`、`debuff:weak/wet:N`、`+` 同回合多动作
- 状态系统：Weak（攻击 -25%）、Wet（玩家下回合 −1 能量并扣层）、Satisfied（饱腹 ≥ 9，攻击 +2）
- 事件房（moonlight_windowsill 三选一）
- 房间推进数据驱动：`rooms.js` 的 `nextRoomId` 自动解锁
- Boss 胜利 → DemoClearScene

### v0.3：Polishing Sprint
- **状态可视化**：`StatusBadge` + `Tooltip`，hover 出深色金边描述
- **Boss 节点视觉**：紫色呼吸光晕、紫色描边、加大 BOSS 徽章、locked 时仍 0.7 alpha 显示
- **Continue 摘要**：MainMenu 显示存档时间 / 当前房间 / HP / 鱼干币 / 牌组数
- **中英语言切换**：`LanguageToggleButton` 出现在所有场景；持久化到 `localStorage`；战斗内"软刷新"不重启
- **资源接入机制**：`assetManifest.js` + `assetResolver.js`，真实图片缺失自动 fallback
- **轻量 polish**：满足状态闪现、Continue 加载 toast、DemoClear 标题呼吸、节点 ✓ 勾选

---

## 5. 关键场景说明

> 所有场景都继承 `Phaser.Scene`，构造时把 `SCENES.XXX` 作为 key 传给父类。

| 场景 | 文件 | init 参数 | 主要职责 |
| --- | --- | --- | --- |
| BootScene | `scenes/BootScene.js` | — | 立刻 `scene.start(PRELOAD)` |
| PreloadScene | `scenes/PreloadScene.js` | — | 1) 遍历 `IMAGE_MANIFEST` 加载真图 2) `loaderror` 静默 3) `create()` 中生成占位贴图 4) 跳 MAIN_MENU |
| MainMenuScene | `scenes/MainMenuScene.js` | — | 标题 / Start / Continue / `SaveSummaryPanel` / 语言切换；Continue 成功 toast 后跳 MAP |
| MapScene | `scenes/MapScene.js` | — | 5 个 `RoomNodeView`；`isDemoCleared()` → 直跳通关页；点击按 `room.type` 路由到 BATTLE 或 EVENT；locked/cleared 用 toast 不跳场景 |
| BattleScene | `scenes/BattleScene.js` | `{ roomId, enemyId, isBoss }` | 通用战斗；`startCombat({ runDeck, runPlayer, enemyId })`；boss 胜利跳 DEMO_CLEAR；普通胜利跳 REWARD |
| RewardScene | `scenes/RewardScene.js` | `{ fromRoomId }` | 随机抽 3 张奖励卡；选择 → `addCardToDeck` → MAP；跳过 → MAP |
| EventScene | `scenes/EventScene.js` | `{ eventId, fromRoomId }` | 渲染事件 + 选项；选择 → `applyEventOption` → `markRoomCleared(fromRoomId)` → MAP |
| GameOverScene | `scenes/GameOverScene.js` | — | 重来一局（`resetRun + startNewRun → MAP`） / 回主菜单 |
| DemoClearScene | `scenes/DemoClearScene.js` | — | Boss 通关页；再来一局 / 回主菜单 |

### 场景内通用约定
- **顶部右侧 (`x = GAME_WIDTH - 90, y = 38`)**：`LanguageToggleButton`
  - 默认行为：`scene.restart()`
  - **BattleScene 例外**：传 `onChanged: () => this._softRefreshLanguage()`
- **入场过渡**：用 `this.cameras.main.fadeIn(280, 0, 0, 0)`
- **房间跳转过渡**：MapScene 用 `cameras.main.fadeOut + once('camerafadeoutcomplete')`

---

## 6. 关键系统说明

### 6.1 `runState.js`（单例长期状态）
- 数据：`player / deck / relics / map / clearedLivingRoom / demoCleared / runStarted`
- 玩家初始值来自 `PLAYER_INIT`（HP 80 / Energy 3 / Fullness 0/12 / 99 鱼干币）
- 起始牌组：`STARTER_DECK_RECIPE`（5 paw_punch + 4 belly_guard + 1 sneak_fish_snack）
- 关键方法：
  - `startNewRun()` / `loadRun()` / `resetRun()`
  - `markRoomCleared(roomId)` ← **最重要**：自动按 `nextRoomId` 解锁；boss 类型 → `demoCleared = true`
  - `modifyPlayerHp(delta, floor=0)` / `modifyPlayerCoins` / `modifyPlayerFullness`
  - `saveRun()` 写入 localStorage

### 6.2 `combatSystem.js`（战斗状态机 + Phaser.Events.EventEmitter）
- 单例 `combat`：`{ player, enemy, piles, turn, phase, runDeck }`
- `phase` 取值：`'idle' | 'player' | 'enemy' | 'win' | 'lose'`
- 对外 API：
  - `startCombat({ runDeck, runPlayer, enemyId }, { EVENTS })`
  - `playCard(handIndex, { EVENTS })`、`canPlayCard(handIndex)`
  - `endTurn({ EVENTS })`
  - `getEmitter()` / `getCombat()` / `clearCombat()`
- 事件键全部在 `constants.EVENTS`：
  - `PLAYER_CHANGED / ENEMY_CHANGED / HAND_CHANGED / PILE_CHANGED`
  - `TURN_STARTED / CARD_PLAYED / LOG / COMBAT_WIN / COMBAT_LOSE`
- **Wet 处理**：在 `beginPlayerTurn` 头部消耗 1 层 wet 并把本回合能量 `−1`（不修改 maxEnergy）

### 6.3 `effectResolver.js`（卡牌效果分发）
- `applyCardEffects(cardDef, { combat, log })` → 顺序应用 `effects` 数组
- `applyEffect(effect, ctx)`：根据 `type` 分发，**新增 effect 类型必须在这里加 case**
- 当前支持的 type：
  ```
  damage    { value, bonusIfFullnessAtLeast?: { threshold, value } }
  block     { value }
  gain_fullness { value }
  draw      { value }
  apply_status  { target: 'enemy'|'self', status, value }
  heal      { value }
  next_turn_draw_bonus { value }
  attack_bonus_if_fullness_at_least { threshold, value }
  ```
- 伤害计算管线：`base + attackBonus → 若有 weak ×0.75 → 扣敌人格挡 → 扣 HP`
- `applySatisfiedBonusIfAny(combat)`：在每张卡 / 每回合开始时调用，根据当前 fullness 重置 `attackBonus`

### 6.4 `enemyIntentSystem.js`（意图解析与执行）
- pattern token 文法：
  ```
  atk:N            一次攻击 N
  atkx2:N          连击 2，每次 N
  atkx3:N          连击 3
  blk:N            自身加 N 格挡
  debuff:weak:N    给玩家 N 层 weak
  debuff:wet:N     给玩家 N 层 wet
  <a>+<b>+<c>...   同回合多动作（用 + 连接）
  ```
- API：
  - `parseIntentTokens(rawToken)` → `intent[]`
  - `getCurrentIntents(enemy)` → `intent[]`（首选）
  - `getCurrentIntent(enemy)` → 单个（兼容旧调用）
  - `executeIntents(combat, ctx)` 在玩家结束回合后调用
  - `advanceIntent(enemy)`、`tickStatusesAtTurnEnd(unit)`

### 6.5 `eventSystem.js`（事件选项 → runState 副作用）
- `applyEventOption(option)`：遍历 `option.effects`，直接修改 `runState.player`
- 支持 effect type：`heal / lose_hp / gain_coins / gain_fullness`
- **不要把战斗效果与事件效果混用**，二者作用对象不同（combat.player vs runState.player）

### 6.6 `localizationSystem.js`
- 单例 `state.lang`（默认 `'zh'`）
- 持久化：`localStorage['meow_manor_lang_v1']`
- API：`t(key)` / `getName(def)` / `getDesc(def)` / `setLang(lang)` / `onLangChanged(handler)` / `initLangFromStorage()`
- **入口已在 `src/main.js` 调用 `initLangFromStorage()`**，新场景不用手动初始化

### 6.7 `assetResolver.js`
- `resolveTexture(scene, key)`：scene 已有 → 返回；否则查 `assetManifest.fallback`；都没有 → `TEXTURES.PLACEHOLDER`
- `resolveBattleBackground(scene, roomId)`：按 roomId 查 `ROOM_BATTLE_BG`
- `resolveEnemyPortrait(scene, enemyId)`：按 enemyId 查 `ENEMY_PORTRAIT`
- `resolveEventBackground(scene, eventId)`：按 eventId 查 `EVENT_BG`，缺失回到 `BG_MAP`
- `hasRealTexture(scene, key)`：判断"真贴图"是否真的加载成功；用于场景按真图 / 占位走轻 / 重蒙版分支（`EventScene` 已使用）
- 新增贴图：在 `assetManifest.js` 加一行；占位会自动 fallback

### 6.8 `statusPresentation.js`
- `STATUS_PRESENTS[key]` 描述每种状态的图标 / 颜色 / titleKey / tooltipKey / hasStacks
- `listBadgesFromStatuses(statuses)` → 按 weak → wet → satisfied 顺序输出
- **新增状态的 4 件套**：在 `constants.STATUS` 加常量、`STATUS_PRESENTS` 加项、`localization.js` 加 `statusXxx + tooltipXxx`、相关效果在 `combatSystem` / `enemyIntentSystem` 里处理

### 6.9 `Tooltip.js`
- `getOrCreateTooltip(scene)`：每个场景一个共享实例
- `attachTooltip(target, () => ({ title, desc }))`：绑定 hover 显示
- `target` 必须先 `setInteractive`

---

## 7. 核心数据结构

### 7.1 卡牌（cards.js）
```js
{
  id: 'paw_punch',
  nameZh, nameEn,
  cost: 1,
  type: CARD_TYPE.ATTACK,           // attack | skill | snack | trick | power
  rarity: 'basic',                  // basic | common | uncommon | rare
  descriptionZh, descriptionEn,
  effects: [ /* effectResolver 可识别的指令对象 */ ],
}
```
卡牌实例（牌组 / 战斗中）：
```js
{ instanceId: 'card_xxx', cardId: 'paw_punch' }
```

### 7.2 敌人（enemies.js）
```js
{
  id: 'sofa_shadow',
  nameZh, nameEn,
  tier: 'normal' | 'boss',
  maxHp: 88,
  block: 0,
  pattern: ['atk:14', 'debuff:weak:2', 'blk:16', 'atkx3:6', 'atk:18'],
}
```
战斗内 enemy 在 `combat` 中扩展为：
```js
{ ...def, hp: maxHp, block: 0, patternIndex: 0, statuses: {} }
```

### 7.3 房间（rooms.js）
```js
{
  id: 'kitchen',
  nameZh, nameEn,
  type: ROOM_TYPE.COMBAT,           // combat | event | boss | rest
  enemyId, eventId,                 // 二选一
  descZh, descEn,
  nextRoomId: 'windowsill',         // 通关后自动解锁
  roomEffect: null,                 // 预留
}
```
地图节点（runState 内）：
```js
{ roomId: 'living_room', status: 'unlocked' }   // locked | unlocked | cleared
```

### 7.4 事件（events.js）
```js
{
  id, titleZh/En, bodyZh/En,
  options: [
    {
      labelZh, labelEn,
      resultZh, resultEn,
      effects: [
        { type: 'heal', value: 8 },
        { type: 'gain_coins', value: 35 },
        { type: 'lose_hp', value: 5, floor: 1 },
        { type: 'gain_fullness', value: 1 },
      ],
    },
  ],
}
```

### 7.5 战斗 combat
```js
{
  player: {
    hp, maxHp, energy, maxEnergy, block,
    fullness, maxFullness, fishCoins,
    statuses: { weak?: n, wet?: n, satisfied?: 1 },
    attackBonus: 0,
    nextTurnDrawBonus: 0,
  },
  enemy: { ...def, hp, block, patternIndex, statuses },
  piles: { drawPile: [inst...], hand: [inst...], discardPile: [inst...] },
  turn: 0,
  phase: 'idle' | 'player' | 'enemy' | 'win' | 'lose',
  runDeck,
}
```

---

## 8. 当前游戏流程

```
BootScene
  └─▶ PreloadScene  (加载 manifest + 生成占位)
        └─▶ MainMenuScene
              ├─ Start  → startNewRun() → MapScene
              └─ Continue (有存档) → loadRun() + toast → MapScene

MapScene
  ├─ isDemoCleared()  → DemoClearScene
  ├─ 客厅 (combat)    → BattleScene { roomId, enemyId: roomba_guard }
  ├─ 厨房 (combat)    → BattleScene { roomId, enemyId: fridge_wisp }
  ├─ 窗台 (event)     → EventScene  { eventId: moonlight_windowsill, fromRoomId }
  ├─ 书房 (combat)    → BattleScene { roomId, enemyId: paper_sprite }
  └─ 阁楼 (boss)      → BattleScene { roomId, enemyId: sofa_shadow, isBoss: true }

BattleScene
  ├─ 玩家死亡 → GameOverScene
  ├─ 普通敌人胜 → markRoomCleared(roomId) + saveRun() → RewardScene
  └─ Boss 胜利  → markRoomCleared + demoCleared → DemoClearScene

RewardScene
  ├─ 选 1 张 → addCardToDeck + saveRun → MapScene
  └─ Skip   → MapScene

EventScene
  └─ 选 1 项 → applyEventOption + markRoomCleared + saveRun → MapScene

GameOverScene
  ├─ Try Again  → resetRun + startNewRun → MapScene
  └─ Main Menu  → resetRun → MainMenuScene

DemoClearScene
  ├─ Play Again → resetRun + startNewRun → MapScene
  └─ Main Menu  → MainMenuScene
```

---

## 9. localStorage 存档结构

### 9.1 存档槽
- **Key**：`meow_manor_save_v1`
- **Version**：`SAVE_VERSION = 1`（version 不匹配会被视为无存档）
- **写入时机**：进入地图、战斗胜利后、奖励选完、事件选完
- **完整 schema**：
```jsonc
{
  "version": 1,
  "savedAt": 1715321100000,         // ms timestamp
  "player": {
    "id": "sir_orange",
    "hp": 64, "maxHp": 80,
    "energy": 3, "maxEnergy": 3,
    "block": 0,
    "fullness": 4, "maxFullness": 12,
    "fishCoins": 134
  },
  "deck": [
    { "instanceId": "card_xxx", "cardId": "paw_punch" }
    // ... 牌组所有卡
  ],
  "relics": ["warm_cushion"],
  "map": [
    { "roomId": "living_room", "status": "cleared" },
    { "roomId": "kitchen",     "status": "unlocked" },
    { "roomId": "windowsill",  "status": "locked" },
    { "roomId": "study",       "status": "locked" },
    { "roomId": "attic",       "status": "locked" }
  ],
  "clearedLivingRoom": true,
  "demoCleared": false
}
```

### 9.2 存档摘要
- `getSaveSummary()` 不返回完整 deck，仅：
```js
{ savedAt, currentRoomId, demoCleared, hp, maxHp, fishCoins, deckSize }
```
- "currentRoomId" 取地图上 **第一个 unlocked 的房间**；都 cleared → 取最后一个 cleared

### 9.3 语言偏好
- **Key**：`meow_manor_lang_v1`
- **值**：`'zh'` | `'en'`
- **入口读取**：`src/main.js` 调 `initLangFromStorage()` 后再创建 `Phaser.Game`

---

## 10. 目前已知问题 / 限制

### 已知问题
- ⚠️ **战斗中切换语言** 走的是 **软刷新**：`StatusPanel/EnemyPanel/IntentView` 的状态徽章会刷新；但**手牌可能瞬时闪一下**（卡牌 hover 状态会丢失，通过 `_refreshHand()` 重建）。
- ⚠️ **`relics`** 仅有 `warm_cushion` 占位，**实际效果未生效**。
- ⚠️ **`Wet` debuff** 当前仅扣下回合能量；不会在 UI 上播放粒子等强反馈。
- ⚠️ **Tooltip 不跟随鼠标移动**，固定显示在徽章上方；徽章很靠屏幕边缘时已做夹边处理。
- ⚠️ **背景图片** 客厅以外（厨房 / 书房 / 阁楼 / 窗台事件）当前都 **fallback 到占位**（厨/书/阁回到客厅；窗台回到月夜地图）+ 全场暗色蒙版区分；放真实图后自动覆盖。`EventScene` 检测到真图会把蒙版从 `0.6` 降到 `0.25`，月光圆叠加亦同步减弱，避免压暗插画。
- ⚠️ **战斗立绘尺寸** 走包围盒（`SPRITE_BOX` 定义在 `BattleScene.js` 顶部），与源图分辨率解耦：玩家 `300×340`、普通敌人 `320×360`、boss `400×440`。如要整体放大/缩小立绘只改这个常量，不要再加 `setScale`。
- ⚠️ **EnemyPanel 内的小头像** 同样走包围盒（`PORTRAIT_BOX = 90×90`，定义在 `EnemyPanel.js` 顶部），并在 `update(enemy)` 时按 `enemy.id` 切到正确贴图——别再用 `setScale` + 写死的 `TEXTURES.ROOMBA_GUARD`。
- ⚠️ **构建产物 1.2 MB+**：Phaser 全量打包；后续可考虑按需 import / 拆 chunk。

### 不是 bug 但要注意
- `combat` 是 **模块级单例**。`clearCombat()` 必须在场景切换前调用（已经在 `BattleScene._handleVictory/_handleDefeat` 处理）。
- `Phaser.Events.EventEmitter` 也是模块级单例。`BattleScene._bindCombatEvents` 进入时会 `removeAllListeners()`，`shutdown()` 时也会清。**不要在战斗外注册到 `combatSystem.getEmitter()`。**
- 所有 `data/*.js` 中的对象都是 **数据**，**不要在 scene 中直接 mutate 它们**。如果要带战斗状态，请用 `deepClone()`（见 `combatSystem.startCombat`）。
- `runState.player` **会** 被战斗结果覆盖（`setPlayerHp(combat.player.hp)`），其它战斗内字段（block / energy / statuses）不会写回到 runState。

---

## 11. 下一阶段开发计划（v0.4 候选）

> 顺序仅为推荐，按需调整。**不要一次接全部**，每个建议拆成独立 sprint。

### v0.4 内容方向
1. **第二角色**：扩展 `cards.js` + 新角色起始牌组与 portrait；`PLAYER_INIT` 改为按 `characterId` 分支。
2. **遗物系统真正生效**：定义 `relicEffectResolver`，在 `combatSystem.beginPlayerTurn / startCombat` 中触发；`warm_cushion` 改为"战斗开始 +2 格挡"。
3. **事件房扩展**：追加 2~3 个事件，事件池由 `data/events.js` + 房间 `eventPool` 配置随机抽取。
4. **房间随机化**：`runState.map` 不再硬编码 `DEMO_MAP_NODES`，改为按 `floor.config` 随机生成节点。
5. **音效 / BGM**：`assetManifest` 的 audio 类型补完，PreloadScene 加 `this.load.audio`；新建 `systems/audioSystem.js` 控制全局开关与音量（持久化 `meow_manor_audio_v1`）。
6. **真实美术接入**：往 `public/assets/...` 丢同名 PNG 即可逐步替换占位。

### v0.4 polish 方向
1. **卡牌 hover tooltip**：详细伤害计算预览（含当前 weak / satisfied 加成）。
2. **战斗结束后总结**：Reward 之前加一个 0.5s 的"敌人倒下 + 经验/鱼干结算"动画。
3. **Boss 战 BGM 切换**（依赖音频系统）。
4. **设置面板**：音量 / 语言 / 重置存档（合并到 MainMenu 右上角齿轮按钮）。

### 不要做（v0.4 范围之外）
- 多人 / 联机
- 任何形式的账号系统
- 复杂动画引擎（spine / DragonBones）
- 性能优化（项目还远没到瓶颈）

---

## 12. 开发约定 · 不要随意重构

### 12.1 文件职责（一句话）
| 文件 | 唯一职责 |
| --- | --- |
| `data/cards.js` | 卡牌静态数据 |
| `data/enemies.js` | 敌人静态数据（含 pattern）|
| `data/rooms.js` | 房间静态数据 + DEMO_MAP_NODES |
| `data/events.js` | 事件静态数据 |
| `data/relics.js` | 遗物静态数据（v0.3 占位）|
| `data/localization.js` | 全部 UI 文案 + 日志模板 |
| `systems/runState.js` | 玩家长期状态单例（**唯一可写入 player/deck/map 的地方**）|
| `systems/saveSystem.js` | localStorage 读写 + getSaveSummary |
| `systems/combatSystem.js` | 战斗状态机 + EventEmitter（**唯一持有 combat 对象的地方**）|
| `systems/effectResolver.js` | 卡牌 effect 分发（**新效果类型必须在此加 case**）|
| `systems/enemyIntentSystem.js` | pattern 解析与执行（**新意图类型必须在此加分支**）|
| `systems/eventSystem.js` | 事件选项效果（影响 runState）|
| `systems/deckSystem.js` | 牌堆纯函数操作 |
| `systems/rewardSystem.js` | 奖励池抽取 |
| `systems/localizationSystem.js` | 当前语言状态 + 持久化 |
| `systems/statusPresentation.js` | 状态徽章元数据 |
| `systems/assetResolver.js` | 真图 vs 占位 fallback |
| `config/constants.js` | **唯一**集中放魔法值的地方（颜色 / 字体 / 场景键 / 事件键 / 状态键 / 玩家初值 / 规则）|
| `config/gameConfig.js` | Phaser 配置 + 场景注册 |
| `config/assetManifest.js` | 资源清单 + ROOM_BATTLE_BG / ENEMY_PORTRAIT / EVENT_BG 映射 |
| `ui/*` | 渲染层；不允许直接修改 runState / combat |
| `scenes/*` | 装配层；不写业务规则，只调系统 + 渲染 UI |

### 12.2 不要随意做的事
- ❌ **不要把战斗逻辑写进 BattleScene**。所有规则都走 `combatSystem` / `effectResolver` / `enemyIntentSystem`。
- ❌ **不要把卡牌效果写成 `if (cardId === 'xxx')` 的硬编码**。新效果应该作为新的 `effect.type` 加进 `effectResolver`。
- ❌ **不要在 `data/*.js` 里写函数 / 副作用**（除了无副作用的 `getXxxDef`）。
- ❌ **不要在多个地方写魔法值**。比如颜色、玩家初始值、状态键，全部进 `constants.js`。
- ❌ **不要 import React / Tailwind / TS / 任何 UI 框架**。
- ❌ **不要直接读 / 写 localStorage**。所有持久化走 `saveSystem.js` / `localizationSystem.js`。
- ❌ **不要给 Phaser 单例 EventEmitter 漏注册不清理**。每个场景的监听都必须在 `shutdown()` 或下一次 `_bindCombatEvents` 时清理。
- ❌ **不要重命名 SCENES.* 常量**。它们是 Phaser 场景 key，存档里也可能引用未来加上。

### 12.3 要做的事
- ✅ 加新内容：先想清楚是 **数据**（去 `data/`）还是 **规则**（去 `systems/`）还是 **视觉**（去 `ui/`）。
- ✅ 加新场景：在 `constants.SCENES` 加 key、`gameConfig.scene` 数组里注册、新建 `scenes/XxxScene.js` 继承 `Phaser.Scene`。
- ✅ 加新 UI 组件：放在 `ui/` 下，继承 `Phaser.GameObjects.Container`，文件名 PascalCase。
- ✅ 加文案：在 `data/localization.js` 的 `zh` 和 `en` **同时**加；动态字符串用函数 `(arg) => 'xxx'`。
- ✅ 加新状态：见 §6.8 的 4 件套。
- ✅ 加新效果类型：在 `effectResolver.applyEffect` 加 case；同时在 `cards.js` 写示例描述。

### 12.4 提交前三件事
```bash
npm run lint    # 必须 0 error
npm run build   # 必须 success
# 浏览器自测：5 个房间走完一遍
```

---

## 附录：常用文件速查

- 改地图节点顺序 / 房间内容 → `src/game/data/rooms.js`
- 改 / 加敌人 → `src/game/data/enemies.js`（pattern 文法见 §6.4）
- 改 / 加卡牌 → `src/game/data/cards.js`（effect 类型见 §6.3）
- 改 / 加事件 → `src/game/data/events.js`（effect 类型见 §6.5）
- 改 / 加文案 → `src/game/data/localization.js`
- 改全局色 / 字体 / 玩家初值 / 战斗规则 → `src/game/config/constants.js`
- 加贴图 → 把 PNG 丢进 `public/assets/...`，再在 `src/game/config/assetManifest.js` 加一行
- 改主菜单布局 → `src/game/scenes/MainMenuScene.js`
- 改地图节点视觉 → `src/game/ui/RoomNodeView.js`
- 改战斗 UI 布局 → `src/game/scenes/BattleScene.js`（仅装配）
- 改卡牌渲染 → `src/game/ui/CardView.js`
- 改战斗规则 → `src/game/systems/combatSystem.js` / `effectResolver.js`

---

**文档版本**：与 v0.3 一致  
**最后更新**：2026-05-09  
**联系/恢复方法**：把整份文档贴给新会话即可继续开发。
