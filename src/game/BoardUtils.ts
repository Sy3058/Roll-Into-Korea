import type { BoardRect } from '@/types/game';

// 기본 보드 구성 요소 정의
export const BOARD_CONFIG = {
  TOTAL_TILES: 40,
  TILES_PER_SIDE: 9,
  UNIT_W: 2,
  UNIT_H: 3,
  BASE_UNIT_PX: 60,
};

/**
 * 타일 정보 관련 함수
 */
export function getTileInfo(index: number) {
  let type: 'basic' | 'corner' | 'chance' | 'festival' = 'basic';
  let name = '';
  const price = 0;
  let color = undefined;

  // 타입 결정
  if (index % (BOARD_CONFIG.TILES_PER_SIDE + 1) === 0) {
    type = 'corner';
    name = index === 0 ? 'START' : 'CORNER';
  } else if ([4, 17, 23, 34].includes(index)) {
    type = 'chance';
  } else if ([5, 15, 25, 35].includes(index)) {
    type = 'festival';
  }

  // 색상 결정 (Basic 타입일 때만)
  if (type === 'basic') {
    if (index < 10) color = 0xff0000;
    else if (index < 20) color = 0x00ff00;
    else if (index < 30) color = 0x0000ff;
    else color = 0xffff00;
  }

  return { type, name, price, color };
}

/**
 * 타일 인덱스에 따른 그리드 좌표(x, y, w, h) 계산
 */
export function getBoardRect(index: number): BoardRect {
  const { UNIT_H, UNIT_W, TILES_PER_SIDE } = BOARD_CONFIG;
  const totalSize = UNIT_H * 2 + TILES_PER_SIDE * UNIT_W;

  const cornerIdx1 = 0;
  const cornerIdx2 = TILES_PER_SIDE + 1;
  const cornerIdx3 = (TILES_PER_SIDE + 1) * 2;
  const cornerIdx4 = (TILES_PER_SIDE + 1) * 3;
  const limit = totalSize - UNIT_H;

  // 하단 (Bottom)
  if (index === cornerIdx1) return { x: 0, y: 0, w: UNIT_H, h: UNIT_H };
  if (index > cornerIdx1 && index < cornerIdx2) {
    const step = index - (cornerIdx1 + 1);
    return { x: UNIT_H + step * UNIT_W, y: 0, w: UNIT_W, h: UNIT_H };
  }
  // 우측 (Right)
  if (index === cornerIdx2) return { x: limit, y: 0, w: UNIT_H, h: UNIT_H };
  if (index > cornerIdx2 && index < cornerIdx3) {
    const step = index - (cornerIdx2 + 1);
    return { x: limit, y: UNIT_H + step * UNIT_W, w: UNIT_H, h: UNIT_W };
  }
  // 상단 (Top)
  if (index === cornerIdx3) return { x: limit, y: limit, w: UNIT_H, h: UNIT_H };
  if (index > cornerIdx3 && index < cornerIdx4) {
    const step = index - (cornerIdx3 + 1);
    const startX = limit - UNIT_W - step * UNIT_W;
    return { x: startX, y: limit, w: UNIT_W, h: UNIT_H };
  }
  // 좌측 (Left)
  if (index === cornerIdx4) return { x: 0, y: limit, w: UNIT_H, h: UNIT_H };
  if (index > cornerIdx4) {
    const step = index - (cornerIdx4 + 1);
    const startY = limit - UNIT_W - step * UNIT_W;
    return { x: 0, y: startY, w: UNIT_H, h: UNIT_W };
  }
  return { x: 0, y: 0, w: 1, h: 1 };
}
