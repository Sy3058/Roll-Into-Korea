// 지정된 건물에 퀘스트 마크 띄우기
import { ref } from 'vue';

// 하버사인 거리 공식 (미터 단위)
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

export const useQuestSystem = (onQuestClick: (msg: string) => void) => {
  interface QuestObject {
    overlay: kakao.maps.CustomOverlay;
    lat: number;
    lng: number;
    isVisible: boolean;
    name: string;
  }
  const quests = ref<QuestObject[]>([]);

  // TODO: 건물 위치 백엔드와 연결 필요
  const questData = [
    { name: '근정전', lat: 37.578611, lng: 126.977222 },
    { name: '경회루', lat: 37.579817, lng: 126.975968 },
    { name: '향원정', lat: 37.582894, lng: 126.976996 },
    { name: '국립민속박물관', lat: 37.581533, lng: 126.979068 },
  ];

  const initQuests = () => {
    if (!window.kakao) return;

    questData.forEach((data) => {
      const content = document.createElement('div');
      content.className = 'QuestMark';
      content.innerHTML = `
        <div class="icon-bg"><span class="icon-text">!</span></div>
        <div class="quest-name">${data.name}</div>
      `;
      content.onclick = () => onQuestClick(`[퀘스트] ${data.name} 발견!`);

      // 처음엔 map: null로 숨김 상태
      const overlay = new window.kakao.maps.CustomOverlay({
        map: null,
        position: new window.kakao.maps.LatLng(data.lat, data.lng),
        content: content,
        yAnchor: 10.0,
        zIndex: 10,
      });

      quests.value.push({
        overlay,
        lat: data.lat,
        lng: data.lng,
        isVisible: false,
        name: data.name,
      });
    });
  };

  const updateQuestVisibility = (roadview: kakao.maps.Roadview) => {
    const currentPos = roadview.getPosition();
    const curLat = currentPos.getLat();
    const curLng = currentPos.getLng();
    const VISIBLE_RADIUS = 40; // 40m 이내 접근 시 표시

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
