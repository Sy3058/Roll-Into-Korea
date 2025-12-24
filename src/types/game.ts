// src/types/game.ts
import type { Ref } from 'vue';
import type { Graphics, Texture, Text, ColorSource } from 'pixi.js';

// Graphics에 textNode 속성 추가
export interface TileGraphics extends Graphics {
  textNode?: Text;
}

export interface GameOptions {
  container: HTMLElement;
  onTileChange?: (index: number) => void;
  initialIndex?: number; // 초기 위치 설정용
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
  color?: ColorSource;
  name?: string;
  price?: number;
  backgroundColor?: ColorSource;
}

// =================== 보드 관련 ===================
export type BoardRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export interface TileInfo {
  index: number;
  name?: string;
  type?: CardType;
  price?: number;
}

// =================== Player & Game State ===================
export type PlayerData = {
  id: string;
  name: string;
  position: number;
  color: number;
  money?: number;
};

export interface Particle extends Graphics {
  vx: number;
  vy: number;
  gravity: number;
  rotationSpeed: number;
  life?: number;
}

// Composable 반환 타입
export interface UseDiceReturn {
  isRolling: Ref<boolean>;
  isLoaded: Ref<boolean>;
  diceTextures: Ref<DiceTextureArray>;
  loadDiceAssets: () => Promise<void>;
  generateRoll: () => number;
}
