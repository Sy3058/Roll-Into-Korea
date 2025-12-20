<template>
  <div class="canvas-container">
    <TresCanvas :clear-alpha="0" antialias shadows @loop="onLoop">
      <TresPerspectiveCamera :position="[0, 0, 4.4]" />
      <TresAmbientLight :intensity="2" />
      <TresDirectionalLight :position="[5, 5, 5]" :intensity="3" />

      <Suspense>
        <TresGroup ref="diceGroupRef" @click="handleClick">
          <GLTFModel path="/assets/dice.glb" :scale="props.scale" />
        </TresGroup>
      </Suspense>
    </TresCanvas>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { TresCanvas } from '@tresjs/core';
import { GLTFModel } from '@tresjs/cientos';
import type { Group } from 'three';

interface TresEvent {
  stopPropagation: () => void;
  [key: string]: unknown; // 다른 속성들이 있어도 허용
}

const props = withDefaults(
  defineProps<{
    autoSpin?: boolean;
    scale?: [number, number, number];
    isHovered?: boolean;
  }>(),
  {
    autoSpin: true,
    scale: () => [1, 1, 1],
    isHovered: false,
  },
);

const emit = defineEmits<{
  (e: 'click', event: TresEvent): void;
}>();

const diceGroupRef = ref<Group | null>(null);

interface LoopContext {
  delta: number;
}

// 매 프레임 실행
const onLoop = ({ delta }: LoopContext) => {
  if (props.autoSpin && diceGroupRef.value) {
    // 회전 속도 조절
    const speed = props.isHovered ? 48 : 12;

    diceGroupRef.value.rotation.x += delta * speed;
    diceGroupRef.value.rotation.y += delta * speed;
    diceGroupRef.value.rotation.z += delta * (speed * 0.5);

    // 크기 조절
    const currentScale = diceGroupRef.value.scale.x;
    const targetScale = props.isHovered ? 1.2 : 1.0;
    const nextScale = currentScale + (targetScale - currentScale) * 0.1;

    diceGroupRef.value.scale.set(nextScale, nextScale, nextScale);
  }
};

// 클릭 이벤트 전달
// 이때 ev 자체를 TresEvent로 받으면 TresJS가 실제로 던져주는 이벤트와 타입이 일치하지 않을 수 있음 따라서 내부에서 변환해야함
const handleClick = (ev: unknown) => {
  const event = ev as TresEvent;
  if (event && event.stopPropagation) event.stopPropagation(); // 안전하게 호출
  emit('click', event);
};

// 주사위 사라질 때 참조 제거
onBeforeUnmount(() => {
  diceGroupRef.value = null;
});
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  pointer-events: auto;
}
</style>
