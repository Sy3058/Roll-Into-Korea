<template>
  <div class="app-container">
    <RouterView />

    <div class="page-curtain" :class="{ active: isNavigating }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterView, useRouter } from 'vue-router';

const router = useRouter();
const isNavigating = ref(false);

// 페이지 이동 시작 전 화면 가리기
router.beforeEach(async (to, from, next) => {
  isNavigating.value = true;
  // 0.4초 동안 페이드 아웃 애니메이션 기다림
  await new Promise((resolve) => setTimeout(resolve, 400));
  next();
});

// 페이지 이동 완료 후 화면 전환
router.afterEach(() => {
  // 약간의 딜레이 후 페이드 인
  setTimeout(() => {
    isNavigating.value = false;
  }, 100);
});
</script>

<style>
/* 전역 스타일 */
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

.app-container {
  width: 100%;
  height: 100%;
  background-color: var(--bg-page, #f8f4e8); /* 기본 배경색 */
  position: relative;
}

/* --- 커튼 효과 스타일 --- */
.page-curtain {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f8f4e8; /* 페이지 배경색과 동일하게 */
  z-index: 9999;

  /* 클릭 통과 방지 & 부드러운 전환 */
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
}

.page-curtain.active {
  pointer-events: auto;
  opacity: 1;
}
</style>
