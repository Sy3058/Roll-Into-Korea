<template>
  <div class="canvas-container">
    <TresCanvas :clear-alpha="0" shadows @loop="onLoop">
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
import { ref } from 'vue';
import { TresCanvas } from '@tresjs/core';
import { GLTFModel } from '@tresjs/cientos';
import type { Group } from 'three';
import type { DiceProps, DiceEmits, RotationMap } from '@/types/dice';

const props = withDefaults(defineProps<DiceProps & { isHovered?: boolean }>(), {
  autoSpin: false,
  scale: () => [1, 1, 1],
  isHovered: false,
});

const emit = defineEmits<DiceEmits>();
const diceGroupRef = ref<Group | null>(null);

interface LoopContext {
  delta: number;
}

const onLoop = ({ delta }: LoopContext) => {
  if (props.autoSpin && diceGroupRef.value) {
    // Speed Logic
    const speed = props.isHovered ? 48 : 12;
    diceGroupRef.value.rotation.x += delta * speed;
    diceGroupRef.value.rotation.y += delta * speed;
    diceGroupRef.value.rotation.z += delta * (speed * 0.5);

    // Scale Logic
    const currentScale = diceGroupRef.value.scale.x;
    const targetScale = props.isHovered ? 1.1 : 1.0;
    const nextScale = currentScale + (targetScale - currentScale) * 0.1;

    diceGroupRef.value.scale.set(nextScale, nextScale, nextScale);
  }
};

const faces: RotationMap = {
  1: { x: 0, y: 0 },
  2: { x: -Math.PI / 2, y: 0 },
  3: { x: 0, y: -Math.PI / 2 },
  4: { x: 0, y: Math.PI / 2 },
  5: { x: Math.PI / 2, y: 0 },
  6: { x: Math.PI, y: 0 },
};

const roll = (targetNumber?: number) => {
  if (!diceGroupRef.value) return;
  const result = targetNumber || Math.floor(Math.random() * 6) + 1;
  const targetRotation = faces[result as keyof RotationMap] ?? { x: 0, y: 0 };
  const spins = 8;

  gsap.to(diceGroupRef.value.rotation, {
    duration: 1.5,
    ease: 'power2.out',
    x: targetRotation.x + Math.PI * 2 * spins,
    y: targetRotation.y + Math.PI * 2 * spins,
    z: 0,
    onComplete: () => {
      if (diceGroupRef.value) {
        diceGroupRef.value.rotation.x = targetRotation.x;
        diceGroupRef.value.rotation.y = targetRotation.y;
        diceGroupRef.value.rotation.z = 0;
        emit('roll-complete', result);
      }
    },
  });
};

const handleClick = (ev: any) => {
  if (ev) ev.stopPropagation();
  emit('click', ev);
};

defineExpose({ roll });
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  pointer-events: auto;
}
</style>
