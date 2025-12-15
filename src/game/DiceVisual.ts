// GSAP 애니메이션 관리
import { Sprite, Container } from 'pixi.js';
import gsap from 'gsap';
import type { DiceTextureArray } from '@/types/game';

export class DiceVisual {
  // 클래스 멤버 변수 타입 정의
  private stage: Container;
  private textures: DiceTextureArray;
  private sprite: Sprite | null;
  private container: Container;

  /**
   * constructor: new DiceVisual()로 이 클래스를 처음 만들 때 실행
   * stage: 주사위를 붙일 부모 컨테이너
   * textures: 사용할 주사위 이미지들
   */
  constructor(stage: Container, textures: DiceTextureArray) {
    this.stage = stage;
    this.textures = textures;
    this.sprite = null;
    this.container = new Container(); // 주사위 전용 투명 컨테이너 (그룹) 생성

    // 화면에 주사위 넣기
    this.stage.addChild(this.container);

    this.setupSprite();
  }

  // sprite를 생성하고 초기화
  private setupSprite(): void {
    const firstTexture = this.textures[1];
    if (!firstTexture) return;

    // Sprite 생성
    this.sprite = new Sprite(firstTexture);

    // 이미지의 중심점을 가운데로 (그래야 제자리 회전)
    this.sprite.anchor.set(0.5);

    // 굴릴 때만 주사위 보여주기
    this.sprite.visible = false;

    this.sprite.scale.set(1.5);

    // 컨테이너에 sprite 넣기 (화면 > 컨테이너 > 주사위)
    this.container.addChild(this.sprite);
  }

  /**
   * 주사위 굴리는 애니메이션
   * resultNumber: 최종적으로 나오는 숫자
   * screenW, screenH: 화면의 너비와 높이
   */
  public async playRollAnimation(
    resultNumber: number,
    screenW: number,
    screenH: number,
  ): Promise<void> {
    if (!this.sprite) return;
    const sprite = this.sprite; // 로컬 변수로 잡아서 타입 안전성 확보

    // Promise 반환 (비동기를 위함)
    return new Promise((resolve) => {
      // 위치 및 상태 초기화
      sprite.visible = true;
      sprite.x = 150; // 가로 중앙에서 굴리기
      sprite.y = screenH / 2; // 세로 중앙보다 조금 위 (위에서 떨어지는 효과)
      sprite.rotation = 0; // 회전 초기화
      sprite.scale.set(0); // 주사위 튀어나오는 효과
      sprite.alpha = 1;

      // 주사위 굴리는 효과 (0.08초마다 실행)
      const tumbleInterval: ReturnType<typeof setInterval> = setInterval(() => {
        const randomFace = Math.floor(Math.random() * 6) + 1;
        // 랜덤 숫자로 주사위 이미지 변경
        const tex = this.textures[randomFace];
        if (tex) sprite.texture = tex;
      }, 80);

      // GSAP 물리 움직임 애니메이션 (timeline 쓰면 관리 용이)
      const tl = gsap.timeline({
        onComplete: () => {
          clearInterval(tumbleInterval); // 주사위 굴리는 효과 중지

          const finalTex = this.textures[resultNumber];
          if (finalTex) sprite.texture = finalTex;

          // 주사위 사라지게 만들기
          gsap.to(sprite, {
            alpha: 0,
            delay: 1,
            duration: 0.3,
            onComplete: () => {
              sprite.visible = false;
              resolve();
            },
          });
        },
      });

      // 실제 튀어나오는 움직임 정의
      tl.to(sprite, {
        y: screenH / 2 + 200, // 위에서 중앙으로 떨어트리기
        rotation: Math.PI * 4, // 2바퀴 회전
        scale: 1,
        duration: 0.8,
        ease: 'bounce.out', // 바닥에 닿을 때 튕기는 효과
      });
    });
  }

  // Cleanup
  public destroy(): void {
    this.container.destroy({ children: true });
  }
}
