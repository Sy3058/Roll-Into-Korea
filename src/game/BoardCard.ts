import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { BoardCardOptions, CardType } from '@/types/game';

const STYLE = {
  BORDER_COLOR: 0x1a1a1a,
  BORDER_WIDTH: 3,
};

//TODO: (5, 15, 25, 35)에는 축제 카드 배치, 코너에 뭐 넣을지 결정
export class BoardCard extends Container {
  private options: BoardCardOptions;
  private background: Graphics;
  private contentContainer: Container;

  constructor(options: BoardCardOptions) {
    super();
    this.options = options;

    // Layer 1: 배경
    this.background = new Graphics();
    this.addChild(this.background);

    // Layer 2: 내부 content
    this.contentContainer = new Container();
    this.addChild(this.contentContainer);

    this.draw();
  }

  // resizing되거나 줌 할 때 호출
  public update(newOptions: Partial<BoardCardOptions>) {
    this.options = { ...this.options, ...newOptions };
    this.draw();
  }

  // CardType에 따라 다른 것 그리기
  private draw() {
    this.background.clear();
    this.contentContainer.removeChildren();

    switch (this.options.type) {
      case 'corner':
        this.drawCorner();
        break;
      case 'chance':
        this.drawChance();
        break;
      case 'festival':
        this.drawFestival();
        break;
      default:
        this.drawBasic();
        break;
    }
  }

  // Basic (색상, 관광지 이름, 가격 필요)
  private drawBasic() {
    const { width, height, color, name, reward } = this.options;
    const headerHeight = height * 0.25; // 상단 25%를 색상으로 지정

    // 하얀 배경
    this.background
      .rect(0, 0, width, height)
      .fill(0xffffff)
      .stroke({ width: STYLE.BORDER_WIDTH, color: STYLE.BORDER_COLOR });

    // 상단의 도시 색상
    if (color) {
      this.background
        .rect(0, 0, width, headerHeight)
        .fill(color)
        .stroke({ width: STYLE.BORDER_WIDTH, color: STYLE.BORDER_COLOR });
    }

    // 관광지 이름
    if (name) {
      let displayName = name; // 5글자 초과하면 줄바꿈 + ... 처리
      if (name.length > 5) {
        displayName = name.slice(0, 5) + '\n...';
      }
      const nameText = new Text({
        text: displayName,
        style: new TextStyle({
          fontSize: width * 0.18,
          fontWeight: 'bold',
          fill: '#000000',
          align: 'center',
          wordWrap: false,
          wordWrapWidth: width * 0.9,
        }),
      });
      nameText.anchor.set(0.5);
      nameText.x = width / 2;
      // 정중앙에 위치
      nameText.y = headerHeight + (height - headerHeight) / 2 - height * 0.05;
      this.contentContainer.addChild(nameText);
    }

    // 여행지 도착시 받게되는 용돈
    if (reward !== undefined) {
      const rewardText = new Text({
        text: `₩${reward}`,
        style: new TextStyle({ fontSize: width * 0.14, fill: '#555555' }),
      });
      rewardText.anchor.set(0.5, 1);
      rewardText.x = width / 2;
      rewardText.y = height - height * 0.05;
      this.contentContainer.addChild(rewardText);
    }
  }

  // 축제 카드 (5, 15, 25, 35)
  private drawFestival() {
    const { width, height, name } = this.options;

    // 연노랑 배경
    this.background
      .rect(0, 0, width, height)
      .fill(0xffffcc)
      .stroke({ width: STYLE.BORDER_WIDTH, color: STYLE.BORDER_COLOR });

    // 축제 이름
    if (name) {
      let displayName = name; // 5글자 초과하면 줄바꿈 + ... 처리
      if (name.length > 5) {
        displayName = name.slice(0, 5) + '\n...';
      }
      const nameText = new Text({
        text: displayName,
        style: new TextStyle({
          fontSize: width * 0.18,
          fontWeight: 'bold',
          fill: '#000000',
          align: 'center',
          wordWrap: true,
          wordWrapWidth: width * 0.9,
        }),
      });
      nameText.anchor.set(0.5);
      nameText.x = width / 2;
      // 정중앙에 위치
      nameText.y = height / 2;
      this.contentContainer.addChild(nameText);
    }
  }

  // Corner 카드
  private drawCorner() {
    const { width, height, name, color } = this.options;

    this.background
      .rect(0, 0, width, height)
      .fill(color || 0xffe4e1)
      .stroke({ width: STYLE.BORDER_WIDTH, color: STYLE.BORDER_COLOR });

    const text = new Text({
      text: name || 'START',
      style: new TextStyle({
        fontSize: width * 0.18,
        fontWeight: '900',
        fill: '#333333',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: width,
      }),
    });

    text.anchor.set(0.5);
    text.x = width / 2;
    text.y = height / 2;

    if (name === 'START') {
      text.rotation = -Math.PI / 4; // 우측 하단 (시작)
    } else if (name === '휴식') {
      text.rotation = Math.PI / 4; // 좌측 하단
    } else if (name === '기차여행') {
      text.rotation = (Math.PI * 3) / 4; // 좌측 상단
    } else if (name === '버스여행') {
      text.rotation = (-Math.PI * 3) / 4; // 우측 상단
    }

    this.contentContainer.addChild(text);
  }

  // Chance 카드
  private drawChance() {
    const { width, height } = this.options;

    // 하늘색으로 배경 설정
    this.background
      .rect(0, 0, width, height)
      .fill(0xe0ffff)
      .stroke({ width: STYLE.BORDER_WIDTH, color: STYLE.BORDER_COLOR });

    // "?" 마크 (Icon으로 대체할수도?)
    const qMark = new Text({
      text: '?',
      style: new TextStyle({
        fontSize: width * 0.6,
        fontWeight: 'bold',
        fill: '#008080',
        fontFamily: 'Courier New',
      }),
    });
    qMark.anchor.set(0.5);
    qMark.x = width / 2;
    qMark.y = height * 0.45;
    this.contentContainer.addChild(qMark);

    // Label
    const label = new Text({
      text: 'CHANCE',
      style: new TextStyle({ fontSize: width * 0.15, fontWeight: 'bold', fill: '#008080' }),
    });
    label.anchor.set(0.5);
    label.x = width / 2;
    label.y = height * 0.85;
    this.contentContainer.addChild(label);
  }

  /**
   * 외부에서 이름을 조회할 수 있는 Getter
   */
  public getName(): string {
    return this.options.name || '';
  }

  /**
   * 외부에서 타입을 조회할 수 있는 Getter
   */
  public getType(): CardType {
    return this.options.type || 'basic';
  }

  /**
   * 외부에서 가격을 조회할 수 있는 Getter
   */
  public getReward(): number {
    return this.options.reward || 0;
  }
}
