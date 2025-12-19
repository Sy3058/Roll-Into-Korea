<template>
  <div class="main-layout">
    <div ref="pixiContainer" class="board-section"></div>

    <aside class="sidebar-section">
      <div class="status-panel">
        <div class="profile-placeholder">
          <img :src="profileImg" alt="Profile" class="profile-img" />
        </div>
        <div class="money-info">
          <div class="coin-icon">₩</div>
          <span class="amount">{{ formattedMoney }}</span>
        </div>
      </div>

      <JourneyPanel />

      <div class="dice-control-area">
        <button class="btn-3d black" @click="handleRoll" :disabled="isRolling">
          <div class="btn-content">
            <img :src="diceIcon" alt="Dice" class="dice-icon-small" />
            <span class="btn-text">{{ isRolling ? '...' : 'ROLL' }}</span>
          </div>
        </button>
      </div>
    </aside>

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
import JourneyPanel from '@/components/journey/JourneyPanel.vue';
import StreetViewModal from '@/components/ui/StreetViewModal.vue';
import diceIcon from '@/assets/ui/dice_3D_detailed.png';
import profileImg from '@/assets/images/profile.png';

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
    onTileChange: (index) => {
      currentTileIndex.value = index;
    },
  });

  // [중요] 레이아웃 변경으로 인해 리사이즈 이벤트를 수동으로 한번 호출하여 보드 위치를 잡음
  window.dispatchEvent(new Event('resize'));
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

  await game.playTurn(result);

  const tileInfo = game.getCurrentTileInfo();

  if (tileInfo.price) {
    playerMoney.value += tileInfo.price;
  }
  currentLocName.value = tileInfo.name;

  if (tileInfo.type !== 'corner' && tileInfo.type !== 'chance') {
    showModal.value = true;
  }

  isRolling.value = false;
}

const handleEnterStreetView = () => {
  console.log('스트리트뷰 페이지로 이동!');
  showModal.value = false;
};

// journey-btn 핸들러는 이제 UI 패널 내부 요소로 대체되거나 추가 구현 가능
</script>

<style scoped>
/* 전체 레이아웃: 좌우 분할 */
.main-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #f8f4e8; /* 전체 배경 */
}

/* 왼쪽: 게임 보드 */
.board-section {
  flex: 1; /* 남은 공간 모두 차지 */
  position: relative;
  background-color: #f8f4e8;
  overflow: hidden;
}

/* 오른쪽: 사이드바 */
.sidebar-section {
  width: 380px; /* 고정 너비 (필요시 %로 변경 가능) */
  background-color: #c5d89d; /* 이미지의 배경색 느낌 */
  display: flex;
  flex-direction: column;
  border-left: 1px solid #ccc;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

/* 1. 상단 패널 (돈, 프로필) */
.status-panel {
  height: 250px; /* 이미지의 상단 회색 박스 높이 */
  background-color: #c5d89d; /* 약간 더 짙은 회색 or 이미지 그대로라면 비워둠 */
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* 아래쪽에 돈 표시 */
  border-bottom: 2px solid #fff; /* 구분선 */
}

/* 프로필 들어갈 자리 */
.profile-placeholder {
  flex: 1;
  display: flex; /* Center the image */
  align-items: center;
  justify-content: center;
  margin-bottom: 10px; /* Add some space between profile and money */
}

.profile-img {
  width: 7vw; /* Adjust size as needed */
  height: 7vw; /* Adjust size as needed */
  border-radius: 50%; /* Make it circular */
  object-fit: cover; /* Ensure image covers the area without distortion */
  border: 3px solid #fff; /* Optional: white border */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Optional: shadow */
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

/* 2. 중단 패널 (저니 노트 리스트) */
.journey-panel {
  flex: 1; /* 남은 세로 공간 차지 */
  background-color: #c5d89d; /* 이미지 배경색 */
  padding: 24px;
  overflow-y: auto; /* 내용 많으면 스크롤 */
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.journey-header h3 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 700;
  color: #333;
}

.journey-header p {
  margin: 0;
  font-size: 0.8rem;
  color: #666;
}

.journey-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #444;
  font-weight: 600;
}

.more-btn {
  background: none;
  border: none;
  font-size: 0.8rem;
  color: #888;
  cursor: pointer;
}

.badge-row {
  display: flex;
  gap: 12px;
}

.badge-circle {
  width: 48px;
  height: 48px;
  background-color: #6b7280; /* 이미지의 짙은 회색/남색 */
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 300;
  cursor: pointer;
  transition: transform 0.2s;
}

.badge-circle:hover {
  transform: scale(1.05);
  background-color: #555;
}

/* 사이드바 하단 영역 정렬을 위한 컨테이너 */
.dice-control-area {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 6vh; /* 바닥에서 조금 띄움 */
  margin-top: auto; /* 사이드바 맨 아래로 밀어내기 */
}

/* --- 3D Button Core Styles (제공해주신 CSS 기반 수정) --- */
.btn-3d {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  /* 정사각형 모양 만들기 */
  width: 12vw;
  min-width: 90px;
  height: 90px;
  padding: 0; /* 패딩 제거하고 width/height로 조절 */

  font-size: 16px;
  font-weight: bold;
  color: white;
  border-radius: 12px; /* 둥근 모서리 */
  text-align: center;
  transition: top 0.01s linear;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
  cursor: pointer;
  border: none;
  outline: none;
}

/* 눌렸을 때 효과 */
.btn-3d:active {
  top: 9px; /* 버튼 높이만큼 내려감 */
  box-shadow:
    0 0 0 1px #000 inset,
    0 0 0 2px rgba(255, 255, 255, 0.15) inset,
    0 0 0 1px rgba(0, 0, 0, 0.4);
}

/* --- Black Color Variant (이전 버튼 색상 #333 적용) --- */
.btn-3d.black {
  background-color: #333333;
  box-shadow:
    0 0 0 1px #000 inset,
    /* 안쪽 테두리 */ 0 0 0 2px rgba(255, 255, 255, 0.15) inset,
    /* 상단 하이라이트 */ 0 9px 0 0 #1a1a1a,
    /* 3D 깊이감 (어두운 회색) */ 0 9px 0 1px rgba(0, 0, 0, 0.4),
    /* 그림자 테두리 */ 0 9px 8px 1px rgba(0, 0, 0, 0.5); /* 바닥 그림자 */
}

.btn-3d.black:hover {
  background-color: #444444; /* 호버 시 약간 밝게 */
}

/* 비활성화 상태 (굴리는 중) */
.btn-3d:disabled {
  background-color: #555;
  top: 9px; /* 눌린 상태로 고정 */
  box-shadow:
    0 0 0 1px #000 inset,
    0 0 0 2px rgba(255, 255, 255, 0.1) inset,
    0 0 0 1px rgba(0, 0, 0, 0.4);
  cursor: not-allowed;
  opacity: 0.8;
}

/* 내부 콘텐츠 스타일 */
.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-top: -6px; /* 3D 높이 고려하여 시각적 중앙 정렬 */
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

/* 반응형 처리: 화면이 너무 좁아지면 레이아웃 조정 */
@media (max-width: 1024px) {
  .sidebar-section {
    width: 300px;
  }
}
</style>
