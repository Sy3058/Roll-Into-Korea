import { Container, Graphics, Application, TextStyle, Text } from 'pixi.js';
import { BoardCard } from './BoardCard';
import { BOARD_CONFIG, getBoardRect, getTileInfo } from './BoardUtils';
import type { GameOptions, Particle, TileInfo } from '@/types/game';
import gsap from 'gsap';

export class GameBoard {
  // pixiJS 관련 변수
  private app: Application;
  private boardContainer = new Container();
  private playerSprite!: Graphics;
  private tileSprites: BoardCard[] = [];

  // 상태 과녈ㄴ 변수
  private currentTileIndex = 0;
  private boardSizePx = 0;
  private onTileChange?: (index: number) => void;

  constructor(options: GameOptions) {
    this.onTileChange = options.onTileChange;
    this.app = new Application();

    // 초기화
    this.init(options.container);
  }

  private async init(container: HTMLElement) {
    await this.app.init({
      resizeTo: window,
      backgroundColor: 0xf8f4e8,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });
    container.appendChild(this.app.canvas as HTMLCanvasElement);

    this.createBoardLayout(); // 보드판 생성
    this.createPlayer(); // 플레이어 생성
    this.updateCamera(); // 카메라 조정

    // 화면 크기 변경 이벤트
    window.addEventListener('resize', () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
      this.updateCamera();
    });
  }

  /**
   * 보드판과 타일 생성 및 배치
   */
  private createBoardLayout() {
    // 컨테이너 기본 설정
    this.boardContainer.rotation = Math.PI;
    this.app.stage.addChild(this.boardContainer);

    // 전체 크기 계산
    const { UNIT_H, UNIT_W, TILES_PER_SIDE, BASE_UNIT_PX, TOTAL_TILES } = BOARD_CONFIG;
    const totalUnits = UNIT_H * 2 + TILES_PER_SIDE * UNIT_W;
    this.boardSizePx = totalUnits * BASE_UNIT_PX;

    // 배경 그리기
    this.drawBackground(this.boardSizePx);

    // 타일 생성 및 배치
    const offset = -this.boardSizePx / 2; // 중앙 정렬을 위한 offset

    for (let i = 0; i < TOTAL_TILES; i++) {
      const info = getTileInfo(i);
      const rect = getBoardRect(i); // 슬롯의 위치와 크기

      // 슬롯의 물리적 좌표 및 크기
      const slotX = offset + rect.x * BASE_UNIT_PX;
      const slotY = offset + rect.y * BASE_UNIT_PX;
      const slotW = rect.w * BASE_UNIT_PX;
      const slotH = rect.h * BASE_UNIT_PX;

      // 코너가 아니면 무조건 세로형으로 크기 고정
      const isCorner = i % (TILES_PER_SIDE + 1) === 0;

      const cardW = isCorner ? slotW : UNIT_W * BASE_UNIT_PX;
      const cardH = isCorner ? slotH : UNIT_H * BASE_UNIT_PX;

      const card = new BoardCard({
        width: cardW,
        height: cardH,
        index: i,
        type: info.type,
        name: info.name,
        price: info.type === 'basic' || info.type === 'festival' ? info.price : undefined,
        color: info.color,
      });

      // 위치, 회전 축
      card.x = slotX + slotW / 2;
      card.y = slotY + slotH / 2;
      card.pivot.set(cardW / 2, cardH / 2);

      // 회전 로직 (코너는 정방향)
      if (!isCorner) {
        if (i < 10)
          card.rotation = Math.PI; // 하단: 180도
        else if (i < 20)
          card.rotation = -Math.PI / 2; // 우측: -90도 (세로 카드를 눕힘)
        else if (i < 30)
          card.rotation = 0; // 상단: 0도
        else card.rotation = Math.PI / 2; // 좌측: 90도 (세로 카드를 눕힘)
      } else {
        card.rotation = Math.PI; // 코너는 정방향
      }

      this.boardContainer.addChild(card);
      this.tileSprites.push(card);
    }
  }

  /**
   * 배경 생성
   * @param size
   */
  private drawBackground(size: number) {
    const halfSize = size / 2;

    // 외곽 프레임
    const bg = new Graphics()
      .rect(-halfSize, -halfSize, size, size)
      .fill(0xffffff)
      .stroke({ width: 4, color: 0x000000 });
    this.boardContainer.addChild(bg);

    // 중앙 로고
    const text = new Text({
      text: 'ROLL\nINTO KOREA',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: size * 0.12,
        fontWeight: 'bold',
        fill: '#000000',
        align: 'center',
      }),
    });
    text.anchor.set(0.5);
    text.rotation = (Math.PI * 3) / 4;
    this.boardContainer.addChild(text);
  }

  /**
   * 플레이어 생성
   */
  private createPlayer() {
    this.playerSprite = new Graphics()
      .circle(0, 0, 15)
      .fill(0xff0000)
      .stroke({ width: 3, color: 0xffffff });

    // 시작 위치로 이동
    const startTile = this.tileSprites[0];
    if (startTile) {
      this.playerSprite.position.set(startTile.x, startTile.y);
    }
    this.boardContainer.addChild(this.playerSprite);
  }

  /**
   * 주사위 결과에 따라 플레이어 이동
   * @param diceResult
   */
  public async playTurn(diceResult: number) {
    await this.movePlayer(diceResult);

    const currentTile = this.getCurrentTileInfo();

    if (currentTile.type === 'basic' || currentTile.type === 'festival') {
      await this.showMoneyEffect();
    }
  }

  /**
   * 플레이어 이동
   * @param steps
   */
  private async movePlayer(steps: number) {
    for (let i = 0; i < steps; i++) {
      this.currentTileIndex = (this.currentTileIndex + 1) % BOARD_CONFIG.TOTAL_TILES;
      if (this.onTileChange) this.onTileChange(this.currentTileIndex);

      const targetTile = this.tileSprites[this.currentTileIndex];

      // GSAP 비동기 이동
      await gsap.to(this.playerSprite, {
        x: targetTile?.x,
        y: targetTile?.y,
        duration: 0.2,
        ease: 'power1.out',
      });
    }
  }

  /**
   * 화면 크기에 맞춰 보드 줌/위치 자동 조정
   */
  private updateCamera() {
    const { width, height } = this.app.screen;

    // board를 화면 왼쪽에 배치
    this.boardContainer.position.set(width * 0.4, height / 2);

    if (this.boardSizePx > 0) {
      const scaleX = width / this.boardSizePx;
      const scaleY = height / this.boardSizePx;
      const scale = Math.min(scaleX, scaleY) * 0.9; // 10% 여백
      this.boardContainer.scale.set(scale);
    }
  }

  /**
   * 현재 타일 정보 반환
   * @returns index, name, type, price
   */
  public getCurrentTileInfo(): TileInfo {
    const card = this.tileSprites[this.currentTileIndex];
    return {
      index: this.currentTileIndex,
      name: card?.getName(),
      type: card?.getType(),
      price: card?.getPrice(),
    };
  }

  /**
   * 화면 하단에서 돈이 솟아오르는 효과 (UI 효과)
   */
  private showMoneyEffect(amount: number = 20): Promise<void> {
    return new Promise((resolve) => {
      const particles: Particle[] = [];

      // 화면 중앙 하단 좌표 계산
      const startX = this.app.screen.width / 2;
      const startY = this.app.screen.height; // 화면 맨 아래

      for (let i = 0; i < amount; i++) {
        const coin = new Graphics() as Particle;

        // 그래픽 그리기 (동전)
        coin.circle(0, 0, 12);
        coin.fill({ color: 0xffd700 });
        coin.stroke({ width: 2, color: 0xb8860b });

        // 시작 위치: 화면 하단 중앙
        coin.x = startX;
        coin.y = startY;

        // 코인 애니메이션
        coin.rotation = 0;
        coin.vx = (Math.random() - 0.5) * 6;
        coin.vy = -22 - Math.random() * 7;
        coin.gravity = 0.6;
        coin.rotationSpeed = 0;

        // 전체 화면에 추가
        this.app.stage.addChild(coin);
        particles.push(coin);
      }

      const animate = () => {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];

          if (!p) continue;

          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;

          // 투명도 조절 (천천히 사라짐)
          p.alpha -= 0.015;

          if (p.alpha <= 0) {
            // 부모(app.stage)에서 제거
            if (p.parent) {
              p.parent.removeChild(p);
            }
            particles.splice(i, 1);
          }
        }

        if (particles.length > 0) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * 제거
   */
  public destroy() {
    this.app.destroy(true, { children: true });
  }
}
