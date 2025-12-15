<template>
  <div class="game-wrapper">
    <div ref="pixiContainer" class="pixi-container"></div>

    <div class="ui-layer">
      <div v-if="!diceLoaded" class="loading-overlay">
        <div class="loading-text">Loading Dice...</div>
        <button @click="forceStart" class="force-btn">(Force Start)</button>
      </div>

      <div v-else class="info-panel">
        <h3>주사위 굴리기 게임</h3>
        <p>Current Tile: {{ currentTileIndex }}</p>
        <button @click="handleRollClick" :disabled="isRolling || isMoving" class="roll-btn">
          {{ isRolling ? 'Rolling...' : 'Roll Dice' }}
        </button>
        <div class="zoom-controls">
          <button @click="changeZoom(0.1)">+</button>
          <span>Zoom</span>
          <button @click="changeZoom(-0.1)">-</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Application, Graphics, Text, Container, TextStyle } from 'pixi.js';
import gsap from 'gsap';
import { useDice } from '@/composables/useDice';
import { DiceVisual } from '@/game/DiceVisual';
// [중요] 타입 파일에서 정의한 인터페이스 가져오기
import type { TileGraphics, BoardRect } from '@/types/game';

// Setup Composables
const { isRolling, isLoaded: diceLoaded, diceTextures, loadDiceAssets, generateRoll } = useDice();

// Refs (타입 명시)
const pixiContainer = ref<HTMLDivElement | null>(null);
const currentTileIndex = ref<number>(0);
const isMoving = ref<boolean>(false);

// Pixi Instances (타입 명시)
let app: Application | null = null;
let diceVisual: DiceVisual | null = null;
let boardContainer: Container | null = null;
let uiContainer: Container | null = null;
let background: Graphics | null = null;
let playerSprite: Graphics | null = null;

// [중요] TileGraphics 타입을 사용하여 textNode 접근 허용
const tileSprites: TileGraphics[] = [];

// Game Constants
const TOTAL_TILES = 40;
const TILES_PER_SIDE = 9;
const UNIT_W = 2;
const UNIT_H = 3;
const BASE_UNIT_PX = 60;

// Camera State
let currentZoom = 0.8;

// Lifecycle
onMounted(async () => {
  if (!pixiContainer.value) return;

  app = new Application();
  await app.init({
    resizeTo: window,
    backgroundColor: 0x101010,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
  });

  // canvas를 HTMLDivElement에 부착
  pixiContainer.value.appendChild(app.canvas as HTMLCanvasElement);

  // 에러가 나도 게임이 멈추지 않도록 예외 처리
  try {
    await loadDiceAssets();
  } catch (e) {
    console.error('Asset loading warning:', e);
  }

  setupScene();
  drawBoardOnce();

  if (uiContainer) {
    diceVisual = new DiceVisual(uiContainer, diceTextures.value);
  }

  app.ticker.add(updateCamera);
  window.addEventListener('resize', onWindowResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize);
  if (diceVisual) diceVisual.destroy();
  if (app) app.destroy(true, { children: true });
});

// 이미지 로딩이 실패했을 때 강제로 게임을 시작하는 함수
function forceStart() {
  diceLoaded.value = true;
}

function onWindowResize() {
  if (background && app) {
    background.clear();
    background.rect(0, 0, app.screen.width, app.screen.height).fill(0x222222);
  }
}

function setupScene() {
  if (!app) return;

  // 첫번째 레이어 (background)
  background = new Graphics();
  background.rect(0, 0, app.screen.width, app.screen.height).fill(0x222222);
  app.stage.addChild(background);

  // 두번째 레이어 (Board)
  boardContainer = new Container();
  boardContainer.rotation = -Math.PI / 4;
  app.stage.addChild(boardContainer);

  for (let i = 0; i < TOTAL_TILES; i++) {
    // [중요] Graphics를 TileGraphics로 단언(Type Assertion)
    const tile = new Graphics() as TileGraphics;

    const text = new Text({
      text: i.toString(),
      style: new TextStyle({
        fontSize: 32,
        fill: '#000000',
        fontWeight: 'bold',
        align: 'center',
      }),
    });
    text.anchor.set(0.5);
    tile.textNode = text;

    tile.addChild(text);
    boardContainer.addChild(tile);
    tileSprites.push(tile);
  }

  playerSprite = new Graphics()
    .circle(0, 0, 15)
    .fill(0xff0000)
    .stroke({ width: 3, color: 0xffffff });

  boardContainer.addChild(playerSprite);

  // 세번째 레이어 (UI)
  uiContainer = new Container();
  app.stage.addChild(uiContainer);
}

