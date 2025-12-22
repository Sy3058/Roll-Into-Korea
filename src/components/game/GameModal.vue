<template>
  <Teleport to="body">
    <Transition name="pop">
      <div v-if="isOpen" class="game-modal-overlay">
        <div class="game-card" :class="type">
          <div class="game-header">
            <span v-if="type === 'trip'" class="icon">📍</span>
            <span v-if="type === 'pay'" class="icon">💸</span>
            <span v-if="type === 'chance'" class="icon">✨</span>

            <h2 class="title">{{ title }}</h2>
          </div>

          <div class="game-body">
            <slot></slot>
          </div>

          <div class="game-actions">
            <button class="game-btn cancel" @click="$emit('cancel')">
              {{ cancelText || '취소' }}
            </button>
            <button class="game-btn confirm" @click="$emit('confirm')">
              {{ confirmText || '확인' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
  title: string;
  // 모달의 성격에 따라 색상을 다르게 주기 위한 타입
  type?: 'normal' | 'trip' | 'pay' | 'chance';
  confirmText?: string;
  cancelText?: string;
}

withDefaults(defineProps<Props>(), {
  type: 'normal',
  confirmText: '확인',
  cancelText: '취소',
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<style scoped>
/* 1. 오버레이: 배경 클릭 방지 및 어둡게 처리 */
.game-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* 배경이 살짝 보이도록 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000; /* BaseModal(1000)보다 높게 설정 */
  backdrop-filter: blur(2px);
}

/* 2. 게임 카드 디자인: 두꺼운 테두리와 입체감 */
.game-card {
  width: 90%;
  max-width: 400px;
  background: #ffffff;
  border: 4px solid #1a1a1a;
  border-radius: 16px;
  /* 굵은 하드 쉐도우로 게임 느낌 강조 */
  box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: center center;
}

/* 3. 헤더 스타일 (타입별 색상 변경) */
.game-header {
  padding: 16px 20px;
  border-bottom: 4px solid #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #1a1a1a;
  background-color: #f3f4f6; /* 기본값 */
}

/* 타입별 헤더 색상 커스텀 */
.game-card.trip .game-header {
  background-color: #4ade80;
}
.game-card.pay .game-header {
  background-color: #f87171;
}
.game-card.chance .game-header {
  background-color: #c084fc;
}

.title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.5px;
}

.icon {
  font-size: 1.5rem;
}

/* 4. 본문 스타일 */
.game-body {
  padding: 30px 20px;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  color: #4b5563;
  background-color: #fff;
}

/* 5. 액션 버튼 (Placeholder) */
.game-actions {
  display: flex;
  border-top: 4px solid #1a1a1a;
}

.game-btn {
  flex: 1;
  padding: 18px;
  font-size: 1.1rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  transition: all 0.1s ease;
}

.game-btn.cancel {
  background-color: #e5e7eb;
  color: #4b5563;
  border-right: 4px solid #1a1a1a;
}
.game-btn.cancel:hover {
  background-color: #d1d5db;
}

.game-btn.confirm {
  background-color: #fbbf24; /* 확인: 노랑(주목성 높음) */
  color: #1a1a1a;
}
.game-btn.confirm:hover {
  background-color: #f59e0b;
}
.game-btn:active {
  background-color: #d97706;
}

/* 6. 등장 애니메이션 (POP 효과) */
.pop-enter-active {
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-leave-active {
  animation: pop-out 0.2s ease-in;
}

@keyframes pop-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes pop-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
}
</style>
