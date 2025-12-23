export type QuestType = 'SHOP' | 'LANDMARK';
export type ItemCategory = 'FOOD' | 'GIFT';

export interface ShopItem {
  id: number;
  name: string;
  price: number;
  category: ItemCategory;
}

export interface QuestData {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: QuestType;
  description?: string; // 관광지
  items?: ShopItem[]; // 상점
}
