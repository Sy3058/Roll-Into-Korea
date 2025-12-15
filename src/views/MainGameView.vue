<template>
  <div class="game-wrapper">
    <div ref="pixiContainer" class="pixi-container"></div>

    <div class="ui-layer">
      <div class="info-panel">
        <h3>Camera Follow Board</h3>
        <p>Current Tile: {{ currentTileIndex }}</p>
        <button @click="rollDice" :disabled="isMoving" class="roll-btn">
          {{ isMoving ? 'Moving...' : 'Roll Dice' }}
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

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Application, Graphics, Text, Container, TextStyle } from 'pixi.js'
import gsap from 'gsap'

const pixiContainer = ref(null) // Pixi의 canvas를 div에 할당
const currentTileIndex = ref(0)
const isMoving = ref(false)

// Pixi instances (초당 60번씩 렌더링 되므로 ref로 업데이트 하면 안 됨!)
let app = null
let boardContainer = null
let background = null
let playerSprite = null
const tileSprites = []

// Game Constants
const TOTAL_TILES = 40 // 총 타일의 개수
const TILES_PER_SIDE = 9
// 타일의 비율
const UNIT_W = 2
const UNIT_H = 3
const BASE_UNIT_PX = 60 // 타일 크기

// Camera State
let currentZoom = 0.8

// Lifecycle (초기화)
onMounted(async () => {
  if (!pixiContainer.value) return

  // Pixi Application 생성
  app = new Application()
  await app.init({
    resizeTo: window,
    backgroundColor: 0x101010,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
  })

  // DOM에 canvas 부착
  pixiContainer.value.appendChild(app.canvas)

  // 씬 구성
  setupScene()
  drawBoardOnce()

  // 게임 루프 (매 프레임마다 updateCamera 실행)
  app.ticker.add(updateCamera)

  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  if (app) app.destroy(true, { children: true })
})

function onWindowResize() {
  // Just update background size, no need to recalc board positions
  if (background && app) {
    background.clear()
    background.rect(0, 0, app.screen.width, app.screen.height).fill(0x222222)
  }
}

// Setup Scene
function setupScene() {
  // Stage -> BoardContainer -> Tiles로 구성됨
  // Static인 부분
  background = new Graphics()
  // (시작 x 좌표, y 좌표, 너비, 높이)
  background.rect(0, 0, app.screen.width, app.screen.height).fill(0x222222)
  app.stage.addChild(background)

  // Board Container
  boardContainer = new Container()
  // 다이아몬드 형태로 보여주기 위해 회전
  boardContainer.rotation = -Math.PI / 4
  app.stage.addChild(boardContainer)

  // Create Tiles
  for (let i = 0; i < TOTAL_TILES; i++) {
    const tile = new Graphics()

    const text = new Text({
      text: i.toString(),
      style: new TextStyle({
        fontSize: 32,
        fill: '#000000',
        fontWeight: 'bold',
        align: 'center',
      }),
    })
    text.anchor.set(0.5)
    tile.textNode = text

    // text를 tile의 자식으로 할당
    tile.addChild(text)
    // tile을 board의 자식으로 할당 (한번에 돌리기 위함)
    boardContainer.addChild(tile)
    tileSprites.push(tile)
  }

  // Create Player
  playerSprite = new Graphics()
    .circle(0, 0, 15) // 사용자 크기
    .fill(0xff0000)
    .stroke({ width: 3, color: 0xffffff })

  // Player가 가장 위에 오도록 마지막에 작성
  boardContainer.addChild(playerSprite)
}

// Draw Board (최초 1회 실행)
function drawBoardOnce() {
  if (!app || !boardContainer) return

  // 전체 크기 계산
  const totalUnits = UNIT_H * 2 + TILES_PER_SIDE * UNIT_W
  const boardSizePx = totalUnits * BASE_UNIT_PX

  // 회전을 위해 board의 정중앙이 (0, 0)에 오도록 계산
  const offset = -boardSizePx / 2

  // Position Tiles
  tileSprites.forEach((tile, index) => {
    // 논리적 위치
    const rect = getRectForIndex(index, totalUnits)

    // 실제 크기를 위한 계산
    const pxX = offset + rect.x * BASE_UNIT_PX
    const pxY = offset + rect.y * BASE_UNIT_PX
    const pxW = rect.w * BASE_UNIT_PX
    const pxH = rect.h * BASE_UNIT_PX

    // 위치 설정
    tile.x = pxX
    tile.y = pxY

    // tile 초기화
    tile.clear()

    // Check Corner
    const isCorner = index % (TILES_PER_SIDE + 1) === 0

    // Draw rect (경로 생성)
    tile.rect(0, 0, pxW, pxH)
    // 코너만 색상 변경
    if (isCorner) {
      tile.fill(0xffcccc) // Light Red
      tile.stroke({ width: 3, color: 0xff0000 })
    } else {
      tile.fill(0xffffff)
      tile.stroke({ width: 2, color: 0x333333 })
    }

    // Center & Rotate Text
    if (tile.textNode) {
      tile.textNode.x = pxW / 2
      tile.textNode.y = pxH / 2
      tile.textNode.rotation = Math.PI / 4 // 똑바로 보이려면 타일과 반대로 45도 회전해야함
      // 타일 크기에 맞춰 글자 크기 조정
      tile.textNode.style.fontSize = BASE_UNIT_PX * 0.8
    }
  })

  // 0번째에서 시작
  const startTile = tileSprites[0]
  const rect = getRectForIndex(0, totalUnits)
  playerSprite.x = startTile.x + (rect.w * BASE_UNIT_PX) / 2
  playerSprite.y = startTile.y + (rect.h * BASE_UNIT_PX) / 2
}

