<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <template #header>
      <h2 class="title">📍 {{ locationName }}</h2>
    </template>

    <template #body>
      <p class="description">
        {{ description || '이 장소의 360° 파노라마를 확인해보세요!' }}
      </p>
      <div class="preview-box">
        <span class="placeholder-text">Street View Preview</span>
      </div>
    </template>

    <template #footer>
      <BaseButton variant="primary" @click="onEnter"> 여행 떠나기 </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/components/common/BaseModal.vue';
import BaseButton from '@/components/common/BaseButton.vue';

interface Props {
  isOpen: boolean;
  locationName: string;
  description?: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'enter-streetview'): void;
}>();

const onEnter = () => {
  emit('enter-streetview');
};
</script>

<style scoped>
/* 스트리트뷰 모달에만 필요한 구체적인 스타일 */
.title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0;
}

.description {
  color: #555;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.preview-box {
  width: 100%;
  height: 150px;
  background-color: #f0f0f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ddd;
}

.placeholder-text {
  color: #aaa;
  font-weight: 600;
}
</style>
