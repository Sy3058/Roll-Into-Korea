<template>
  <div class="map-wrapper">
    <div id="roadview" ref="rvRef"></div>
    <div id="minimap" ref="mapRef"></div>

    <BaseButton class="finish-btn" variant="danger" size="lg" @click="isFinishModalOpen = true">
      여행 끝내기
    </BaseButton>

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
          (여행을 끝내면 다시 돌아올 수 없습니다)
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
import type { QuestData, ShopItem } from '@/types/quest';

// Composables
import { useKakaoLoader } from '@/composables/map/useKakaoLoader';
import { useGeofencing } from '@/composables/map/useGeofencing';
import { useMapWalker } from '@/composables/map/useMapWalker';
import { useQuestSystem } from '@/composables/map/useQuestSystem';

// Store
import { usePlayerStore } from '@/stores/player';

// Components
import BaseButton from '@/components/common/BaseButton.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import LocationModal from '@/components/map/LocationModal.vue';

const mapRef = ref<HTMLElement | null>(null);
const rvRef = ref<HTMLElement | null>(null);
const router = useRouter();

// Store 연결
const playerStore = usePlayerStore();
const { money } = storeToRefs(playerStore); // 반응형 유지

// UI States
const isFinishModalOpen = ref(false);
const isLocationModalOpen = ref(false);
const isWarningVisible = ref(false);
const warningMsg = ref('');
const selectedQuest = ref<QuestData | null>(null);

// Helper
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

// Pass click handler to QuestSystem
const { initQuests, updateQuestVisibility } = useQuestSystem((quest) => {
  selectedQuest.value = quest;
  isLocationModalOpen.value = true;
});

// 구매 로직
const handleBuyItem = async (item: ShopItem) => {
  // 중복 클릭 방지 (스토어 상태 활용)
  if (playerStore.isTransactionPending) return;

  // 스토어 액션 호출
  const success = await playerStore.buyItem(item);

  // UI 피드백
  if (success) {
    showToast(`💳 ${item.name} 구매 완료!`);
  } else {
    showToast('💸 잔액이 부족하거나 오류가 발생했습니다!');
  }
};

const confirmFinish = () => {
  isFinishModalOpen.value = false;
  router.push('/game');
};
const closeLocationModal = () => {
  isLocationModalOpen.value = false;
  selectedQuest.value = null;
};

onMounted(async () => {
  if (!mapRef.value || !rvRef.value) return;

  try {
    await loadScript();
    window.kakao.maps.load(() => {
      const kakao = window.kakao.maps;

      // Start Point
      const startPosition = new kakao.LatLng(37.578611, 126.977222);

      // Initialize
      const map = new kakao.Map(mapRef.value!, { center: startPosition, level: 4 });
      const roadview = new kakao.Roadview(rvRef.value!);
      const rvClient = new kakao.RoadviewClient();

      // Boundary
      const boundaryPath = getBoundaryPath();
      new kakao.Polygon({
        map: map,
        path: boundaryPath,
        strokeWeight: 2,
        strokeColor: '#FF0000',
        fillColor: '#FF0000',
        fillOpacity: 0.15,
      });

      // Walker
      const walker = createWalker(startPosition);
      walker!.setMap(map);

      // Events
      let lastValidPanoId: number | null = null;

      kakao.event.addListener(roadview, 'position_changed', () => {
        const newPos = roadview.getPosition();
        const currentPanoId = roadview.getPanoId();

        if (isPointInPolygon(newPos, boundaryPath)) {
          lastValidPanoId = currentPanoId;
          map.setCenter(newPos);
          updateWalkerPosition(newPos);
          updateQuestVisibility(roadview);
        } else {
          showToast('지정된 구역을 벗어날 수 없습니다.');
          if (lastValidPanoId) {
            roadview.setPanoId(lastValidPanoId, roadview.getPosition());
          }
        }
      });

      kakao.event.addListener(roadview, 'viewpoint_changed', () => {
        updateWalkerRotation(roadview.getViewpoint().pan);
      });

      // Initial Load
      rvClient.getNearestPanoId(startPosition, 50, (panoId: number | null) => {
        if (panoId) {
          roadview.setPanoId(panoId, startPosition);
          lastValidPanoId = panoId;

          initQuests(); // Initialize dummy quests
          updateQuestVisibility(roadview);
        }
      });
    });
  } catch (e) {
    console.error(e);
  }
});
</script>

<style>
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