function drawBoardOnce() {
  if (!app || !boardContainer) return;

  const totalUnits = UNIT_H * 2 + TILES_PER_SIDE * UNIT_W;
  const boardSizePx = totalUnits * BASE_UNIT_PX;
  const offset = -boardSizePx / 2;

  tileSprites.forEach((tile, index) => {
    const rect = getRectForIndex(index, totalUnits);

    const pxX = offset + rect.x * BASE_UNIT_PX;
    const pxY = offset + rect.y * BASE_UNIT_PX;
    const pxW = rect.w * BASE_UNIT_PX;
    const pxH = rect.h * BASE_UNIT_PX;

    tile.x = pxX;
    tile.y = pxY;

    tile.clear();

    const isCorner = index % (TILES_PER_SIDE + 1) === 0;

    tile.rect(0, 0, pxW, pxH);
    if (isCorner) {
      tile.fill(0xffcccc);
      tile.stroke({ width: 3, color: 0xff0000 });
    } else {
      tile.fill(0xffffff);
      tile.stroke({ width: 2, color: 0x333333 });
    }

    if (tile.textNode) {
      tile.textNode.x = pxW / 2;
      tile.textNode.y = pxH / 2;
      tile.textNode.rotation = Math.PI / 4;
      tile.textNode.style.fontSize = BASE_UNIT_PX * 0.8;
    }
  });

  const startTile = tileSprites[0];
  const rect = getRectForIndex(0, totalUnits);
  if (playerSprite && startTile) {
    playerSprite.x = startTile.x + (rect.w * BASE_UNIT_PX) / 2;
    playerSprite.y = startTile.y + (rect.h * BASE_UNIT_PX) / 2;
  }
}

function updateCamera() {
  if (!playerSprite || !boardContainer || !app) return;

  boardContainer.position.set(app.screen.width / 2, app.screen.height / 2);
  boardContainer.scale.set(currentZoom);
  boardContainer.pivot.x = playerSprite.x;
  boardContainer.pivot.y = playerSprite.y;
}

// [중요] 반환 타입을 BoardRect로 명시
function getRectForIndex(index: number, totalSize: number): BoardRect {
  const cornerIdx1 = 0;
  const cornerIdx2 = TILES_PER_SIDE + 1;
  const cornerIdx3 = (TILES_PER_SIDE + 1) * 2;
  const cornerIdx4 = (TILES_PER_SIDE + 1) * 3;

  const limit = totalSize - UNIT_H;

  if (index === cornerIdx1) return { x: 0, y: 0, w: UNIT_H, h: UNIT_H };
  if (index > cornerIdx1 && index < cornerIdx2) {
    const step = index - (cornerIdx1 + 1);
    return { x: UNIT_H + step * UNIT_W, y: 0, w: UNIT_W, h: UNIT_H };
  }
  if (index === cornerIdx2) return { x: limit, y: 0, w: UNIT_H, h: UNIT_H };
  if (index > cornerIdx2 && index < cornerIdx3) {
    const step = index - (cornerIdx2 + 1);
    return { x: limit, y: UNIT_H + step * UNIT_W, w: UNIT_H, h: UNIT_W };
  }
  if (index === cornerIdx3) return { x: limit, y: limit, w: UNIT_H, h: UNIT_H };
  if (index > cornerIdx3 && index < cornerIdx4) {
    const step = index - (cornerIdx3 + 1);
    const startX = limit - UNIT_W - step * UNIT_W;
    return { x: startX, y: limit, w: UNIT_W, h: UNIT_H };
  }
  if (index === cornerIdx4) return { x: 0, y: limit, w: UNIT_H, h: UNIT_H };
  if (index > cornerIdx4) {
    const step = index - (cornerIdx4 + 1);
    const startY = limit - UNIT_W - step * UNIT_W;
    return { x: 0, y: startY, w: UNIT_H, h: UNIT_W };
  }
  return { x: 0, y: 0, w: 1, h: 1 };
}

function changeZoom(delta: number) {
  currentZoom = Math.max(0.2, Math.min(3.0, currentZoom + delta));
}

async function handleRollClick() {
  // 앱이나 비주얼이 초기화 안 됐으면 중단
  if (isRolling.value || !app || !diceVisual) return;

  isRolling.value = true;
  const result = generateRoll();

  // TypeScript에서 app.screen 사용 보장
  await diceVisual.playRollAnimation(result, app.screen.width, app.screen.height);

  await movePlayer(result);

  isRolling.value = false;
}

async function movePlayer(steps: number) {
  if (!playerSprite) return;
  const totalUnits = UNIT_H * 2 + TILES_PER_SIDE * UNIT_W;

  for (let i = 0; i < steps; i++) {
    currentTileIndex.value = (currentTileIndex.value + 1) % TOTAL_TILES;
    const targetTile = tileSprites[currentTileIndex.value];

    if (!targetTile) continue;

    const rect = getRectForIndex(currentTileIndex.value, totalUnits);
    const centerX = targetTile.x + (rect.w * BASE_UNIT_PX) / 2;
    const centerY = targetTile.y + (rect.h * BASE_UNIT_PX) / 2;

    await gsap.to(playerSprite, {
      x: centerX,
      y: centerY,
      duration: 0.3,
      ease: 'power1.out',
    });
  }
}
</script>

<style scoped>
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
