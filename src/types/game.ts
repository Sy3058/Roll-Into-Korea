// 게임 데이터 타입
import type { Ref } from 'vue';
import type { Graphics, Texture, Text, ColorSource } from 'pixi.js';

// Graphics에 textNode 속성 추가
export interface TileGraphics extends Graphics {
  textNode?: Text;
}

export interface GameOptions {
  container: HTMLElement;
  diceTextures: DiceTextureArray;
  // 이동했는지 vue로 전달
  onTileChange?: (index: number) => void;
}

// 주사위 텍스처 배열
export type DiceTextureArray = (Texture | null)[];

// =================== 카드 관련 ===================

export type CardType = 'basic' | 'corner' | 'chance' | 'festival';

export interface BoardCardOptions {
  width: number;
  height: number;
  type: CardType;
  index: number;
  // corner나 chance는 필요 없으므로 선택적 속성
  color?: ColorSource;
  name?: string; // 도시 이름
  price?: number;
  backgroundColor?: ColorSource;
}

// =================== 보드 관련 ===================
// getRectForIndex 함수가 반환하는 좌표 및 크기 정보
export type BoardRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type TileData = {
  id: number;
  type: 'corner' | 'path'; // 코너인지 일반 길인지 구분
  rect?: BoardRect; // 시각적 위치 정보
};

export interface TileInfo {
  index: number;
  name?: string;
  type?: CardType;
  price?: number;
}

// =================== Player ===================
export type PlayerData = {
  id: string;
  name: string;
  position: number; // 현재 타일 인덱스 (0 ~ 39)
  color: number; // 플레이어 색상 (Hex)
  money?: number;
};

export type GameState = {
  players: PlayerData[];
  currentTurnPlayerId: string;
  isGameActive: boolean;
};

export interface Particle extends Graphics {
  vx: number; // x축 속도
  vy: number; // y축 속도
  gravity: number; // 중력
  rotationSpeed: number; // 회전 속도
  life?: number; // (선택) 수명
}

// Composable 반환 타입
export interface UseDiceReturn {
  isRolling: Ref<boolean>;
  isLoaded: Ref<boolean>;
  diceTextures: Ref<DiceTextureArray>;
  loadDiceAssets: () => Promise<void>;
  generateRoll: () => number;
}
