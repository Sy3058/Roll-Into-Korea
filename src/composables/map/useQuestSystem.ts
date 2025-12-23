import { ref, createVNode, render } from 'vue';
import type { QuestData } from '@/types/quest';
import QuestMarker from '@/components/map/QuestMarker.vue';

const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000;
};

export const useQuestSystem = (onQuestClick: (quest: QuestData) => void) => {
  interface QuestObject extends QuestData {
    overlay: kakao.maps.CustomOverlay;
    isVisible: boolean;
    containerElement: HTMLDivElement; // Store the container to clean up Vue later
  }

  const quests = ref<QuestObject[]>([]);

  // dummy data
  const rawQuestData: QuestData[] = [
    {
      id: 1,
      name: 'Geunjeongjeon Hall',
      lat: 37.578611,
      lng: 126.977222,
      type: 'LANDMARK',
      description: 'The main throne hall of Gyeongbokgung Palace.',
    },
    {
      id: 2,
      name: 'Royal Snack Shop',
      lat: 37.579817,
      lng: 126.975968,
      type: 'SHOP',
      items: [
        { id: 101, name: 'Royal Tea', price: 4500, category: 'FOOD' },
        { id: 102, name: 'Rice Cake', price: 3000, category: 'FOOD' },
        { id: 103, name: 'Palace Keyring', price: 8000, category: 'GIFT' },
      ],
    },
    {
      id: 3,
      name: 'Folk Museum',
      lat: 37.581533,
      lng: 126.979068,
      type: 'LANDMARK',
      description: 'A national museum of South Korea.',
    },
  ];

  const initQuests = () => {
    if (!window.kakao || !window.kakao.maps) return;

    rawQuestData.forEach((data) => {
      // 1. Create a container div
      const container = document.createElement('div');

      // 2. Render Vue Component into the container
      const vnode = createVNode(QuestMarker, {
        name: data.name,
        type: data.type,
        onClick: () => onQuestClick(data), // Pass the click handler
      });
      render(vnode, container);

      // 3. Create Kakao Overlay
      const overlay = new window.kakao.maps.CustomOverlay({
        map: null,
        position: new window.kakao.maps.LatLng(data.lat, data.lng),
        content: container,
        yAnchor: 1.5,
        zIndex: 20,
      });

      quests.value.push({
        ...data,
        overlay,
        isVisible: false,
        containerElement: container,
      });
    });
  };

  const updateQuestVisibility = (roadview: kakao.maps.Roadview) => {
    const currentPos = roadview.getPosition();
    const curLat = currentPos.getLat();
    const curLng = currentPos.getLng();
    const VISIBLE_RADIUS = 50;

    quests.value.forEach((q) => {
      const dist = getDistance(curLat, curLng, q.lat, q.lng);

      if (dist <= VISIBLE_RADIUS && !q.isVisible) {
        q.overlay.setMap(roadview);
        q.isVisible = true;
      } else if (dist > VISIBLE_RADIUS && q.isVisible) {
        q.overlay.setMap(null);
        q.isVisible = false;
      }
    });
  };

  return { initQuests, updateQuestVisibility };
};
