<template>
  <div class="map-wrapper">
    <div id="roadview" ref="rvRef"></div>
    <div id="minimap" ref="mapRef"></div>

    <button class="inventory-btn" @click="isInventoryOpen = true">
      <img :src="bagIconPng" alt="가방" class="bag-icon-img" />
      <span v-if="playerStore.isBagFull" class="alert-dot">!</span>
    </button>

    <BaseButton class="finish-btn" variant="danger" size="lg" @click="isFinishModalOpen = true">
      여행 끝내기
    </BaseButton>

    <InventoryModal :is-open="isInventoryOpen" @close="isInventoryOpen = false" />

    <LocationModal
      :is-open="isLocationModalOpen"
      :location-data="selectedQuest"
      :user-money="money"
      @close="closeLocationModal"
      @buy-item="handleBuyItem"
    />

    <BaseModal :isOpen="isFinishModalOpen" @close="isFinishModalOpen = false">
      <template #header>
        <h3 style="margin: 0; font-weight: bold">여행 종료</h3>
      </template>
      <template #body>
        <p style="margin: 0; font-size: 1.1rem; color: #333">정말로 여행을 끝내시겠습니까?</p>
        <p style="margin: 8px 0 0 0; font-size: 0.9rem; color: #888">
          (획득한 아이템은 전리품으로 저장되며, 여행이 종료됩니다)
        </p>
      </template>
      <template #footer>
        <BaseButton variant="secondary" @click="isFinishModalOpen = false"> 취소 </BaseButton>
        <BaseButton variant="danger" @click="confirmFinish"> 종료하기 </BaseButton>
      </template>
    </BaseModal>

    <Transition name="toast">
      <div v-if="isWarningVisible" class="warning-toast">{{ warningMsg }}</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

// Types
import type { MapQuest, MapQuestItem } from '@/types/game';

// API & Store
import { gameApi } from '@/api/gameApi';
import { usePlayerStore } from '@/stores/player';
import { useGameStore } from '@/stores/game';

// Composables
import { useKakaoLoader } from '@/composables/map/useKakaoLoader';
import { useGeofencing } from '@/composables/map/useGeofencing';
import { useMapWalker } from '@/composables/map/useMapWalker';
import { useQuestSystem } from '@/composables/map/useQuestSystem';

// Components
import BaseButton from '@/components/common/BaseButton.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import LocationModal from '@/components/map/LocationModal.vue';
import InventoryModal from '@/components/game/InventoryModal.vue';

// Assets
import bagIconPng from '@/assets/ui/basket.png';

// Refs
const mapRef = ref<HTMLElement | null>(null);
const rvRef = ref<HTMLElement | null>(null);

const router = useRouter();

// Stores
const playerStore = usePlayerStore();
const gameStore = useGameStore();
const { money } = storeToRefs(playerStore);

// UI States
const isFinishModalOpen = ref(false);
const isLocationModalOpen = ref(false);
const isInventoryOpen = ref(false);
const isWarningVisible = ref(false);
const warningMsg = ref('');
const selectedQuest = ref<MapQuest | null>(null);

// Helper: Toast
let warningTimeout: number | undefined = undefined;
const showToast = (msg: string) => {
  warningMsg.value = msg;
  isWarningVisible.value = true;
  if (warningTimeout) clearTimeout(warningTimeout);
  warningTimeout = setTimeout(() => (isWarningVisible.value = false), 2000);
};

// Composables
const { loadScript } = useKakaoLoader();
const { getBoundaryPath, isPointInPolygon } = useGeofencing();
const { createWalker, updateWalkerPosition, updateWalkerRotation } = useMapWalker();

// Quest System
const { initQuests, updateQuestVisibility } = useQuestSystem((quest) => {
  selectedQuest.value = quest;
  isLocationModalOpen.value = true;
});

// Action: 아이템 구매
const handleBuyItem = async (item: MapQuestItem) => {
  if (playerStore.isTransactionPending) return;
  const success = await playerStore.buyItem(item);
  if (success) {
    showToast(`💳 ${item.name} 구매 완료!`);
  }
};

// Action: 여행 종료
const confirmFinish = async () => {
  try {
    // 서버에 종료 요청
    const response = await gameApi.exitGame();

    if (response.success && response.data) {
      const result = response.data;
      // 뱃지 업데이트
      await playerStore.updateEarnedBadges(result);
      const earnedBadges =
        (result.items?.length || 0) + (result.spots?.length || 0) + (result.trophies?.length || 0);

      alert(`여행 종료!\n배지 ${earnedBadges}개 획득!`);
      playerStore.clearInventory();
      isFinishModalOpen.value = false;
      router.push('/game');
    } else {
      showToast(response.message || '여행 종료 처리에 실패했습니다.');
    }
  } catch (e) {
    console.error('여행 종료 API 오류:', e);
  }
};

const closeLocationModal = () => {
  isLocationModalOpen.value = false;
  selectedQuest.value = null;
};

