<template>
  <div class="game-wrapper">
    <div ref="pixiContainer" class="pixi-container"></div>

    <div class="ui-layer">
      <div v-if="!diceLoaded" class="loading-overlay">
        <div class="loading-text">Loading Dice...</div>
      </div>

      <div v-else class="info-panel">
        <h3>주사위 굴리기 게임</h3>
        <p>Current Tile: {{ currentTileIndex }}</p>

        <button @click="handleRollClick" :disabled="isRolling" class="roll-btn">
          {{ isRolling ? 'Rolling...' : 'Roll Dice' }}
        </button>

        <div class="zoom-controls">
          <button @click="handleZoom(0.1)">+</button>
          <span>Zoom</span>
          <button @click="handleZoom(-0.1)">-</button>
        </div>
      </div>
    </div>

    <StreetViewModal
      :is-open="showModal"
      :location-name="currentLocName"
      @close="showModal = false"
      @enter-streetview="handleEnterStreetView"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useDice } from '@/composables/useDice';
import { GameBoard } from '@/game/GameBoard';
import StreetViewModal from '@/components/ui/StreetViewModal.vue';

// 모달 상태 관리
const showModal = ref(false);
const currentLocName = ref('');

// Composable States
const { isRolling, isLoaded: diceLoaded, diceTextures, loadDiceAssets, generateRoll } = useDice();

// Refs
const pixiContainer = ref<HTMLDivElement | null>(null);
const currentTileIndex = ref<number>(0);

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
async function handleRollClick() {
  if (isRolling.value || !game) return;

  isRolling.value = true;
  const result = generateRoll();

  // Game Engine에 있는 playTurn 로직 부르기
  await game.playTurn(result);

  // 이동이 끝난 후 도착한 타일 정보 확인
  const tileInfo = game.getCurrentTileInfo();
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
</script>

<style scoped>
/* Styles remain exactly the same */
.game-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}
.pixi-container {
  width: 100%;
  height: 100%;
}
.ui-layer {
  position: absolute;
  top: 20px;
  left: 20px;
  pointer-events: none;
}
.loading-overlay {
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 12px;
  color: white;
  pointer-events: auto;
  text-align: center;
}
.loading-text {
  margin-bottom: 10px;
  font-weight: bold;
}
.force-btn {
  font-size: 0.8rem;
  padding: 4px 8px;
  background: #555;
  color: #ccc;
  border: 1px solid #777;
  cursor: pointer;
}
.info-panel {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  font-family: sans-serif;
  pointer-events: auto;
}
.roll-btn {
  background: #333;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
  width: 100%;
  margin-bottom: 10px;
}
.roll-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.zoom-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.zoom-controls button {
  width: 30px;
  height: 30px;
  cursor: pointer;
}
</style>
