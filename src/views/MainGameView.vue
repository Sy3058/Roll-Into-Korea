<template>
  <div class="main-layout">
    <div ref="boardContainer" class="board-section"></div>

    <aside class="sidebar-section">
      <div class="status-panel">
        <div class="profile-wrapper">
          <img :src="profileImg" @click="goToJourney" alt="Profile" class="profile-img" />
        </div>
        <div class="money-row">
          <div class="money-info">
            <div class="coin-icon">₩</div>
            <span class="amount">{{ formattedMoney }}</span>
          </div>
        </div>
      </div>

      <JourneyPanel />

      <RollingDice ref="diceRef" @roll-complete="handleRollComplete" />

      <div class="dice-control-area">
        <button class="btn-3d black" @click="onRollClick" :disabled="isRolling || isMoving">
          <div class="btn-content">
            <img :src="diceIcon" alt="Dice" class="dice-icon-small" />
            <span class="btn-text">{{
              isRolling ? 'ROLLING...' : isMoving ? 'MOVING...' : 'ROLL'
            }}</span>
          </div>
        </button>
      </div>
    </aside>

    <GameModal
      :is-open="showModal"
      :title="currentLocName"
      :type="modalType"
      :img-src="currentLocImg"
      :confirm-text="modalType === 'festival' ? '축제 즐기기 (+50,000)' : '여행 떠나기'"
      cancel-text="닫기"
      @confirm="handleModalConfirm"
      @cancel="handleCloseModal"
    >
      <p v-if="modalType === 'festival'">
        {{ currentLocName }}에 도착했습니다!<br />
        신나는 축제를 즐겨보세요.
      </p>
      <p v-else>
        {{ currentLocName }}에 도착했습니다.<br />
        이곳을 탐험해볼까요?
      </p>
    </GameModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { GameBoard } from '@/game/GameBoard';
import JourneyPanel from '@/components/journey/JourneyPanel.vue';
// import StreetViewModal from '@/components/game/StreetViewModal.vue'; // ❌ 제거
import GameModal from '@/components/game/GameModal.vue';
import RollingDice from '@/components/ui/RollingDice.vue';
import diceIcon from '@/assets/ui/dice_3D_detailed.png';
import profileImg from '@/assets/images/profile.png';

// Store
import { usePlayerStore } from '@/stores/player';
import { useGameStore } from '@/stores/game';
import { BOARD_CONFIG } from '@/game/BoardUtils';

// 모달 상태 관리
const showModal = ref(false);
const modalType = ref<'trip' | 'festival'>('trip');
const currentLocName = ref('');
const currentLocImg = ref(''); // 🆕 [신규] 이미지 URL 상태

// 라우터 관리
const router = useRouter();

// Store 연결
const playerStore = usePlayerStore();
const gameStore = useGameStore();
const { formattedMoney } = storeToRefs(playerStore);

// Refs
const boardContainer = ref<HTMLDivElement | null>(null);
const currentTileIndex = ref<number>(0);
const diceRef = ref<InstanceType<typeof RollingDice> | null>(null);

// Game Instance
let game: GameBoard | null = null;
const isMoving = ref(false);
const isRolling = ref(false);

// Lifecycle
onMounted(async () => {
  if (!boardContainer.value) return;

  if (!gameStore.boardTiles || gameStore.boardTiles.length === 0) {
    await gameStore.fetchInitialData();
  } else {
    console.log('저장된 보드 데이터를 불러옵니다.');
  }

  await playerStore.fetchJourneyData();

  if (gameStore.isTurnInProgress && gameStore.lastDiceResult) {
    console.log(`중단된 턴 복구: 주사위 ${gameStore.lastDiceResult}`);
    const totalTiles = BOARD_CONFIG.TOTAL_TILES || 40;
    const nextIndex = (gameStore.currentTileIndex + gameStore.lastDiceResult) % totalTiles;
    gameStore.setPosition(nextIndex);
    gameStore.endTurn();
  }

  game = new GameBoard({
    container: boardContainer.value,
    initialIndex: gameStore.currentTileIndex,
    boardData: gameStore.boardTiles,
    onTileChange: (index) => {
      currentTileIndex.value = index;
    },
  });

  if (gameStore.lastDiceResult === null && gameStore.currentTileIndex > 0) {
    setTimeout(() => {
      console.log('도착 이벤트 복구 실행');
      checkArrivalEvent();
    }, 500);
  }

  currentTileIndex.value = gameStore.currentTileIndex;
});

/**
 * 도착 이벤트 핸들러
 */
const checkArrivalEvent = async () => {
  if (!game) return;

  const { index } = game.getCurrentTileInfo();
  const tileData = gameStore.boardTiles[index];

  if (!tileData) {
    console.error(`타일 데이터를 찾을 수 없습니다. index: ${index}`);
    return;
  }

  console.log(`도착: [${tileData.name}] (${tileData.type})`);
  console.log(`이미지: ${tileData.imgUrl}`);

  // Store에 위치 동기화
  gameStore.setPosition(index);
  if (gameStore.isEventHandled) return;

  if (tileData.type === 'festival') {
    onEnterFest(index); // index만 넘겨줍니다.
  } else if (tileData.type === 'basic') {
    await gameStore.arriveAtTile(index);

    currentLocName.value = tileData.name;
    currentLocImg.value = tileData.imgUrl
      ? tileData.imgUrl
      : 'https://placehold.co/600x400/png?text=No+Image&font=roboto';

    modalType.value = 'trip';
    setTimeout(() => {
      showModal.value = true;
    }, 300);
  }
};

