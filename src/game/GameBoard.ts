// PixiJS 관리
import {
  Application,
  Assets,
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
import type { BoardRect, GameOptions, TileInfo } from '@/types/game';

export class GameBoard {
  private app: Application;
  private boardContainer!: Container;
  private uiContainer!: Container;
  private background!: Sprite;
  private playerSprite!: Graphics;
  private tileSprites: BoardCard[] = [];

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

    try {
      await Assets.load('/assets/background.png');
    } catch (e) {
      console.error('배경 이미지 로드 실패:', e);
    }

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
    // Layer 1: Board
    this.boardContainer = new Container();
    this.boardContainer.rotation = (-3 * Math.PI) / 4;
    this.app.stage.addChild(this.boardContainer);

    // Board 안에 배경 추가
    const bgTexture = Texture.from('/assets/background.png');
    // 배경을 Sprite로 생성
    this.background = new Sprite(bgTexture);

    // 중심점 설정
    this.background.anchor.set(0.5);

    // 배경을 board 안에 배치
    this.boardContainer.addChild(this.background);
    this.background.rotation = -this.boardContainer.rotation; // 상쇄 회전 필수!!

    // 배경 크기 설정 (보드 크기보다 크게)
    const totalUnits = this.UNIT_H * 2 + this.TILES_PER_SIDE * this.UNIT_W;
    const boardSizePx = totalUnits * this.BASE_UNIT_PX;

    // 이미지 크기 보드 크기 2배로 키우기
    const scale = (boardSizePx * 4.0) / this.background.texture.width;
    this.background.scale.set(scale);

    // 배경 위치를 보드 중앙에 맞춤
    this.background.x = 0;
    this.background.y = 0;

    // 게임판 안쪽 채우기
    const innerSize = this.TILES_PER_SIDE * this.UNIT_W * this.BASE_UNIT_PX;

    const centerFloor = new Graphics();

    centerFloor.rect(-innerSize / 2, -innerSize / 2, innerSize, innerSize).fill(0xe6f3f5);
    this.boardContainer.addChild(centerFloor);

    // 중앙에 로고 넣기
    // TODO: 로고 이미지로 만들어서 넣기
    const centerText = new Text({
      text: '굴려서 \n한국 속으로', // 원하는 텍스트
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: boardSizePx * 0.12, // 보드 크기에 비례해서 폰트 크기 설정
        fontWeight: 'bold',
        fill: '#000000', // 글자색
        align: 'center',
        dropShadow: true,
        dropShadowColor: 'gray',
        dropShadowBlur: 4,
        dropShadowDistance: 6,
      }),
    });
    centerText.anchor.set(0.5);
    centerText.x = 0;
    centerText.y = 0;

    centerText.rotation = -this.boardContainer.rotation;
    this.boardContainer.addChild(centerText);

    // Layer 2: UI (주사위)
    this.uiContainer = new Container();
    this.app.stage.addChild(this.uiContainer);

    // Tile 생성
    for (let i = 0; i < this.TOTAL_TILES; i++) {
      // 카드 타입 및 데이터 결정
      let type: 'basic' | 'corner' | 'chance' | 'festival' = 'basic';
      // TODO: api 연결 필요
      let name = i % 5 === 0 ? `Festival` : `Landmark ${i}`;
      const price = i * 100;
      const color = this.getGroupColor(i);

      // Corner (0, 10, 20, 30)
      if (i % (this.TILES_PER_SIDE + 1) === 0) {
        type = 'corner';
        // TODO: corner에 뭐 넣을지 고민..
        name = i === 0 ? 'START' : 'CORNER';
      }
      // Chance (4, 17, 23, 34)
      else if (i === 4 || i === 17 || i === 23 || i === 34) {
        type = 'chance';
      }
      // Festival (5, 15, 25, 35)
      else if (i === 5 || i === 15 || i === 25 || i === 35) {
        type = 'festival';
      }

      // BoardCard 생성
      const card = new BoardCard({
        width: 1, // 임의 값 (밑에 drawBoardOnce에서 바뀜)
        height: 1,
        index: i,
        type: type,
        // 타입에 따라 선택적으로 전달
        name: type === 'basic' || type === 'corner' || type === 'festival' ? name : undefined,
        price: type === 'basic' || type === 'festival' ? price : undefined,
        color: type === 'basic' ? color : undefined,
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
   * Board 생성
   */
  private drawBoardOnce() {
    const totalUnits = this.UNIT_H * 2 + this.TILES_PER_SIDE * this.UNIT_W;
    const boardSizePx = totalUnits * this.BASE_UNIT_PX;
    const offset = -boardSizePx / 2;

    this.tileSprites.forEach((card, index) => {
      // 카드가 놓일 위치와 크기 계산
      const rect = this.getRectForIndex(index, totalUnits);
      const slotX = offset + rect.x * this.BASE_UNIT_PX;
      const slotY = offset + rect.y * this.BASE_UNIT_PX;
      const slotW = rect.w * this.BASE_UNIT_PX;
      const slotH = rect.h * this.BASE_UNIT_PX;

      // 실제 카드의 크기 결정 (코너면 1x1 아니면 2x3)
      const isCorner = index % (this.TILES_PER_SIDE + 1) === 0;
      const cardW = isCorner ? slotW : this.UNIT_W * this.BASE_UNIT_PX;
      const cardH = isCorner ? slotH : this.UNIT_H * this.BASE_UNIT_PX;

      card.update({ width: cardW, height: cardH });

      // 위치 설정 (슬롯의 정중앙에 배치)
      card.x = slotX + slotW / 2;
      card.y = slotY + slotH / 2;

      // 회전축을 카드의 정중앙으로 설정
      card.pivot.set(cardW / 2, cardH / 2);

      // 카드가 중앙을 바라보게 회전
      if (!isCorner) {
        if (index > 0 && index < 10) {
          card.rotation = Math.PI;
        } else if (index > 10 && index < 20) {
          card.rotation = -Math.PI / 2;
        } else if (index > 20 && index < 30) {
          card.rotation = 0;
        } else if (index > 30 && index < 40) {
          card.rotation = Math.PI / 2;
        }
      } else {
        card.rotation = Math.PI / 2;
      }
    });

    // Player 최초 위치 설정
    const startTile = this.tileSprites[0];
    if (this.playerSprite && startTile) {
      this.playerSprite.x = startTile.x;
      this.playerSprite.y = startTile.y;
    }
  }

  /**
   * 카메라 위치 이동
   */
  private updateCamera() {
    if (!this.playerSprite || !this.boardContainer) return;
    this.boardContainer.position.set(this.app.screen.width / 2, this.app.screen.height * 0.65);
    this.boardContainer.scale.set(this.currentZoom);
    this.boardContainer.pivot.x = this.playerSprite.x;
    this.boardContainer.pivot.y = this.playerSprite.y;
  }

  /**
   * 색상 지정
   */
  // TODO: 도시별 색상 지정해서 할당 필요 (백엔드에서 처리하고 색상만 주는 게 나을 듯?)
  private getGroupColor(index: number): number {
    if (index < 10) return 0xff0000;
    if (index < 20) return 0x00ff00;
    if (index < 30) return 0x0000ff;
    return 0xffff00;
  }

  /**
   * 화면 크기 변경 감지
   */
  private onWindowResize() {
    if (!this.app || !this.background) return;

    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    this.updateCamera();
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

    for (let i = 0; i < steps; i++) {
      this.currentTileIndex = (this.currentTileIndex + 1) % this.TOTAL_TILES;
      if (this.onTileChange) this.onTileChange(this.currentTileIndex);

      const targetTile = this.tileSprites[this.currentTileIndex];
      if (!targetTile) continue;

      await gsap.to(this.playerSprite, {
        x: targetTile.x, // 타일의 x 좌표 (이미 중심점)
        y: targetTile.y, // 타일의 y 좌표 (이미 중심점)
        duration: 0.3,
        ease: 'power1.out',
      });
    }
  }

  public getCurrentTileInfo(): TileInfo {
    const index = this.currentTileIndex;
    const card = this.tileSprites[index];

    return {
      index,
      name: card?.getName(),
      type: card?.getType(),
    };
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
