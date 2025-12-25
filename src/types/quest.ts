export interface ApiQuestItem {
  id: number;
  name: string;
  cost: number;
  category: 'FOOD' | 'GIFT';
}

export interface ApiQuestMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'LANDMARK' | 'SHOP';
  description?: string;
  items?: ApiQuestItem[];
}

export interface ApiBoundaryPoint {
  lat: number;
  lng: number;
}

export interface LandmarkMapData {
  quests: ApiQuestMarker[];
  boundary: {
    points: ApiBoundaryPoint[];
  };
}
