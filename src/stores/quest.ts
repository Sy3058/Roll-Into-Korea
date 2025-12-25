import { defineStore } from 'pinia';
import { ref } from 'vue';
import { gameApi } from '@/api/gameApi';
import type { LandmarkMapData } from '@/types/game';

export const useQuestStore = defineStore(
  'quest',
  () => {
    // State
    const currentTripData = ref<LandmarkMapData | null>(null);
    const isLoading = ref(false);

    // Actions
    const fetchLandmarkDetail = async (landmarkId: string) => {
      isLoading.value = true;
      resetQuestData();

      try {
        const response = await gameApi.fetchLandmarkMap(landmarkId);

        if (response.success) {
          currentTripData.value = response.data;
          console.log(`여행 데이터 로드 완료: 퀘스트 ${response.data.quests.length}`);
          return true;
        }
        return false;
      } catch (e) {
        console.error('랜드마크 상세 조회 실패:', e);
        return false;
      } finally {
        isLoading.value = false;
      }
    };

    // 사용한 데이터 날리기
    const resetQuestData = () => {
      currentTripData.value = null;
      console.log('퀘스트 데이터 초기화');
    };

    return {
      currentTripData,
      isLoading,
      fetchLandmarkDetail,
      resetQuestData,
    };
  },
  {
    persist: true,
  },
);
