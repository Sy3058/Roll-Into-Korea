import {
  Application,
  Assets, // 필요하다면 유지 (다른 에셋용), 배경용으로는 사용 안 함
  Container,
  Graphics,
  Sprite,
  Text,
  TextStyle,
  Texture,
} from 'pixi.js';
import gsap from 'gsap';
import { DiceVisual } from './DiceVisual';
import { BoardCard } from './BoardCard';
import type { BoardRect, GameOptions, Particle, TileInfo } from '@/types/game';

export class GameBoard {
  private app: Application;
  private boardContainer!: Container;
  private uiContainer!: Container;
  private playerSprite!: Graphics;
  private tileSprites: BoardCard[] = [];
  private diceVisual!: DiceVisual;

  // Game State
  private currentTileIndex = 0;

  // Constants
  private readonly TOTAL_TILES = 40;
  private readonly TILES_PER_SIDE = 9;
  private readonly UNIT_W = 2;
  private readonly UNIT_H = 3;
  private readonly BASE_UNIT_PX = 60;

  // 전체 보드 크기 (계산용)
  private boardSizePx: number = 0;

  // MainGameView로 callback
  private onTileChange?: (index: number) => void;

  constructor(options: GameOptions) {
    this.onTileChange = options.onTileChange;
    this.app = new Application();
    this.init(options);
  }

  private async init(options: GameOptions) {
    await this.app.init({
      resizeTo: window,
      backgroundColor: 0xf8f4e8, // 미색 배경
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });

    options.container.appendChild(this.app.canvas as HTMLCanvasElement);

    // 배경 이미지 로드 제거 (필요한 다른 에셋만 로드)

    // Setup Scene Layer
    this.setupScene();

    // Board 만들기 (최초 한 번)
    this.drawBoardOnce();

    this.diceVisual = new DiceVisual(this.uiContainer, options.diceTextures);

    // 게임 루프 시작
    this.app.ticker.add(this.updateCamera.bind(this)); // 카메라 업데이트는 계속 필요 (창 크기 조절 대응)
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // 초기 카메라 위치 설정
    this.updateCamera();
  }