// CAMERA LOGIC (프레임마다 실행)
function updateCamera() {
  if (!playerSprite || !boardContainer) return

  // 화면 중앙으로 컨테이너 이동
  boardContainer.position.set(app.screen.width / 2, app.screen.height / 2)

  // 줌 적용
  boardContainer.scale.set(currentZoom)

  // Player로 피벗 설정하고 거기로 카메라 이동
  boardContainer.pivot.x = playerSprite.x
  boardContainer.pivot.y = playerSprite.y
}

// 좌표 계산
function getRectForIndex(index, totalSize) {
  const cornerIdx1 = 0
  const cornerIdx2 = TILES_PER_SIDE + 1
  const cornerIdx3 = (TILES_PER_SIDE + 1) * 2
  const cornerIdx4 = (TILES_PER_SIDE + 1) * 3

  const limit = totalSize - UNIT_H

  if (index === cornerIdx1) return { x: 0, y: 0, w: UNIT_H, h: UNIT_H }
  if (index > cornerIdx1 && index < cornerIdx2) {
    const step = index - (cornerIdx1 + 1)
    return { x: UNIT_H + step * UNIT_W, y: 0, w: UNIT_W, h: UNIT_H }
  }
  if (index === cornerIdx2) return { x: limit, y: 0, w: UNIT_H, h: UNIT_H }
  if (index > cornerIdx2 && index < cornerIdx3) {
    const step = index - (cornerIdx2 + 1)
    return { x: limit, y: UNIT_H + step * UNIT_W, w: UNIT_H, h: UNIT_W }
  }
  if (index === cornerIdx3) return { x: limit, y: limit, w: UNIT_H, h: UNIT_H }
  if (index > cornerIdx3 && index < cornerIdx4) {
    const step = index - (cornerIdx3 + 1)
    const startX = limit - UNIT_W - step * UNIT_W
    return { x: startX, y: limit, w: UNIT_W, h: UNIT_H }
  }
  if (index === cornerIdx4) return { x: 0, y: limit, w: UNIT_H, h: UNIT_H }
  if (index > cornerIdx4) {
    const step = index - (cornerIdx4 + 1)
    const startY = limit - UNIT_W - step * UNIT_W
    return { x: 0, y: startY, w: UNIT_H, h: UNIT_W }
  }
  return { x: 0, y: 0, w: 1, h: 1 }
}

// Game play
function changeZoom(delta) {
  currentZoom = Math.max(0.2, Math.min(3.0, currentZoom + delta))
}

// 주사위 굴리기
async function rollDice() {
  if (isMoving.value) return
  isMoving.value = true

  const steps = Math.floor(Math.random() * 6) + 1
  await movePlayer(steps)
  isMoving.value = false
}

// 사용자 이동 로직
async function movePlayer(steps) {
  const totalUnits = UNIT_H * 2 + TILES_PER_SIDE * UNIT_W

  for (let i = 0; i < steps; i++) {
    currentTileIndex.value = (currentTileIndex.value + 1) % TOTAL_TILES
    const targetTile = tileSprites[currentTileIndex.value]

    // 타일의 중앙으로 이동
    const rect = getRectForIndex(currentTileIndex.value, totalUnits)
    const centerX = targetTile.x + (rect.w * BASE_UNIT_PX) / 2
    const centerY = targetTile.y + (rect.h * BASE_UNIT_PX) / 2

    // 사용자 이동
    await gsap.to(playerSprite, {
      x: centerX,
      y: centerY,
      duration: 0.3,
      ease: 'power1.out',
    })
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
  pointer-events: none; /* Let clicks pass through to canvas if needed */
}
.info-panel {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  font-family: sans-serif;
  pointer-events: auto; /* Re-enable clicks for buttons */
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
