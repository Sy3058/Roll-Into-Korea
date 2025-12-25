import type { BoardRect } from '@/types/game';

// 기본 보드 구성 요소 정의
export const BOARD_CONFIG = {
  TOTAL_TILES: 40,
  TILES_PER_SIDE: 9,
  UNIT_W: 2,
  UNIT_H: 3,
  BASE_UNIT_PX: 60,
};

// 코너 색상 정의 (파스텔톤 모던 마카롱 테마)
const CORNER_COLORS = {
  START: '#FFAFCC', // 시작 (체리 블라썸)
  REST: '#D0F4DE', // 쉼터 (페일 그린)
  TRAIN: '#CDB4DB', // 기차 (오키드 퍼플)
  BUS: '#FCF6BD', // 버스 (버터 옐로우)
};

/**
 * 타일 정보 관련 함수
 */
export function getTileInfo(index: number) {
  // 기본값 설정
  let type: 'basic' | 'corner' | 'chance' | 'festival' = 'basic';
  let name = '';
  const reward = 0;
  let color: string | number | undefined = undefined;

  // 1. 코너 타일 (0, 10, 20, 30) - 우선 순위 가장 높음
  if (index === 0) {
    type = 'corner';
    name = 'START';
    color = CORNER_COLORS.START;
  } else if (index === 10) {
    type = 'corner';
    name = '휴식';
    color = CORNER_COLORS.REST;
  } else if (index === 20) {
    type = 'corner';
    name = '기차여행';
    color = CORNER_COLORS.TRAIN;
  } else if (index === 30) {
    type = 'corner';
    name = '버스여행';
    color = CORNER_COLORS.BUS;
  }
  // 2. 특수 타일 (찬스)
  else if ([4, 17, 23, 34].includes(index)) {
    type = 'chance';
    name = 'CHANCE';
    color = '#008080'; // 찬스 기본색 (회색 등)
  }
  // 3. 특수 타일 (축제)
  else if ([5, 15, 25, 35].includes(index)) {
    type = 'festival';
    name = '축제';
    color = '#FFFFFF';
  }
  // 4. 일반 타일
  else {
    type = 'basic';
    name = `지역 ${index}`;
    // 일반 타일의 색상은 Store의 regionCode 로직을 따르므로 여기선 null 또는 기본값
    color = '#FFFFFF';
  }

  return { type, name, reward, color };
}

/**
 * 타일 인덱스에 따른 그리드 좌표(x, y, w, h) 계산
 */
export function getBoardRect(index: number): BoardRect {
  // ... (좌표 계산 로직은 기존과 동일하므로 그대로 유지) ...
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
