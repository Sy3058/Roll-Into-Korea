<template>
  <div class="game-wrapper">
    <div ref="pixiContainer" class="pixi-container"></div>

    <div class="money-box">
      <div class="coin-icon">₩</div>
      <span class="amount">{{ formattedMoney }}</span>
    </div>

    <button class="journey-btn" @click="handleOpenJourney">
      <img :src="journeyIcon" alt="Journey Note" />
    </button>

    <button class="dice-fab" @click="handleRoll" :disabled="isRolling">
      <img :src="diceIcon" alt="Roll Dice" class="dice-icon" />
    </button>

    <StreetViewModal
      :is-open="showModal"
      :location-name="currentLocName"
      @close="showModal = false"
      @enter-streetview="handleEnterStreetView"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDice } from '@/composables/useDice';
import { GameBoard } from '@/game/GameBoard';
import StreetViewModal from '@/components/ui/StreetViewModal.vue';
import diceIcon from '@/assets/ui/dice_3D_detailed.png';
import journeyIcon from '@/assets/ui/journey_note.png';

// 모달 상태 관리
const showModal = ref(false);
const currentLocName = ref('');

// 라우터 관리
const router = useRouter();

// Composable States
const { isRolling, isLoaded: diceLoaded, diceTextures, loadDiceAssets, generateRoll } = useDice();

// Refs
const pixiContainer = ref<HTMLDivElement | null>(null);
const currentTileIndex = ref<number>(0);
// TODO: 백엔드 연결 필요
const playerMoney = ref(300000);

const formattedMoney = computed(() => {
  return playerMoney.value.toLocaleString();
});

// Game Instance
let game: GameBoard | null = null;

// Lifecycle
onMounted(async () => {
  if (!pixiContainer.value) return;

  // Assets 불러오기
  try {
    await loadDiceAssets();
  } catch (e) {
    console.error('Asset loading warning:', e);
  }

  // Game Engine 초기화
  game = new GameBoard({
    container: pixiContainer.value,
    diceTextures: diceTextures.value,
    // player 움직임에 따라 Vue 업데이트
    onTileChange: (index) => {
      currentTileIndex.value = index;
    },
  });
});

onUnmounted(() => {
  if (game) game.destroy();
});

/**
 * 주사위 굴리기 관리
 */
async function handleRoll() {
  if (isRolling.value || !game) return;

  isRolling.value = true;
  const result = generateRoll();

  // Game Engine에 있는 playTurn 로직 부르기
  await game.playTurn(result);

  // 이동이 끝난 후 도착한 타일 정보 확인
  const tileInfo = game.getCurrentTileInfo();

  // 돈 더하기
  if (tileInfo.price) {
    playerMoney.value += tileInfo.price;
  }
  currentLocName.value = tileInfo.name;

  if (tileInfo.type !== 'corner' && tileInfo.type !== 'chance') {
    showModal.value = true;
  }

  isRolling.value = false;
}

/**
 * 카메라 줌 관리
 * @param delta
 */
function handleZoom(delta: number) {
  if (game) game.changeZoom(delta);
}

const handleEnterStreetView = () => {
  console.log('스트리트뷰 페이지로 이동!');
  showModal.value = false;
};

const handleOpenJourney = () => {
  router.push('/journey');
};
</script>

<style scoped>
.game-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.canvas-wrapper {
  width: 100%;
  height: 100%;
}

.dice-fab {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%); /* 정확한 중앙 정렬 */

  width: 12vh;
  height: 12vh;
  border-radius: 50%; /* 완전한 원 */

  background-color: #333;
  border: 4px solid white; /* 테두리로 구분감 주기 */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3); /* 그림자 효과 */

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 쫀득한 애니메이션 */
}

/* 마우스 올렸을 때 */
.dice-fab:hover {
  transform: translateX(-50%) scale(1.1);
  background-color: #444;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.4);
}

/* 클릭했을 때 */
.dice-fab:active {
  transform: translateX(-50%) scale(0.95); /* 눌리는 느낌 */
}

/* 주사위가 굴러가는 중일 때 (비활성화) */
.dice-fab:disabled {
  background-color: #666;
  cursor: not-allowed;
  opacity: 0.8;
  transform: translateX(-50%) scale(1);
}

/* 내부 이미지 아이콘 */
.dice-icon {
  width: 60%; /* 버튼 크기의 60% */
  height: 60%;
  object-fit: contain;
  pointer-events: none; /* 이미지가 클릭 이벤트를 방해하지 않도록 */
}

.journey-btn {
  position: fixed;
  top: 10vh;
  right: 3vw;

  width: 8vh; /* 정사각형 너비 */
  height: 8vh; /* 정사각형 높이 */

  background-color: white;
  border: 2px solid #eee; /* 옅은 테두리 */
  border-radius: 12px; /* 모서리를 살짝 둥글게 (완전 사각형이 좋으면 0px) */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* 살짝 떠있는 그림자 */

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100; /* 캔버스 위에 위치 */
  transition: all 0.2s ease;
  padding: 8px; /* 내부 이미지 여백 */
}

/* 호버 효과 */
.journey-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  border-color: #ddd;
}

/* 클릭 효과 */
.journey-btn:active {
  transform: translateY(0);
  background-color: #f9f9f9;
}

/* 내부 이미지 꽉 차게 */
.journey-btn img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.money-box {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100; /* 캔버스 위에 표시 */

  display: flex;
  align-items: center;
  gap: 10px;

  background-color: rgba(255, 255, 255, 0.95); /* 살짝 투명한 흰색 */
  padding: 10px 20px 10px 12px; /* 왼쪽 패딩을 조금 줄임 (아이콘 때문) */
  border-radius: 30px; /* 둥근 캡슐 모양 */

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid #eee;

  /* 텍스트 스타일 */
  font-family: 'Arial', sans-serif; /* 혹은 게임 폰트 */
  font-weight: 800;
  color: #333;
  font-size: 1.2rem;

  /* 등장 애니메이션 */
  animation: slide-down 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* 돈 아이콘 스타일 (원형) */
.coin-icon {
  width: 32px;
  height: 32px;
  background-color: #ffc107; /* 금색/노란색 */
  color: white; /* 글자색 */
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  box-shadow: inset 0 -2px 5px rgba(0, 0, 0, 0.2); /* 입체감 */
  border: 2px solid #fff; /* 아이콘 테두리 */
}

/* 등장 애니메이션 정의 */
@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