/**
 * 축제 도착 처리 함수
 */
const onEnterFest = async (index: number) => {
  console.log('축제 도착!');

  const tileData = gameStore.boardTiles[index];

  await gameStore.arriveAtTile(index);

  currentLocName.value = tileData.name;

  currentLocImg.value = tileData.imgUrl
    ? tileData.imgUrl
    : 'https://placehold.co/600x400/orange/white?text=Festival!&font=roboto';

  modalType.value = 'festival';
  setTimeout(() => {
    showModal.value = true;
  }, 300);
};

/**
 * 통합 모달 확인 버튼 핸들러
 */
const handleModalConfirm = () => {
  if (modalType.value === 'festival') {
    handleFestivalConfirm();
  } else {
    // 일반 여행지일 경우 맵(로드뷰)으로 이동
    handleEnterStreetView();
  }
};

const handleFestivalConfirm = () => {
  // confetti 효과 추가 필요
  handleCloseModal();
};

const handleCloseModal = () => {
  showModal.value = false;
  gameStore.completeEvent();
};

const goToJourney = () => {
  router.push('/journey');
};

const onRollClick = () => {
  if (diceRef.value && !isRolling.value && !isMoving.value) {
    gameStore.startTurn();
    isRolling.value = true;
    diceRef.value.roll();
  }
};

const handleRollComplete = async (result: number) => {
  console.log('주사위 결과:', result);
  isRolling.value = false;

  if (game) {
    isMoving.value = true;
    gameStore.setLastDiceResult(result);
    await game.playTurn(result);
    gameStore.endTurn();
    checkArrivalEvent();
    isMoving.value = false;
  }
};

const handleEnterStreetView = () => {
  showModal.value = false;
  gameStore.completeEvent();
  router.push('/map');
};

onUnmounted(() => {
  if (game) game.destroy();
});
</script>

<style scoped>
/* (CSS는 기존과 동일하게 유지) */
/* 전체 레이아웃: 좌우 분할 */
.main-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #f8f4e8;
}

/* 왼쪽: 게임 보드 */
.board-section {
  flex: 1;
  position: relative;
  background-color: #f8f4e8;
  overflow: hidden;
}

/* 오른쪽: 사이드바 */
.sidebar-section {
  width: 380px;
  background-color: #c5d89d;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #ccc;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.status-panel {
  height: 250px;
  background-color: #c5d89d;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border-bottom: 2px solid #fff;
}

.profile-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
.profile-img {
  width: 7vw;
  height: 7vw;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
}

.money-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.money-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 12px 16px;
  border-radius: 12px;
}

.coin-icon {
  width: 28px;
  height: 28px;
  background-color: #333;
  color: #ffc107;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}
.amount {
  font-family: 'Arial', sans-serif;
  font-weight: 800;
  font-size: 1.2rem;
  color: #333;
}

.journey-panel {
  flex: 1;
  background-color: #c5d89d;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dice-control-area {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 6vh;
  margin-top: auto;
}

/* --- 3D Button Core Styles --- */
.btn-3d {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 12vw;
  min-width: 90px;
  height: 90px;
  padding: 0;
  font-size: 16px;
  font-weight: bold;
  color: white;
  border-radius: 12px;
  text-align: center;
  transition: top 0.01s linear;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
  cursor: pointer;
  border: none;
  outline: none;
}
.btn-3d:active {
  top: 9px;
  box-shadow:
    0 0 0 1px #000 inset,
    0 0 0 2px rgba(255, 255, 255, 0.15) inset,
    0 0 0 1px rgba(0, 0, 0, 0.4);
}

.btn-3d.black {
  background-color: #333333;
  box-shadow:
    0 0 0 1px #000 inset,
    0 0 0 2px rgba(255, 255, 255, 0.15) inset,
    0 9px 0 0 #1a1a1a,
    0 9px 0 1px rgba(0, 0, 0, 0.4),
    0 9px 8px 1px rgba(0, 0, 0, 0.5);
}
.btn-3d.black:hover {
  background-color: #444444;
}

.btn-3d:disabled {
  background-color: #555;
  top: 9px;
  box-shadow:
    0 0 0 1px #000 inset,
    0 0 0 2px rgba(255, 255, 255, 0.1) inset,
    0 0 0 1px rgba(0, 0, 0, 0.4);
  cursor: not-allowed;
  opacity: 0.8;
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-top: -6px;
}
.dice-icon-small {
  width: 32px;
  height: 32px;
  object-fit: contain;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3));
}
.btn-text {
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 1px;
}

@media (max-width: 1024px) {
  .sidebar-section {
    width: 300px;
  }
}
</style>