// Lifecycle
onMounted(async () => {
  if (!mapRef.value || !rvRef.value) return;

  try {
    await loadScript();

    window.kakao.maps.load(async () => {
      const kakao = window.kakao.maps;

      // GameStore에서 현재 타일 정보 가져오기
      const currentTile = gameStore.boardTiles[gameStore.currentTileIndex];

      // 기본값 (광화문)
      let startPosition = new kakao.LatLng(37.578611, 126.977222);
      let landmarkId = '1';

      if (currentTile) {
        // 타일 정보가 있다면 ID와 좌표를 덮어쓰기
        if (currentTile.id) landmarkId = currentTile.id;

        if (currentTile.lat && currentTile.lng) {
          console.log(
            `시작 위치 설정: ${currentTile.name} (${currentTile.lat}, ${currentTile.lng})`,
          );
          startPosition = new kakao.LatLng(currentTile.lat, currentTile.lng);
        }
      }

      // 맵 & 로드뷰 생성
      const map = new kakao.Map(mapRef.value!, { center: startPosition, level: 4 });
      const roadview = new kakao.Roadview(rvRef.value!);
      const rvClient = new kakao.RoadviewClient();

      let boundaryPath: kakao.maps.LatLng[] = [];

      // 미니맵에 퀘스트 마커 추가
      const addMinimapMarkers = (quests: any[]) => {
        quests.forEach((quest) => {
          const imageSrc =
            quest.type === 'SHOP'
              ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
              : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';

          const imageSize = new kakao.Size(24, 35);
          const markerImage = new kakao.MarkerImage(imageSrc, imageSize);

          // 마커 생성 및 미니맵에 표시
          new kakao.Marker({
            map: map,
            position: new kakao.LatLng(quest.lat, quest.lng),
            title: quest.name,
            image: markerImage,
          });
        });
      };

      // 해당 랜드마크의 맵 데이터(퀘스트, 경계선) 로드
      try {
        const response = await gameApi.fetchLandmarkMap(landmarkId);

        if (response.success && response.data) {
          const mapData = response.data;
          boundaryPath = getBoundaryPath(mapData.boundary.points);
          initQuests(mapData.quests);
          addMinimapMarkers(mapData.quests);
        }
      } catch (e) {
        console.error('맵 데이터 로드 실패:', e);
        showToast('맵 데이터를 불러오는데 실패했습니다.');
      }

      // 경계선 그리기
      if (boundaryPath.length > 0) {
        new kakao.Polygon({
          map: map,
          path: boundaryPath,
          strokeWeight: 2,
          strokeColor: '#FF0000',
          fillColor: '#FF0000',
          fillOpacity: 0.15,
        });
      }

      // 내 위치 마커 생성
      const walker = createWalker(startPosition);
      walker!.setMap(map);

      // --- 이벤트 리스너 ---
      let lastValidPanoId: number | null = null;

      kakao.event.addListener(roadview, 'position_changed', () => {
        const newPos = roadview.getPosition();
        const currentPanoId = roadview.getPanoId();

        // 지오펜싱 (경계선이 있을 때만 동작)
        if (boundaryPath.length > 0 && isPointInPolygon(newPos, boundaryPath)) {
          lastValidPanoId = currentPanoId;
          map.setCenter(newPos);
          updateWalkerPosition(newPos);
          updateQuestVisibility(roadview);
        } else if (boundaryPath.length > 0) {
          showToast('지정된 구역을 벗어날 수 없습니다.');
          if (lastValidPanoId) {
            roadview.setPanoId(lastValidPanoId, roadview.getPosition());
          }
        } else {
          // 경계선 데이터가 없는 경우 자유 이동
          map.setCenter(newPos);
          updateWalkerPosition(newPos);
          updateQuestVisibility(roadview);
        }
      });

      kakao.event.addListener(roadview, 'viewpoint_changed', () => {
        updateWalkerRotation(roadview.getViewpoint().pan);
      });

      // 초기 로드뷰 실행
      rvClient.getNearestPanoId(startPosition, 50, (panoId: number | null) => {
        if (panoId) {
          roadview.setPanoId(panoId, startPosition);
          lastValidPanoId = panoId;
          setTimeout(() => {
            updateQuestVisibility(roadview);
          }, 500);
        } else {
          showToast('이 위치의 로드뷰를 찾을 수 없습니다.');
        }
      });
    });
  } catch (e) {
    console.error('카카오맵 로드 실패', e);
  }
});
</script>

<style>
/* MapWalker 스타일 (내 위치 표시) */
.MapWalker {
  width: 0;
  height: 0;
  position: absolute;
  transition: transform 0.1s ease-out;
}
.MapWalker .figure {
  position: absolute;
  width: 14px;
  height: 14px;
  top: -9px;
  left: -9px;
  background-color: #ff0000;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  z-index: 2;
}
.MapWalker .angleBack {
  position: absolute;
  width: 0;
  height: 0;
  top: -20px;
  left: -5px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 10px solid rgba(255, 0, 0, 0.7);
  pointer-events: none;
  z-index: 1;
}

div[id^='_box_util_'] {
  display: none !important;
}
</style>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
#roadview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
#minimap {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 200px;
  height: 200px;
  z-index: 1;
  border: 3px solid white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.inventory-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background-color: #fff;
  border: 4px solid #1a1a1a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.1s ease;
  padding: 10px;
}
.inventory-btn:active {
  transform: scale(0.95);
}
.bag-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
}

.alert-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.finish-btn {
  position: absolute;
  bottom: 30px;
  right: 30px;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.warning-toast {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3000;
  background-color: rgba(33, 33, 33, 0.95);
  color: #f8f4e8;
  padding: 14px 28px;
  border-radius: 30px;
  font-weight: bold;
  font-size: 1rem;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
