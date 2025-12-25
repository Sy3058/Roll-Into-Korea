// src/composables/map/useQuestSystem.ts
import { ref, createVNode, render } from 'vue';
import type { MapQuest } from '@/types/game'; // game.ts에서 import
import QuestMarker from '@/components/map/QuestMarker.vue';

// 퀘스트 객체 (오버레이 포함)
interface QuestObject extends MapQuest {
  overlay: any; // kakao.maps.CustomOverlay
  isVisible: boolean;
  containerElement: HTMLDivElement;
}

// 거리 계산 함수 (기존 유지)
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

export const useQuestSystem = (onQuestClick: (quest: MapQuest) => void) => {
  const quests = ref<QuestObject[]>([]);

  /**
   * 퀘스트 초기화 (API 데이터를 그대로 사용)
   */
  const initQuests = (questList: MapQuest[]) => {
    if (!window.kakao || !window.kakao.maps) return;

    // 기존 오버레이 제거
    quests.value.forEach((q) => q.overlay.setMap(null));
    quests.value = [];

    questList.forEach((data) => {
      // 1. 마커 컨테이너 생성
      const container = document.createElement('div');

      // 2. Vue 컴포넌트 렌더링
      const vnode = createVNode(QuestMarker, {
        name: data.name,
        type: data.type,
        onClick: () => onQuestClick(data), // 데이터 그대로 전달
      });
      render(vnode, container);

      // 3. 카카오 오버레이 생성
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

  /**
   * 가시성 업데이트 (로드뷰 위치 기준)
   */
  const updateQuestVisibility = (roadview: any) => {
    const currentPos = roadview.getPosition();
    const curLat = currentPos.getLat();
    const curLng = currentPos.getLng();
    const VISIBLE_RADIUS = 50; // 50미터

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
