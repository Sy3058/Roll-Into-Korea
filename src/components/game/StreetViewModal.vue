<template>
  <GameModal
    :is-open="isOpen"
    :title="locationName"
    type="trip"
    confirm-text="여행 떠나기"
    cancel-text="취소"
    @confirm="onEnterTrip"
    @cancel="onClose"
  >
    <div class="content-wrapper">
      <p class="description">
        {{ description || locationName + '(으)로 여행을 떠나보세요!' }}
      </p>

      <div class="preview-box">
        <span class="placeholder-text">Street View Preview</span>
      </div>
    </div>
  </GameModal>
</template>

<script setup lang="ts">
import GameModal from '@/components/game/GameModal.vue';

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

const onEnterTrip = () => {
  emit('enter-streetview');
};

const onClose = () => {
  emit('close');
};
</script>

<style scoped>
/* GameModal 내부 슬롯에 대한 스타일링 */
.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.description {
  color: #555;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  text-align: center;
}

.preview-box {
  width: 100%;
  height: 180px; /* 게임 모달에 맞춰 조금 더 키움 */
  background-color: #f0f0f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #bbb;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}

.placeholder-text {
  color: #999;
  font-weight: 700;
  font-size: 1.1rem;
}
</style>
