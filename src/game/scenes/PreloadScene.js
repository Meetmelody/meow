/**
 * PreloadScene：资源加载与占位贴图生成
 * - 尝试加载真实图片（不存在时静默忽略，保留占位贴图）
 * - 通过 Graphics → generateTexture 生成所有占位 UI 资源
 */
import Phaser from 'phaser';
import { SCENES, TEXTURES, COLORS, HEX, FONTS } from '../config/constants.js';
import { IMAGE_MANIFEST } from '../config/assetManifest.js';
import { markRealLoaded } from '../systems/assetResolver.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PRELOAD);
  }

  preload() {
    /**
     * 真实资源加载流程：
     *   1. 先尝试加载 IMAGE_MANIFEST 列出的所有图片
     *   2. 失败时静默忽略（控制台 warn），create() 阶段会用 Graphics 生成占位
     *   3. 运行时通过 systems/assetResolver.resolveTexture(scene, key) 自动 fallback
     */
    this.load.on('loaderror', (file) => {
      console.warn(`[Preload] missing asset, fallback to placeholder: ${file.src}`);
    });

    /* 标记真实成功加载的 key，供 hasRealTexture 区分"真 PNG"与"占位 Graphics" */
    this.load.on('filecomplete', (key) => {
      markRealLoaded(key);
    });

    for (const item of IMAGE_MANIFEST) {
      if (item.type === 'audio') {
        /* 预留：v0.4 接入 BGM/SFX */
      } else {
        this.load.image(item.key, item.path);
      }
    }

    this._drawLoadingScreen();
  }

  create() {
    this._generatePlaceholderTextures();
    this.scene.start(SCENES.MAIN_MENU);
  }

  /* ===================== 占位 UI 与贴图 ===================== */

  _drawLoadingScreen() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.cameras.main.setBackgroundColor(HEX.bgDark);

    this.add
      .text(cx, cy - 30, '喵呜宅邸', {
        fontFamily: FONTS.display,
        fontSize: '48px',
        color: HEX.gold,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy + 24, 'Loading…', {
        fontFamily: FONTS.body,
        fontSize: '18px',
        color: HEX.textSub,
      })
      .setOrigin(0.5);

    const barW = 360;
    const barH = 8;
    const barBg = this.add.graphics();
    barBg.fillStyle(COLORS.panel, 1);
    barBg.fillRoundedRect(cx - barW / 2, cy + 60, barW, barH, 4);

    const bar = this.add.graphics();
    this.load.on('progress', (value) => {
      bar.clear();
      bar.fillStyle(COLORS.gold, 1);
      bar.fillRoundedRect(cx - barW / 2, cy + 60, barW * value, barH, 4);
    });
  }

  _generatePlaceholderTextures() {
    /* 木质面板（深棕 + 金边）*/
    this._makeTexture(TEXTURES.PANEL_WOOD, 320, 180, (g) => {
      g.fillStyle(COLORS.panel, 0.96);
      g.fillRoundedRect(0, 0, 320, 180, 14);
      g.lineStyle(2, COLORS.gold, 0.9);
      g.strokeRoundedRect(2, 2, 316, 176, 13);
      g.lineStyle(1, COLORS.goldDeep, 0.55);
      g.strokeRoundedRect(8, 8, 304, 164, 10);
    });

    /* 木牌按钮（普通）*/
    this._makeTexture(TEXTURES.BUTTON_WOOD, 240, 64, (g) => {
      g.fillStyle(COLORS.wood, 1);
      g.fillRoundedRect(0, 0, 240, 64, 12);
      g.fillStyle(COLORS.woodDark, 0.4);
      g.fillRoundedRect(0, 32, 240, 32, 12);
      g.lineStyle(2, COLORS.gold, 1);
      g.strokeRoundedRect(2, 2, 236, 60, 11);
      g.lineStyle(1, COLORS.goldSoft, 0.4);
      g.strokeRoundedRect(6, 6, 228, 52, 9);
    });

    /* 木牌按钮（hover）*/
    this._makeTexture(TEXTURES.BUTTON_WOOD_HOVER, 240, 64, (g) => {
      g.fillStyle(COLORS.panelLight, 1);
      g.fillRoundedRect(0, 0, 240, 64, 12);
      g.fillStyle(COLORS.gold, 0.18);
      g.fillRoundedRect(0, 0, 240, 64, 12);
      g.lineStyle(2, COLORS.goldSoft, 1);
      g.strokeRoundedRect(2, 2, 236, 60, 11);
    });

    /* 卡牌底框（羊皮纸 + 金边）*/
    this._makeTexture(TEXTURES.CARD_FRAME, 160, 220, (g) => {
      g.fillStyle(COLORS.panel, 1);
      g.fillRoundedRect(0, 0, 160, 220, 12);
      g.fillStyle(0xefe2c2, 0.94);
      g.fillRoundedRect(8, 8, 144, 204, 9);
      g.lineStyle(2, COLORS.gold, 1);
      g.strokeRoundedRect(2, 2, 156, 216, 11);
      g.lineStyle(1, COLORS.goldDeep, 0.6);
      g.strokeRoundedRect(8, 8, 144, 204, 9);
    });

    /* 卡牌 hover 高亮 */
    this._makeTexture(TEXTURES.CARD_FRAME_HOVER, 160, 220, (g) => {
      g.fillStyle(COLORS.panelLight, 1);
      g.fillRoundedRect(0, 0, 160, 220, 12);
      g.fillStyle(0xfff1cf, 1);
      g.fillRoundedRect(8, 8, 144, 204, 9);
      g.lineStyle(3, COLORS.goldSoft, 1);
      g.strokeRoundedRect(2, 2, 156, 216, 11);
    });

    /* 橘子大人占位（橘色猫头） */
    if (!this.textures.exists(TEXTURES.SIR_ORANGE)) {
      this._makeTexture(TEXTURES.SIR_ORANGE, 220, 220, (g) => {
        g.fillStyle(0xe89455, 1);
        g.fillCircle(110, 120, 80);
        g.fillTriangle(50, 60, 80, 30, 90, 78);
        g.fillTriangle(170, 60, 140, 30, 130, 78);
        g.fillStyle(0x2a1f18, 1);
        g.fillCircle(86, 120, 6);
        g.fillCircle(134, 120, 6);
        g.fillStyle(0xffe7c2, 1);
        g.fillCircle(110, 150, 12);
        g.fillStyle(0x2a1f18, 1);
        g.fillCircle(110, 148, 4);
        g.lineStyle(2, 0x2a1f18, 1);
        g.beginPath();
        g.moveTo(60, 120);
        g.lineTo(40, 116);
        g.moveTo(60, 128);
        g.lineTo(38, 130);
        g.moveTo(160, 120);
        g.lineTo(180, 116);
        g.moveTo(160, 128);
        g.lineTo(182, 130);
        g.strokePath();
      });
    }

    /* 扫地机器人占位 */
    if (!this.textures.exists(TEXTURES.ROOMBA_GUARD)) {
      this._makeTexture(TEXTURES.ROOMBA_GUARD, 220, 160, (g) => {
        g.fillStyle(0x2c2c34, 1);
        g.fillEllipse(110, 110, 200, 70);
        g.fillStyle(COLORS.enemyGray, 1);
        g.fillEllipse(110, 100, 200, 70);
        g.lineStyle(2, COLORS.gold, 0.6);
        g.strokeEllipse(110, 100, 200, 70);
        g.fillStyle(COLORS.bloodRed, 1);
        g.fillCircle(86, 86, 8);
        g.fillCircle(134, 86, 8);
        g.fillStyle(0xfff1cf, 0.8);
        g.fillCircle(86, 84, 2);
        g.fillCircle(134, 84, 2);
        g.fillStyle(0x6b6b76, 1);
        g.fillRect(60, 132, 12, 14);
        g.fillRect(80, 132, 12, 14);
        g.fillRect(100, 132, 12, 14);
        g.fillRect(120, 132, 12, 14);
        g.fillRect(140, 132, 12, 14);
      });
    }

    /* 主菜单背景占位 */
    if (!this.textures.exists(TEXTURES.BG_MAIN_MENU)) {
      this._makeTexture(TEXTURES.BG_MAIN_MENU, 1280, 720, (g) => this._drawNightInteriorBg(g, 1280, 720));
    }
    if (!this.textures.exists(TEXTURES.BG_LIVING_ROOM)) {
      this._makeTexture(TEXTURES.BG_LIVING_ROOM, 1280, 720, (g) => this._drawLivingRoomBg(g, 1280, 720));
    }
    if (!this.textures.exists(TEXTURES.BG_MAP)) {
      this._makeTexture(TEXTURES.BG_MAP, 1280, 720, (g) => this._drawNightInteriorBg(g, 1280, 720));
    }

    this._makeTexture(TEXTURES.PLACEHOLDER, 64, 64, (g) => {
      g.fillStyle(COLORS.panel, 1);
      g.fillRect(0, 0, 64, 64);
      g.lineStyle(2, COLORS.gold, 1);
      g.strokeRect(2, 2, 60, 60);
    });
  }

  _drawNightInteriorBg(g, w, h) {
    g.fillGradientStyle(COLORS.bgDarker, COLORS.bgDarker, 0x261a14, 0x110b08, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0x1a1d2c, 0.6);
    g.fillRect(80, 60, 200, 200);
    g.fillStyle(0x3a4a6e, 0.85);
    g.fillCircle(180, 150, 56);
    g.fillStyle(0xc9d6ee, 0.9);
    g.fillCircle(180, 150, 50);
    g.fillStyle(0xfff5d6, 0.18);
    g.fillCircle(180, 150, 80);
    g.fillStyle(COLORS.wood, 0.9);
    g.fillRect(0, h - 110, w, 110);
    g.fillStyle(COLORS.woodDark, 0.6);
    g.fillRect(0, h - 60, w, 60);
    g.fillStyle(0xe8b84a, 0.18);
    g.fillCircle(w / 2, h / 2 + 80, 380);
  }

  _drawLivingRoomBg(g, w, h) {
    this._drawNightInteriorBg(g, w, h);
    g.fillStyle(0x382518, 1);
    g.fillRect(w - 320, h - 290, 280, 180);
    g.fillStyle(0x4a3424, 1);
    g.fillRect(w - 320, h - 290, 280, 30);
    g.fillStyle(0x2a1f18, 0.9);
    g.fillRect(80, h - 230, 220, 120);
    g.fillStyle(0xe8b84a, 0.7);
    g.fillCircle(w - 200, h - 200, 32);
    g.fillStyle(0xfff5d6, 0.25);
    g.fillCircle(w - 200, h - 200, 60);
  }

  _makeTexture(key, w, h, drawFn) {
    if (this.textures.exists(key)) return;
    const g = this.add.graphics({ x: 0, y: 0, add: false });
    drawFn(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
