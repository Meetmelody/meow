/**
 * EventScene：房间事件
 * - 通过 init({ eventId, fromRoomId }) 接收事件 id 与来源房间
 * - 渲染标题/正文/选项；选择后应用效果 → 标记房间已清理 → 返回地图
 */
import Phaser from 'phaser';
import {
  SCENES,
  GAME_WIDTH,
  GAME_HEIGHT,
  HEX,
  COLORS,
  FONTS,
} from '../config/constants.js';
import { getLang, t } from '../systems/localizationSystem.js';
import { getEventDef } from '../data/events.js';
import { applyEventOption } from '../systems/eventSystem.js';
import { markRoomCleared, saveRun } from '../systems/runState.js';
import { resolveEventBackground, hasRealTexture } from '../systems/assetResolver.js';
import { EVENT_BG } from '../config/assetManifest.js';
import TextButton from '../ui/TextButton.js';
import LanguageToggleButton from '../ui/LanguageToggleButton.js';

const CARD_W = 760;
const CARD_H = 380;

export default class EventScene extends Phaser.Scene {
  constructor() {
    super(SCENES.EVENT);
  }

  init(data) {
    this.payload = data || {};
  }

  create() {
    /* 背景：优先取事件专属插画，缺失则回到月夜地图 */
    const bgKey = resolveEventBackground(this, this.payload.eventId);
    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, bgKey)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    /* 真图存在 → 轻蒙版（避免压暗插画细节）；占位时 → 重蒙版（保证文字可读） */
    const desiredKey = EVENT_BG[this.payload.eventId];
    const isCustomBg = desiredKey && hasRealTexture(this, desiredKey);
    const overlayAlpha = isCustomBg ? 0.25 : 0.6;
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, overlayAlpha);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    /* 月光圆：自定义背景时降低叠加，避免与插画冲突 */
    const moonAlphaMul = isCustomBg ? 0.45 : 1;
    const moon = this.add.graphics();
    moon.fillStyle(0x9bb8d8, 0.06 * moonAlphaMul);
    moon.fillCircle(GAME_WIDTH / 2, 200, 220);
    moon.fillStyle(0xfff5d6, 0.1 * moonAlphaMul);
    moon.fillCircle(GAME_WIDTH / 2, 200, 110);

    const def = getEventDef(this.payload.eventId);
    if (!def) {
      this._renderError();
      return;
    }
    this.def = def;

    /* 中央事件卡 */
    this._drawCard();
    this._drawTextContent(def);
    this._drawOptions(def);

    /* 结果文本占位 */
    this.resultText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 40, '', {
        fontFamily: FONTS.body,
        fontSize: '14px',
        color: HEX.goldSoft,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 80 },
      })
      .setOrigin(0.5);

    /* 语言切换 */
    new LanguageToggleButton(this, GAME_WIDTH - 90, 38, {
      onChanged: () => this.scene.restart(),
    });
  }

  /* ============ 渲染 ============ */

  _drawCard() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2 - 60;
    const card = this.add.graphics();
    card.fillStyle(COLORS.panel, 0.95);
    card.fillRoundedRect(cx - CARD_W / 2, cy - CARD_H / 2, CARD_W, CARD_H, 20);
    card.lineStyle(2, COLORS.gold, 0.95);
    card.strokeRoundedRect(cx - CARD_W / 2 + 1, cy - CARD_H / 2 + 1, CARD_W - 2, CARD_H - 2, 19);
    card.lineStyle(1, COLORS.goldDeep, 0.45);
    card.strokeRoundedRect(cx - CARD_W / 2 + 8, cy - CARD_H / 2 + 8, CARD_W - 16, CARD_H - 16, 15);
  }

  _drawTextContent(def) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2 - 60;
    const lang = getLang();

    /* 装饰星点 */
    this.add.text(cx, cy - CARD_H / 2 + 32, '✦', {
      fontFamily: FONTS.display,
      fontSize: '20px',
      color: HEX.goldSoft,
    }).setOrigin(0.5);

    /* 标题 */
    this.add
      .text(cx, cy - CARD_H / 2 + 70, lang === 'zh' ? def.titleZh : def.titleEn, {
        fontFamily: FONTS.display,
        fontSize: '36px',
        color: HEX.gold,
      })
      .setOrigin(0.5)
      .setShadow(0, 0, '#e8b84a', 18, true, true);

    /* 副标题（另一种语言） */
    this.add
      .text(cx, cy - CARD_H / 2 + 108, lang === 'zh' ? def.titleEn : def.titleZh, {
        fontFamily: FONTS.body,
        fontSize: '14px',
        color: HEX.textSub,
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    /* 正文 */
    this.add
      .text(cx, cy - CARD_H / 2 + 170, lang === 'zh' ? def.bodyZh : def.bodyEn, {
        fontFamily: FONTS.body,
        fontSize: '16px',
        color: HEX.cream,
        align: 'center',
        wordWrap: { width: CARD_W - 80, useAdvancedWrap: true },
        lineSpacing: 6,
      })
      .setOrigin(0.5, 0);
  }

  _drawOptions(def) {
    const cx = GAME_WIDTH / 2;
    const baseY = GAME_HEIGHT / 2 + 130;
    const gap = 20;
    const btnW = 240;
    const btnH = 76;
    const totalW = btnW * def.options.length + gap * (def.options.length - 1);
    const startX = cx - totalW / 2 + btnW / 2;
    const lang = getLang();

    def.options.forEach((opt, idx) => {
      const btn = new TextButton(this, startX + idx * (btnW + gap), baseY, {
        width: btnW,
        height: btnH,
        primaryLabel: lang === 'zh' ? opt.labelZh : opt.labelEn,
        secondaryLabel: lang === 'zh' ? opt.labelEn : opt.labelZh,
        primaryFontSize: '20px',
      }).onClick(() => this._handleChoose(idx));
      /* 入场淡入 */
      btn.setAlpha(0);
      btn.y += 12;
      this.tweens.add({
        targets: btn,
        alpha: 1,
        y: baseY,
        duration: 360,
        delay: 80 * idx,
        ease: 'Sine.easeOut',
      });
    });
  }

  _renderError() {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '事件未找到 / Event not found', {
        fontFamily: FONTS.body,
        fontSize: '20px',
        color: HEX.textSub,
      })
      .setOrigin(0.5);
    new TextButton(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, {
      width: 240,
      height: 60,
      primaryLabel: t('btnBackToMap'),
      secondaryLabel: 'Back to Map',
      primaryFontSize: '20px',
    }).onClick(() => this.scene.start(SCENES.MAP));
  }

  /* ============ 选项处理 ============ */

  _handleChoose(optionIndex) {
    const opt = this.def.options[optionIndex];
    applyEventOption(opt);

    const lang = getLang();
    const resultText = lang === 'zh' ? opt.resultZh : opt.resultEn;
    if (resultText) this.resultText.setText(resultText);

    /* 标记房间已清理（按 nextRoomId 自动解锁后续）*/
    if (this.payload.fromRoomId) {
      markRoomCleared(this.payload.fromRoomId);
    }
    saveRun();

    /* 短暂停顿后回到地图 */
    this.time.delayedCall(900, () => {
      this.scene.start(SCENES.MAP);
    });
  }
}
