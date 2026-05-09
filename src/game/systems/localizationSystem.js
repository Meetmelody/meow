/**
 * 本地化系统：单例式语言切换
 * - t(key) 返回当前语言对应文案；若值是函数则原样返回（调用方传参）
 * - getName(def) / getDesc(def) 用于读取数据对象的多语言字段
 *
 * v0.3：
 * - 增加 initLangFromStorage() / setLang() 持久化到 localStorage
 * - 提供 onLangChanged() 订阅，UI 可统一响应切换
 */
import Phaser from 'phaser';
import { STRINGS } from '../data/localization.js';
import { DEFAULT_LANG } from '../config/constants.js';

const LANG_STORAGE_KEY = 'meow_manor_lang_v1';

const state = {
  lang: DEFAULT_LANG,
};

const emitter = new Phaser.Events.EventEmitter();
const EVT_CHANGED = 'lang_changed';

export function initLangFromStorage() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && STRINGS[saved]) state.lang = saved;
  } catch {
    /* localStorage 不可用 → 用默认值 */
  }
}

export function setLang(lang) {
  if (!STRINGS[lang]) return;
  if (state.lang === lang) return;
  state.lang = lang;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* noop */
  }
  emitter.emit(EVT_CHANGED, lang);
}

export function getLang() {
  return state.lang;
}

export function onLangChanged(handler) {
  emitter.on(EVT_CHANGED, handler);
  return () => emitter.off(EVT_CHANGED, handler);
}

export function t(key) {
  const dict = STRINGS[state.lang] || STRINGS[DEFAULT_LANG];
  return dict[key] ?? key;
}

export function getName(def) {
  if (!def) return '';
  return state.lang === 'zh' ? def.nameZh ?? def.nameEn ?? def.id : def.nameEn ?? def.nameZh ?? def.id;
}

export function getDesc(def) {
  if (!def) return '';
  if (state.lang === 'zh') return def.descriptionZh ?? def.descZh ?? def.descriptionEn ?? def.descEn ?? '';
  return def.descriptionEn ?? def.descEn ?? def.descriptionZh ?? def.descZh ?? '';
}
