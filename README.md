# 喵呜宅邸：重生之我是一只猫 / Meow Manor: Reborn as a Cat

> A 2D Web card-roguelike prototype where you wake up reborn as a small orange cat in a moonlit manor and must reclaim every room, one battle at a time.

**当前版本 / Current version:** `v0.3 (Polishing Sprint)`

---

## ✨ 简介 / About

- **类型 / Genre:** 2D 单机卡牌 Roguelike Demo
- **平台 / Platform:** Web (desktop browser)
- **状态 / Status:** Playable demo — 5 rooms, 4 enemies (incl. 1 boss), full run loop with save / load and zh / en localization
- **完整设计 + 架构 + 不要做的事 / Full design, architecture & "do-not-touch" list:** see [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)

---

## 🛠 技术栈 / Tech Stack

| | |
| --- | --- |
| Engine | **Phaser 3** (`^3.90.0`) |
| Build  | **Vite** (`^7.x`) |
| Language | Vanilla **JavaScript** (ES Modules, no TypeScript) |
| Persistence | `localStorage` (single save slot + language preference) |
| Lint | ESLint 9 (flat config) |
| UI | Pure Phaser `Graphics` placeholders, dropped-in PNG assets auto-override via `assetManifest.js` |

> ❌ This project intentionally does **not** use React / Vue / Tailwind / TypeScript / any backend.

---

## 🚀 快速开始 / Quick Start

```bash
# Node 18+ recommended
npm install
npm run dev
# → open http://127.0.0.1:5173/
```

Other useful commands:

```bash
npm run build      # production build → dist/
npm run preview    # preview the production build
npm run lint       # ESLint
```

---

## 🎮 游戏流程 / Demo Flow

```
MainMenu  →  Map  →  Living Room  (combat)  →  Reward
                  →  Kitchen      (combat)  →  Reward
                  →  Windowsill   (event 3-choice)
                  →  Study        (combat)  →  Reward
                  →  Attic        (BOSS)    →  Demo Clear 🎉
```

- 5 rooms with directed progression (locked → unlocked → cleared)
- Status effects: `Weak`, `Wet`, `Satisfied` (with hover tooltips)
- Status badges, save summary on the title screen, in-game language toggle (中文 / EN)
- Boss node has its own pulsing aura on the map

---

## 📁 目录结构 / Project Layout (top-level only)

```
src/
├── main.js                    # Phaser entry
└── game/
    ├── config/                # constants, gameConfig, assetManifest
    ├── data/                  # cards / enemies / rooms / events / localization
    ├── systems/               # runState / combatSystem / effectResolver / ...
    ├── ui/                    # Phaser-Container based UI components
    ├── scenes/                # Boot / Preload / MainMenu / Map / Battle / ...
    └── utils/
public/assets/                 # drop real PNG / audio here, manifest auto-resolves
PROJECT_CONTEXT.md             # ← read this before changing anything
```

For the **complete** directory tree, file-by-file responsibilities, data schemas, save format, and the next-sprint roadmap, read [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md).

---

## 🗺 路线图 / Roadmap (next)

- v0.4: second playable character, real relic effects, randomized event pool, audio system
- Polish: card hover damage preview, settings panel (volume / language / reset save)

---

## 📜 License

Personal hobby project — no license declared yet. Please ask before reusing assets or code.
