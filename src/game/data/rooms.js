/**
 * 房间 / 节点数据（v0.2）
 *
 * 字段：
 *   id, nameZh, nameEn         名称
 *   type                       'combat' | 'event' | 'boss'
 *   enemyId / eventId          根据 type 取一个
 *   descZh / descEn            描述
 *   nextRoomId                 完成后自动解锁的下一间房（推进顺序）
 *   roomEffect                 进入房间额外效果（v0.2 暂留 null）
 */
import { ROOM_TYPE, ROOM_STATUS } from '../config/constants.js';

export const ROOMS = {
  living_room: {
    id: 'living_room',
    nameZh: '客厅',
    nameEn: 'Living Room',
    type: ROOM_TYPE.COMBAT,
    enemyId: 'roomba_guard',
    eventId: null,
    descZh: '月光从落地窗洒进来，扫地机器人开始它的午夜巡逻。',
    descEn: 'Moonlight spills through the window as the Roomba begins its midnight patrol.',
    nextRoomId: 'kitchen',
    roomEffect: null,
  },

  kitchen: {
    id: 'kitchen',
    nameZh: '厨房',
    nameEn: 'Kitchen',
    type: ROOM_TYPE.COMBAT,
    enemyId: 'fridge_wisp',
    eventId: null,
    descZh: '冰箱里似乎有什么在动，冷气从门缝里慢慢溢出。',
    descEn: 'Something moves inside the fridge, and cold mist leaks from the door.',
    nextRoomId: 'windowsill',
    roomEffect: null,
  },

  windowsill: {
    id: 'windowsill',
    nameZh: '窗台',
    nameEn: 'Windowsill',
    type: ROOM_TYPE.EVENT,
    enemyId: null,
    eventId: 'moonlight_windowsill',
    descZh: '窗台上落着一束月光，远处传来一只乌鸦的叫声。',
    descEn: 'Moonlight rests on the windowsill. A crow calls from far away.',
    nextRoomId: 'study',
    roomEffect: null,
  },

  study: {
    id: 'study',
    nameZh: '书房',
    nameEn: 'Study',
    type: ROOM_TYPE.COMBAT,
    enemyId: 'paper_sprite',
    eventId: null,
    descZh: '书页在没有风的地方翻动，纸团像小精灵一样跳了起来。',
    descEn: 'Pages turn where there is no wind. Paper balls jump like tiny spirits.',
    nextRoomId: 'attic',
    roomEffect: null,
  },

  attic: {
    id: 'attic',
    nameZh: '阁楼',
    nameEn: 'Attic',
    type: ROOM_TYPE.BOSS,
    enemyId: 'sofa_shadow',
    eventId: null,
    descZh: '旧沙发下传来低语，巨大的影子正在醒来。',
    descEn: 'Whispers rise beneath an old sofa. A great shadow is waking.',
    nextRoomId: null,
    roomEffect: null,
  },
};

/* ===== 第一版地图节点顺序 ===== */
export const DEMO_MAP_NODES = [
  { roomId: 'living_room', initialStatus: ROOM_STATUS.UNLOCKED },
  { roomId: 'kitchen', initialStatus: ROOM_STATUS.LOCKED },
  { roomId: 'windowsill', initialStatus: ROOM_STATUS.LOCKED },
  { roomId: 'study', initialStatus: ROOM_STATUS.LOCKED },
  { roomId: 'attic', initialStatus: ROOM_STATUS.LOCKED },
];

export function getRoomDef(id) {
  return ROOMS[id] || null;
}
