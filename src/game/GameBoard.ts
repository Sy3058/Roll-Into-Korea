// PixiJS 관리
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';
import { DiceVisual } from './DiceVisual';
import type { TileGraphics, BoardRect, DiceTextureArray } from '@/types/game';

interface GameOptions {
  container: HTMLElement;
  diceTextures: DiceTextureArray;
  // 이동했는지 vue로 전달
  onTileChange?: (index: number) => void;
}

export class GameBoard {
  private app: Application;
  private boardContainer!: Container;
  private uiContainer!: Container;
  private background!: Graphics;
  private playerSprite!: Graphics;
  private tileSprites: TileGraphics[] = [];

  private diceVisual!: DiceVisual;

  // Game State
  private currentTileIndex = 0;
  private currentZoom = 0.8;

  // Constants
  private readonly TOTAL_TILES = 40;
  private readonly TILES_PER_SIDE = 9;
  private readonly UNIT_W = 2;
  private readonly UNIT_H = 3;
  private readonly BASE_UNIT_PX = 60;

  // MainGameView로 callback
  private onTileChange?: (index: number) => void;

  constructor(options: GameOptions) {
    this.onTileChange = options.onTileChange;

    // app 초기화
    this.app = new Application();

    // 비동기 초기화
    this.init(options);
  }

  private async init(options: GameOptions) {
    await this.app.init({
      resizeTo: window,
      backgroundColor: 0x101010,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });

    // div 안에 canvas 넣기
    options.container.appendChild(this.app.canvas as HTMLCanvasElement);

    // Setup Scene Layer
    this.setupScene();

    // Board 만들기 (최초 한 번)
    this.drawBoardOnce();

    this.diceVisual = new DiceVisual(this.uiContainer, options.diceTextures);

    // 게임 루프 시작
    this.app.ticker.add(this.updateCamera.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  /**
   * 화면 레이어 구성
   */
  private setupScene() {
    // Layer 1: Background
    this.background = new Graphics();
    this.background.rect(0, 0, this.app.screen.width, this.app.screen.height).fill(0x222222);
    this.app.stage.addChild(this.background);

    // Layer 2: Board
    this.boardContainer = new Container();
    this.boardContainer.rotation = -Math.PI / 4;
    this.app.stage.addChild(this.boardContainer);

    // Layer 3: UI (주사위)
    this.uiContainer = new Container();
    this.app.stage.addChild(this.uiContainer);

    // Tile 생성
    for (let i = 0; i < this.TOTAL_TILES; i++) {
      const tile = new Graphics() as TileGraphics;
      // Tile에 들어가는 text
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
      this.boardContainer.addChild(tile);
      this.tileSprites.push(tile);
    }

    // Player 생성
    this.playerSprite = new Graphics()
      .circle(0, 0, 15)
      .fill(0xff0000)
      .stroke({ width: 3, color: 0xffffff });
    this.boardContainer.addChild(this.playerSprite);
  }

  /**
   * Board 생성
   */
  private drawBoardOnce() {
    const totalUnits = this.UNIT_H * 2 + this.TILES_PER_SIDE * this.UNIT_W;
    const boardSizePx = totalUnits * this.BASE_UNIT_PX;
    const offset = -boardSizePx / 2;

    this.tileSprites.forEach((tile, index) => {
      const rect = this.getRectForIndex(index, totalUnits);
      const pxX = offset + rect.x * this.BASE_UNIT_PX;
      const pxY = offset + rect.y * this.BASE_UNIT_PX;
      const pxW = rect.w * this.BASE_UNIT_PX;
      const pxH = rect.h * this.BASE_UNIT_PX;

      tile.x = pxX;
      tile.y = pxY;
      tile.clear();

      const isCorner = index % (this.TILES_PER_SIDE + 1) === 0;
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
        tile.textNode.style.fontSize = this.BASE_UNIT_PX * 0.8;
      }
    });

    // Player 최초 위치 설정
    const startTile = this.tileSprites[0];
    const rect = this.getRectForIndex(0, totalUnits);
    if (this.playerSprite && startTile) {
      this.playerSprite.x = startTile.x + (rect.w * this.BASE_UNIT_PX) / 2;
      this.playerSprite.y = startTile.y + (rect.h * this.BASE_UNIT_PX) / 2;
    }
  }

  /**
   * 카메라 위치 이동
   */
  private updateCamera() {
    if (!this.playerSprite || !this.boardContainer) return;
    this.boardContainer.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    this.boardContainer.scale.set(this.currentZoom);
    this.boardContainer.pivot.x = this.playerSprite.x;
    this.boardContainer.pivot.y = this.playerSprite.y;
  }

  /**
   * 화면 크기 변경 감지
   */
  private onWindowResize() {
    if (this.background && this.app) {
      this.background.clear();
      this.background.rect(0, 0, this.app.screen.width, this.app.screen.height).fill(0x222222);
    }
  }

  /**
   * 카메라 줌 변경
   * @param delta
   */
  public changeZoom(delta: number) {
    this.currentZoom = Math.max(0.2, Math.min(3.0, this.currentZoom + delta));
  }

  /**
   * 주사위 애니메이션 및 플레이어 이동
   * @param result // result만큼 플레이어 이동
   */
  public async playTurn(result: number) {
    // 주사위 애니메이션
    await this.diceVisual.playRollAnimation(result, this.app.screen.width, this.app.screen.height);

    // Player 이동
    await this.movePlayer(result);
  }

  /**
   * 플레이어 이동 애니메이션
   * @param steps
   * @returns
   */
  private async movePlayer(steps: number) {
    if (!this.playerSprite) return;
    const totalUnits = this.UNIT_H * 2 + this.TILES_PER_SIDE * this.UNIT_W;

    for (let i = 0; i < steps; i++) {
      this.currentTileIndex = (this.currentTileIndex + 1) % this.TOTAL_TILES;

      // Sync with Vue
      if (this.onTileChange) this.onTileChange(this.currentTileIndex);

      const targetTile = this.tileSprites[this.currentTileIndex];
      if (!targetTile) continue;

      const rect = this.getRectForIndex(this.currentTileIndex, totalUnits);
      const centerX = targetTile.x + (rect.w * this.BASE_UNIT_PX) / 2;
      const centerY = targetTile.y + (rect.h * this.BASE_UNIT_PX) / 2;

      await gsap.to(this.playerSprite, {
        x: centerX,
        y: centerY,
        duration: 0.3,
        ease: 'power1.out',
      });
    }
  }

  /**
   * 타일 번호에 따라 x, y 좌표 계산
   * @param index
   * @param totalSize
   * @returns
   */
  private getRectForIndex(index: number, totalSize: number): BoardRect {
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

  /**
   * cleanup 함수
   */
  public destroy() {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    if (this.diceVisual) this.diceVisual.destroy();
    if (this.app) this.app.destroy(true, { children: true });
  }
}
