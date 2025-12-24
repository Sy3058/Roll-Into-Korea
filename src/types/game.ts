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

export interface BoardTile {
  index: number; // 0~39 인덱스
  id: string; // 백엔드 ID (없으면 "empty_1")
  name: string; // 장소 이름 (또는 'CHANCE' 등)
  type: 'basic' | 'corner' | 'chance' | 'festival'; // 타일 종류

  // 랜드마크/축제 데이터
  reward: number; // 도착 시 획득 금액
  imgUrl?: string; // 썸네일 이미지
  description?: string; // 설명

  // 지도 좌표
  lat?: number;
  lng?: number;

  // 백엔드 원본 데이터 보관
  raw?: any;
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

// =================== API DTO ===================

// 공통 Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Member Status
export interface BackendMemberStatus {
  profileImgUrl: string;
  points: number;
  trophies: Array<{
    id: number;
    name: string;
    iconUrl: string;
    badgeType: string;
  }>;
  spots: Array<{
    id: number;
    name: string;
    iconUrl: string;
    badgeType: string;
  }>;
  items: Array<{
    id: number;
    name: string;
    iconUrl: string;
    badgeType: string;
  }>;
}

// Landmark
export interface BackendLandmark {
  sequence: number;
  id: string;
  name: string;
  description: string;
  thumbnailImgUrl: string;
  regionCode: string;
  reward: number; // Money given upon arrival
  lat: number;
  lng: number;
}

// Festival
export interface BackendFestival {
  sequence: number;
  contentId: string;
  startDate: string;
  endDate: string;
  title: string;
  firstImage: string;
  description: string;
}

// Game DTO
export interface GameInitData {
  memberStatus: BackendMemberStatus;
  landmarks: BackendLandmark[];
  festivals: BackendFestival[];
}

// Reward
export interface RewardRequest {
  amount: number;
}

export interface RewardResponse {
  money: number; // 잔액
}

// Item
export interface BuyItemRequest {
  name: string;
  cost: number;
  category: string; // FOOD, GIFT
}

export interface BuyItemResponse {
  money: number; // 잔액
  badgeId: number; // 획득한 아이템 ID
}

// Donate
export interface DonateRequest {
  badgeId: number;
}

export interface DonateResponse {
  money: number;
}
