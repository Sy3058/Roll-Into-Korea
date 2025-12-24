// 플레이어 위치, 돈, 현재 턴 상태
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { gameApi } from '@/api/gameApi';
import type { QuestData } from '@/types/quest';
import type { BoardTile } from '@/types/game';
import { usePlayerStore } from './player';
import { BOARD_CONFIG, getTileInfo } from '@/game/BoardUtils';

export const useGameStore = defineStore(
  'game',
  () => {
    // State
    const memberInfo = ref<any>(null); // 최초 상태
    const boardTiles = ref<BoardTile[]>([]);
    const currentTileIndex = ref(0); // 말의 위치
    const targetLocation = ref<QuestData | null>(null); // 거리뷰로 보여줄 장소

    // state 판별
    const isTurnInProgress = ref(false); // 턴 진행 상태 (주사위 굴림 여부 등)
    const lastDiceResult = ref<number | null>(null);
    const isEventHandled = ref(false); // 현재 칸 모달 등 처리 완료 여부
    const isLoading = ref(false);

    // Store
    const playerStore = usePlayerStore();

    // Actions

    /**
     * 초기 게임 데이터 로드
     */
    const fetchInitialData = async () => {
      isLoading.value = true;
      try {
        const response = await gameApi.fetchGameInit();

        if (!response.success) {
          console.error('서버 에러 메시지:', response.message);
          throw new Error(response.message);
        }

        const data = response.data;

        const totalTiles = BOARD_CONFIG.TOTAL_TILES;

        // 멤버 정보 저장 & 돈 동기화
        memberInfo.value = data.memberStatus;
        playerStore.money = data.memberStatus.points;

        // 백엔드 데이터 sequence 순으로 정렬
        const landmarkQueue = [...data.landmarks].sort((a, b) => a.sequence - b.sequence);

        // 축제 데이터는 무작위로 섞기
        const festivalQueue = [...data.festivals].sort(() => Math.random() - 0.5);

        // 타일 데이터 생성 (보드판 순회하며 빈칸 채움)
        const tiles: BoardTile[] = Array.from({ length: totalTiles }, (_, i) => {
          // 기본 타입 가져오기
          const struct = getTileInfo(i);

          // 기본 골격 생성
          const tile: BoardTile = {
            index: i,
            id: `empty_${i}`,
            name: struct.name,
            type: struct.type,
            imgUrl: '',
            description: '',
            reward: 0,
            raw: null,
          };

          if (struct.type === 'basic') {
            const land = landmarkQueue.shift();
            if (land) {
              tile.id = land.id;
              tile.name = land.name;
              tile.reward = land.reward;
              tile.imgUrl = land.thumbnailImgUrl;
              tile.description = land.description;
              tile.lat = land.lat;
              tile.lng = land.lng;
              tile.raw = land;
            }
          } else if (struct.type === 'festival') {
            const fest = festivalQueue.pop();
            if (fest) {
              tile.id = fest.contentId;
              tile.name = fest.title;
              tile.imgUrl = fest.firstImage;
              tile.description = fest.description || '즐거운 축제를 즐겨보세요!';
            } else {
              // 축제 없으면 기본값으로 대체
              tile.id = `festival_empty_${i}`;
              tile.name = '축제';
              tile.imgUrl = '';
              tile.description = '현재 진행중인 축제가 없어요!';
            }
            tile.reward = 50000;
          }

          return tile;
        });

        boardTiles.value = tiles;
        console.log('데이터 로드 완료:', tiles.length);
      } catch (e) {
        console.error('데이터 로드 실패:', e);
      } finally {
        isLoading.value = false;
      }
    };

    /**
     * 도착 후 보상 제공
     */
    const arriveAtTile = async (index: number) => {
      const tile = boardTiles.value[index];
      if (!tile || !tile.id) return;

      // 보상을 제공하지 않는 칸이면 패스
      if (tile.id.startsWith('empty_') || tile.type === 'corner' || tile.type === 'chance') {
        console.log('보상이 없는 칸입니다');
        return;
      }

      try {
        const response = await gameApi.claimReward(tile.reward);

        if (response.success) {
          playerStore.money = response.data.money;
          console.log(`보상 획득! 잔액: ${playerStore.money}`);
        }
      } catch (e) {
        console.error('보상 청구 실패:', e);
      }
    };

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

    // 마지막으로 굴린 주사위 결과 (중간 이탈 방지)
    const setLastDiceResult = (result: number | null) => {
      lastDiceResult.value = result;
    };

    // 턴 종료
    const endTurn = () => {
      isTurnInProgress.value = false;
      lastDiceResult.value = null;
    };

    return {
      // State
      memberInfo,
      boardTiles,
      currentTileIndex,
      targetLocation,
      isTurnInProgress,
      lastDiceResult,
      isEventHandled,
      isLoading,

      // Actions
      fetchInitialData,
      arriveAtTile,
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