  /**
   * 화면 레이어 구성
   */
  private setupScene() {
    // Layer 1: Board Container
    this.boardContainer = new Container();

    // 보드 전체 회전 0 (화면 정방향 배치)
    this.boardContainer.rotation = Math.PI * 1;

    // 중앙 기준점 설정
    this.app.stage.addChild(this.boardContainer);

    // 1. 보드 크기 계산
    const totalUnits = this.UNIT_H * 2 + this.TILES_PER_SIDE * this.UNIT_W;
    this.boardSizePx = totalUnits * this.BASE_UNIT_PX;

    // 2. 보드 배경판 그리기 (이미지 대신 그래픽으로)
    const boardBg = new Graphics();

    // 보드 전체 영역 (흰색 배경 + 검은 테두리)
    // 원점(0,0)을 보드 중앙으로 맞추기 위해 좌표를 -half ~ +half로 설정
    const halfSize = this.boardSizePx / 2;

    boardBg.rect(-halfSize, -halfSize, this.boardSizePx, this.boardSizePx);
    boardBg.fill(0xffffff); // 보드판 기본 색상
    boardBg.stroke({ width: 4, color: 0x000000 }); // 보드 외곽선

    this.boardContainer.addChild(boardBg);

    // 3. 중앙 바닥 (Inner Zone)
    const innerSize = this.TILES_PER_SIDE * this.UNIT_W * this.BASE_UNIT_PX;
    const centerFloor = new Graphics();

    // 기존 색상 유지 (0xe6f3f5)
    centerFloor.rect(-innerSize / 2, -innerSize / 2, innerSize, innerSize);
    centerFloor.fill(0xe6f3f5);
    centerFloor.stroke({ width: 2, color: 0x000000 }); // 내부 구분선

    this.boardContainer.addChild(centerFloor);

    // 4. 중앙 로고 텍스트
    const centerText = new Text({
      text: 'MONOPOLY', // 혹은 '굴려서 한국 속으로'
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: this.boardSizePx * 0.12,
        fontWeight: 'bold',
        fill: '#000000',
        align: 'center',
        dropShadow: true,
        dropShadowColor: 'rgba(0,0,0,0.2)',
        dropShadowBlur: 4,
        dropShadowDistance: 6,
      }),
    });
    centerText.anchor.set(0.5);
    // 45도 회전 (모노폴리 스타일)
    centerText.rotation = (Math.PI * 3) / 4;
    this.boardContainer.addChild(centerText);

    // Layer 2: UI (주사위)
    this.uiContainer = new Container();
    this.app.stage.addChild(this.uiContainer);

    // Tile 생성 (기존 로직 유지 - 색상 포함)
    for (let i = 0; i < this.TOTAL_TILES; i++) {
      let type: 'basic' | 'corner' | 'chance' | 'festival' = 'basic';
      let name = i % 5 === 0 ? `Festival` : `Landmark ${i}`;
      const price = i * 100;
      const color = this.getGroupColor(i); // 기존 색상 로직 유지!

      if (i % (this.TILES_PER_SIDE + 1) === 0) {
        type = 'corner';
        name = i === 0 ? 'START' : 'CORNER';
      } else if ([4, 17, 23, 34].includes(i)) {
        type = 'chance';
      } else if ([5, 15, 25, 35].includes(i)) {
        type = 'festival';
      }

      const card = new BoardCard({
        width: 1,
        height: 1,
        index: i,
        type: type,
        name: name,
        price: type === 'basic' || type === 'festival' ? price : undefined,
        color: type === 'basic' ? color : undefined, // 색상 전달
      });

      this.boardContainer.addChild(card);
      this.tileSprites.push(card);
    }

    // Player 생성
    this.playerSprite = new Graphics()
      .circle(0, 0, 15)
      .fill(0xff0000)
      .stroke({ width: 3, color: 0xffffff });
    this.boardContainer.addChild(this.playerSprite);
  }

  /**
   * Board 생성 (타일 위치 잡기)
   */
  private drawBoardOnce() {
    // 중앙 기준이므로 offset 계산 방식 변경
    // setupScene에서 이미 (0,0)을 중심으로 사각형을 그렸으므로,
    // 타일 배치도 (0,0)을 기준으로 계산해야 함.

    // totalUnits 등 계산은 동일
    const totalUnits = this.UNIT_H * 2 + this.TILES_PER_SIDE * this.UNIT_W;
    const offset = -this.boardSizePx / 2; // 좌상단 시작점

    this.tileSprites.forEach((card, index) => {
      const rect = this.getRectForIndex(index, totalUnits);
      const slotX = offset + rect.x * this.BASE_UNIT_PX;
      const slotY = offset + rect.y * this.BASE_UNIT_PX;
      const slotW = rect.w * this.BASE_UNIT_PX;
      const slotH = rect.h * this.BASE_UNIT_PX;

      const isCorner = index % (this.TILES_PER_SIDE + 1) === 0;
      const cardW = isCorner ? slotW : this.UNIT_W * this.BASE_UNIT_PX;
      const cardH = isCorner ? slotH : this.UNIT_H * this.BASE_UNIT_PX;

      card.update({ width: cardW, height: cardH });

      card.x = slotX + slotW / 2;
      card.y = slotY + slotH / 2;

      card.pivot.set(cardW / 2, cardH / 2);

      // 타일 회전 (기존 로직 유지)
      if (!isCorner) {
        if (index > 0 && index < 10) card.rotation = Math.PI;
        else if (index > 10 && index < 20) card.rotation = -Math.PI / 2;
        else if (index > 20 && index < 30) card.rotation = 0;
        else if (index > 30 && index < 40) card.rotation = Math.PI / 2;
      } else {
        card.rotation = Math.PI; // 코너는 정방향
      }
    });

    const startTile = this.tileSprites[0];
    if (this.playerSprite && startTile) {
      this.playerSprite.x = startTile.x;
      this.playerSprite.y = startTile.y;
    }
  }

  /**
   * [핵심 변경] 카메라 위치 이동 및 자동 줌
   * 플레이어를 쫓지 않고, 화면 크기에 맞춰 보드 전체를 보여줌
   */
  private updateCamera() {
    if (!this.boardContainer || this.boardSizePx === 0) return;

    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;

    // 1. 보드 컨테이너를 화면 왼쪽에 위치
    this.boardContainer.position.set(screenWidth * 0.4, screenHeight / 2);

    // pivot은 (0,0) 그대로 유지 (보드가 이미 (0,0) 중심으로 그려졌으므로)
    this.boardContainer.pivot.set(0, 0);

    // 2. 화면에 딱 맞게 스케일 계산 (Fit)
    // 여백(Padding)을 5% 정도 줌 (0.95)
    const padding = 0.9;
    const scaleX = screenWidth / this.boardSizePx;
    const scaleY = screenHeight / this.boardSizePx;

    // 가로, 세로 중 더 작은 비율에 맞춰서 잘리지 않게 함
    const scale = Math.min(scaleX, scaleY) * padding;

    this.boardContainer.scale.set(scale);
  }

  // --- 기존 로직들 (색상, 애니메이션 등) 그대로 유지 ---

  private showMoneyEffect(amount: number = 20): Promise<void> {
    // ... (기존과 동일)
    return Promise.resolve();
  }

  private getGroupColor(index: number): number {
    if (index < 10) return 0xff0000;
    if (index < 20) return 0x00ff00;
    if (index < 30) return 0x0000ff;
    return 0xffff00;
  }

  private onWindowResize() {
    if (!this.app) return;
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    this.updateCamera(); // 리사이즈 시 카메라 다시 맞춤
  }

  public changeZoom(delta: number) {
    // 자동 Fit 모드이므로 수동 줌 기능은 비활성화하거나,
    // 필요하다면 updateCamera의 기본 scale에 곱하는 방식으로 변경 가능.
    // 여기서는 "딱 맞았으면 좋겠다"는 요청에 따라 기능 무력화 (혹은 scale 조정 로직 추가 가능)
    // this.currentZoom += delta;
  }

  public async playTurn(result: number) {
    // ... (기존과 동일)
    await this.diceVisual.playRollAnimation(result, this.app.screen.width, this.app.screen.height);
    await this.movePlayer(result);
    // ...
  }

  private async movePlayer(steps: number) {
    // ... (기존과 동일)
    if (!this.playerSprite) return;

    for (let i = 0; i < steps; i++) {
      this.currentTileIndex = (this.currentTileIndex + 1) % this.TOTAL_TILES;
      if (this.onTileChange) this.onTileChange(this.currentTileIndex);

      const targetTile = this.tileSprites[this.currentTileIndex];
      if (!targetTile) continue;

      await gsap.to(this.playerSprite, {
        x: targetTile.x,
        y: targetTile.y,
        duration: 0.3,
        ease: 'power1.out',
      });
    }
  }

  public getCurrentTileInfo(): TileInfo {
    // ... (기존과 동일)
    const index = this.currentTileIndex;
    const card = this.tileSprites[index];
    return {
      index,
      name: card?.getName(),
      type: card?.getType(),
      price: card?.getPrice(),
    };
  }

  private getRectForIndex(index: number, totalSize: number): BoardRect {
    // ... (기존과 동일)
    const cornerIdx1 = 0;
    const cornerIdx2 = this.TILES_PER_SIDE + 1;
    const cornerIdx3 = (this.TILES_PER_SIDE + 1) * 2;
    const cornerIdx4 = (this.TILES_PER_SIDE + 1) * 3;
    const limit = totalSize - this.UNIT_H;

    if (index === cornerIdx1) return { x: 0, y: 0, w: this.UNIT_H, h: this.UNIT_H };
    if (index > cornerIdx1 && index < cornerIdx2) {
      const step = index - (cornerIdx1 + 1);
      return { x: this.UNIT_H + step * this.UNIT_W, y: 0, w: this.UNIT_W, h: this.UNIT_H };
    }
    if (index === cornerIdx2) return { x: limit, y: 0, w: this.UNIT_H, h: this.UNIT_H };
    if (index > cornerIdx2 && index < cornerIdx3) {
      const step = index - (cornerIdx2 + 1);
      return { x: limit, y: this.UNIT_H + step * this.UNIT_W, w: this.UNIT_H, h: this.UNIT_W };
    }
    if (index === cornerIdx3) return { x: limit, y: limit, w: this.UNIT_H, h: this.UNIT_H };
    if (index > cornerIdx3 && index < cornerIdx4) {
      const step = index - (cornerIdx3 + 1);
      const startX = limit - this.UNIT_W - step * this.UNIT_W;
      return { x: startX, y: limit, w: this.UNIT_W, h: this.UNIT_H };
    }
    if (index === cornerIdx4) return { x: 0, y: limit, w: this.UNIT_H, h: this.UNIT_H };
    if (index > cornerIdx4) {
      const step = index - (cornerIdx4 + 1);
      const startY = limit - this.UNIT_W - step * this.UNIT_W;
      return { x: 0, y: startY, w: this.UNIT_H, h: this.UNIT_W };
    }
    return { x: 0, y: 0, w: 1, h: 1 };
  }

  public destroy() {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    if (this.diceVisual) this.diceVisual.destroy();
    if (this.app) this.app.destroy(true, { children: true });
  }
}
