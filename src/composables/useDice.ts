import { ref } from 'vue';
import { Assets, Texture } from 'pixi.js';
import type { DiceTextureArray, UseDiceReturn } from '@/types/game';

export function useDice(): UseDiceReturn {
  const isRolling = ref(false);
  const isLoaded = ref(false);

  // 주사위 텍스처 배열 초기화
  const diceTextures = ref<DiceTextureArray>([]);

  const loadDiceAssets = async (): Promise<void> => {
    // manifest 정의
    const manifest = {
      d1: '/assets/dice/dieWhite_border1.png',
      d2: '/assets/dice/dieWhite_border2.png',
      d3: '/assets/dice/dieWhite_border3.png',
      d4: '/assets/dice/dieWhite_border4.png',
      d5: '/assets/dice/dieWhite_border5.png',
      d6: '/assets/dice/dieWhite_border6.png',
    };

    try {
      // bundle 등록
      if (!Assets.resolver.hasBundle('dice')) {
        Assets.addBundle('dice', manifest);
      }

      // bundle 로드
      const loaded = (await Assets.loadBundle('dice')) as Record<string, Texture>;

      // undefined를 null로 변경
      diceTextures.value = [
        null,
        loaded.d1 || null,
        loaded.d2 || null,
        loaded.d3 || null,
        loaded.d4 || null,
        loaded.d5 || null,
        loaded.d6 || null,
      ];

      isLoaded.value = true;
    } catch (e) {
      console.error('Dice assets failed to load', e);
    }
  };

  const generateRoll = (): number => {
    return Math.floor(Math.random() * 6) + 1;
  };

  return {
    isRolling,
    isLoaded,
    diceTextures,
    loadDiceAssets,
    generateRoll,
  };
}
