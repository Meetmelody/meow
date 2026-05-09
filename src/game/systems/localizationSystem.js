/**
 * 文案查询（中文单语版）
 *
 * v0.3.x 简化为中文直通：保留 t/getName/getDesc 这些"查询入口"，
 * 但去掉运行时切换、持久化与事件订阅。
 *
 * 重启 i18n 时只需要：
 *   1. data/localization.js 改回 { zh, en } 嵌套
 *   2. 这里恢复 setLang / onLangChanged / initLangFromStorage
 *   3. 数据对象重新加 nameEn / descriptionEn 等字段
 */
import { STRINGS } from '../data/localization.js';

export function t(key) {
  return STRINGS[key] ?? key;
}

export function getName(def) {
  if (!def) return '';
  return def.name ?? def.id ?? '';
}

export function getDesc(def) {
  if (!def) return '';
  return def.description ?? def.desc ?? '';
}
