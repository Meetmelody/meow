/**
 * SaveSummaryPanel：存档摘要小面板（用于 MainMenuScene Continue 旁边）
 *
 * 显示：
 *   - 上次存档：YYYY-MM-DD HH:MM
 *   - 当前房间：xxx
 *   - 生命：64/80 · 鱼干币：134
 *
 * 没有存档时显示「暂无存档」并整体降透明度。
 */
import Phaser from 'phaser';
import { COLORS, HEX, FONTS } from '../config/constants.js';
import { t } from '../systems/localizationSystem.js';
import { getRoomDef } from '../data/rooms.js';
import { getName } from '../systems/localizationSystem.js';

const W = 320;
const H = 130;

function pad(n) {
  return String(n).padStart(2, '0');
}
function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default class SaveSummaryPanel extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setSize(W, H);

    this.bg = scene.add.graphics();
    this.add(this.bg);
    this._drawBg();

    this.titleText = scene.add
      .text(-W / 2 + 14, -H / 2 + 10, '', {
        fontFamily: FONTS.display,
        fontSize: '13px',
        color: HEX.gold,
      });
    this.add(this.titleText);

    this.timeText = scene.add
      .text(-W / 2 + 14, -H / 2 + 32, '', {
        fontFamily: FONTS.body,
        fontSize: '12px',
        color: HEX.textSub,
      });
    this.add(this.timeText);

    this.roomText = scene.add
      .text(-W / 2 + 14, -H / 2 + 52, '', {
        fontFamily: FONTS.display,
        fontSize: '15px',
        color: HEX.cream,
      });
    this.add(this.roomText);

    this.statText = scene.add
      .text(-W / 2 + 14, -H / 2 + 78, '', {
        fontFamily: FONTS.body,
        fontSize: '13px',
        color: HEX.cream,
      });
    this.add(this.statText);
  }

  /**
   * @param {object|null} summary  来自 saveSystem.getSaveSummary
   */
  update(summary) {
    if (!summary) {
      this.titleText.setText(t('summaryEmptyTitle'));
      this.timeText.setText('');
      this.roomText.setText(t('noSaveHint'));
      this.statText.setText('');
      this.setAlpha(0.55);
      return;
    }
    this.setAlpha(1);
    this.titleText.setText(t('summaryTitle'));
    this.timeText.setText(`${t('summarySavedAt')}：${formatTime(summary.savedAt)}`);

    let roomLine;
    if (summary.demoCleared) {
      roomLine = t('summaryDemoCleared');
    } else {
      const def = summary.currentRoomId ? getRoomDef(summary.currentRoomId) : null;
      const name = def ? getName(def) : '—';
      roomLine = `${t('summaryCurrentRoom')}：${name}`;
    }
    this.roomText.setText(roomLine);

    const stats = [
      `${t('labelHp')} ${summary.hp}/${summary.maxHp}`,
      `${t('labelCoins')} ${summary.fishCoins}`,
      `${t('labelDeck')} ${summary.deckSize}`,
    ].join('  ·  ');
    this.statText.setText(stats);
  }

  _drawBg() {
    this.bg.clear();
    this.bg.fillStyle(COLORS.panel, 0.9);
    this.bg.fillRoundedRect(-W / 2, -H / 2, W, H, 12);
    this.bg.lineStyle(2, COLORS.gold, 0.85);
    this.bg.strokeRoundedRect(-W / 2 + 1, -H / 2 + 1, W - 2, H - 2, 11);
    this.bg.lineStyle(1, COLORS.goldDeep, 0.4);
    this.bg.strokeRoundedRect(-W / 2 + 5, -H / 2 + 5, W - 10, H - 10, 8);
  }
}

export const SAVE_SUMMARY_SIZE = { width: W, height: H };
