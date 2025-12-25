export type QuestType = 'SHOP' | 'LANDMARK';
export type ItemCategory = 'FOOD' | 'GIFT';

export interface ShopItem {
  id: number;
  name: string;
  cost: number;
  category: ItemCategory;
}

export interface QuestNode {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: QuestType;
  description?: string; // 관광지
  items?: ShopItem[]; // 상점
}

// 지도 경계
export interface MapBoundary {
  points: {
    lat: number;
    lng: number;
  }[];
}

// API 응답 데이터
export interface LandmarkTripData {
  quests: QuestNode[];
  boundary: MapBoundary;
}
