<!-- 기본 버튼 -->
<template>
  <button :class="buttonClass" :disabled="disabled">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 버튼의 옵션 정의
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'text'; // 버튼 스타일 종류
  size?: 'sm' | 'md' | 'lg'; // 버튼 크기
  fullWidth?: boolean; // 가로로 꽉 채울지 여부
  disabled?: boolean;
}

// 기본값 설정 (아무것도 안 넣으면 primary, md 사이즈)
const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  fullWidth: false,
  disabled: false,
});

// 클래스 조합하기
const buttonClass = computed(() => {
  return [
    'base-btn',
    `btn-${props.variant}`,
    `size-${props.size}`,
    { 'full-width': props.fullWidth },
    { 'is-disabled': props.disabled },
  ];
});
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  line-height: 1;
}

.base-btn:active:not(:disabled) {
  transform: scale(0.98); /* 클릭 시 살짝 눌리는 효과 */
}

.base-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.full-width {
  width: 100%;
}

/* --- 색상 변형 (Variants) --- */
/* 1. Primary (메인 - 파란색) */
.btn-primary {
  background-color: #007bff;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 123, 255, 0.2);
}
.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 123, 255, 0.3);
}

/* 2. Secondary (보조 - 회색) */
.btn-secondary {
  background-color: #e9ecef;
  color: #333;
}
.btn-secondary:hover:not(:disabled) {
  background-color: #dee2e6;
}

/* 3. Danger (위험/삭제 - 빨간색) */
.btn-danger {
  background-color: #ff4d4f;
  color: white;
}
.btn-danger:hover:not(:disabled) {
  background-color: #d9363e;
}

/* 4. Text (배경 없는 버튼 - 닫기 버튼 등) */
.btn-text {
  background-color: transparent;
  color: #666;
  padding: 0;
}
.btn-text:hover:not(:disabled) {
  color: #333;
  background-color: rgba(0, 0, 0, 0.05);
}

/* --- 크기 변형 (Sizes) --- */
.size-sm {
  padding: 8px 12px;
  font-size: 0.85rem;
  border-radius: 8px;
}

.size-md {
  padding: 12px 20px;
  font-size: 1rem;
}

.size-lg {
  padding: 16px 32px;
  font-size: 1.2rem;
}
</style>
