// 플레이어 위치, 돈, 현재 턴 상태
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { QuestData } from '@/types/quest';

export const useGameStore = defineStore(
  'game',
  () => {
    // State
    const currentTileIndex = ref(0); // 말의 위치
    const targetLocation = ref<QuestData | null>(null); // 거리뷰로 보여줄 장소
    const isTurnInProgress = ref(false); // 턴 진행 상태 (주사위 굴림 여부 등)
    const lastDiceResult = ref<number | null>(null);
    const isEventHandled = ref(false); // 현재 칸 모달 등 처리 완료 여부

    // Actions
    /**
     * 위치 업데이트
     * @param index - 위치
     */
    const setPosition = (index: number) => {
      currentTileIndex.value = index;
    };

    /**
     * 방문할 장소 설정
     * @param location - 거리뷰에 들어갈 장소 정보
     */
    const setTargetLocation = (location: QuestData) => {
      targetLocation.value = location;
    };

    // 턴 시작
    const startTurn = () => {
      isTurnInProgress.value = true;
      isEventHandled.value = false; // 새로운 턴
    };

    // 이벤트 처리 확인 (확인 or 취소)
    const completeEvent = () => {
      isEventHandled.value = true;
    };

    const setLastDiceResult = (result: number | null) => {
      lastDiceResult.value = result;
    };

    // 턴 종료
    const endTurn = () => {
      isTurnInProgress.value = false;
      lastDiceResult.value = null;
    };

    return {
      currentTileIndex,
      targetLocation,
      isTurnInProgress,
      lastDiceResult,
      isEventHandled,
      completeEvent,
      setPosition,
      setTargetLocation,
      startTurn,
      setLastDiceResult,
      endTurn,
    };
  },
  {
    persist: true,
  },
);
