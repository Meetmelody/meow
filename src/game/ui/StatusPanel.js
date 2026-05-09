/**
 * StatusPanel：左侧玩家状态面板
 * - HP / Block / Energy / Fullness / Coins
 * - update(player) 重新渲染数值与状态
 */
import Phaser from 'phaser';
import { COLORS, HEX, FONTS, STATUS, RULES } from '../config/constants.js';
import { t } from '../systems/localizationSystem.js';
import { listBadgesFromStatuses } from '../systems/statusPresentation.js';
import StatusBadge from './StatusBadge.js';

const PANEL_W = 240;
const PANEL_H = 360;

export default class StatusPanel extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setSize(PANEL_W, PANEL_H);

    this.bg = scene.add.graphics();
    this.add(this.bg);
    this._drawBg();

    this.title = scene.add
      .text(-PANEL_W / 2 + 16, -PANEL_H / 2 + 14, '橘子大人 · Sir Orange', {
        fontFamily: FONTS.display,
        fontSize: '18px',
        color: HEX.gold,
      });
    this.add(this.title);

    /* 行 = label : value */
    this._rows = [];
    const rowKeys = [
      { key: 'hp', label: () => t('labelHp'), color: HEX.hpRed },
      { key: 'block', label: () => t('labelBlock'), color: HEX.blockBlue },
      { key: 'energy', label: () => t('labelEnergy'), color: HEX.energyYellow },
      { key: 'fullness', label: () => t('labelFullness'), color: '#e89455' },
      { key: 'coins', label: () => t('labelCoins'), color: '#e8b84a' },
    ];
    rowKeys.forEach((cfg, i) => {
      const ry = -PANEL_H / 2 + 56 + i * 44;
      const labelText = scene.add
        .text(-PANEL_W / 2 + 18, ry, cfg.label(), {
          fontFamily: FONTS.body,
          fontSize: '13px',
          color: HEX.textSub,
        });
      const valueText = scene.add
        .text(PANEL_W / 2 - 18, ry, '0', {
          fontFamily: FONTS.display,
          fontSize: '20px',
          color: cfg.color,
        })
        .setOrigin(1, 0);
      this.add(labelText);
      this.add(valueText);
      this._rows.push({ ...cfg, labelText, valueText });
    });

    /* 状态徽章容器（多个 StatusBadge）*/
    this.badgeContainer = scene.add.container(-PANEL_W / 2 + 18, PANEL_H / 2 - 44);
    this.add(this.badgeContainer);
    this._badges = [];
  }

  update(player) {
    if (!player) return;
    const map = {
      hp: `${player.hp} / ${player.maxHp}`,
      block: `${player.block ?? 0}`,
      energy: `${player.energy ?? 0} / ${player.maxEnergy ?? 0}`,
      fullness: `${player.fullness ?? 0} / ${player.maxFullness ?? 12}`,
      coins: `${player.fishCoins ?? 0}`,
    };
    for (const row of this._rows) {
      row.valueText.setText(map[row.key]);
      row.labelText.setText(row.label());
    }

    /* 整合 statuses + 满足状态（即使 player.statuses 没显式记录，
       只要 fullness >= 阈值就显示 satisfied 徽章）*/
    const merged = { ...(player.statuses || {}) };
    if ((player.fullness ?? 0) >= RULES.fullnessThresholdSatisfied) {
      merged[STATUS.SATISFIED] = 1;
    } else {
      delete merged[STATUS.SATISFIED];
    }

    this._renderBadges(listBadgesFromStatuses(merged));
  }

  refreshLanguage() {
    for (const row of this._rows) row.labelText.setText(row.label());
    for (const badge of this._badges) badge.refreshLanguage();
  }

  _renderBadges(badges) {
    /* 全清重建（少量元素，开销可接受） */
    for (const b of this._badges) b.destroy();
    this._badges = [];

    let cursorX = 0;
    let cursorY = 0;
    const maxRowWidth = 200;
    badges.forEach(({ present, stacks }) => {
      const badge = new StatusBadge(this.scene, cursorX, cursorY, present, stacks);
      this.badgeContainer.add(badge);
      this._badges.push(badge);
      const w = badge.width || badge.displayWidth || 60;
      cursorX += w + 6;
      if (cursorX > maxRowWidth) {
        cursorX = 0;
        cursorY += 26;
      }
    });
  }

  _drawBg() {
    this.bg.clear();
    this.bg.fillStyle(COLORS.panel, 0.95);
    this.bg.fillRoundedRect(-PANEL_W / 2, -PANEL_H / 2, PANEL_W, PANEL_H, 14);
    this.bg.lineStyle(2, COLORS.gold, 0.9);
    this.bg.strokeRoundedRect(-PANEL_W / 2 + 1, -PANEL_H / 2 + 1, PANEL_W - 2, PANEL_H - 2, 13);
    this.bg.lineStyle(1, COLORS.goldDeep, 0.4);
    this.bg.strokeRoundedRect(-PANEL_W / 2 + 6, -PANEL_H / 2 + 6, PANEL_W - 12, PANEL_H - 12, 10);
  }
}

export const STATUS_PANEL_SIZE = { width: PANEL_W, height: PANEL_H };
