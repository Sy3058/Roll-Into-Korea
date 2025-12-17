<template>
  <div class="journey-page">
    <header class="journey-header">
      <button class="btn-back" @click="router.go(-1)">
        <span class="icon">←</span> 게임으로 돌아가기
      </button>
    </header>

    <main class="content-container">
      <section class="left-section">
        <JourneyBagPanel />
      </section>

      <section class="right-section">
        <JourneyNotePanel />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import JourneyBagPanel from '@/components/journey/JourneyBagPanel.vue';
import JourneyNotePanel from '@/components/journey/JourneyNotePanel.vue';

const router = useRouter();
</script>

<style scoped>
.journey-page {
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 20px 40px;
  display: flex;
  flex-direction: column;
}

/* 헤더 & 뒤로가기 버튼 */
.journey-header {
  margin-bottom: 30px;
}
.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.2s;
}
.btn-back:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #333;
}
.btn-back .icon {
  font-size: 1.3rem;
}

/* 콘텐츠 레이아웃 */
.content-container {
  flex: 1; /* 남은 높이 모두 사용 */
  display: flex;
  gap: 40px; /* 패널 사이 간격 */
  max-width: 1400px; /* 너무 넓어지지 않도록 제한 */
  margin: 0 auto; /* 가운데 정렬 */
  width: 100%;
  height: 80vh; /* 적절한 높이 고정 (스크롤 생기지 않게) */
}

.left-section {
  flex: 2;
  min-width: 320px; /* 최소 너비 보장 */
}

.right-section {
  flex: 3;
}

/* 반응형: 화면이 좁아지면 위아래로 배치 */
@media (max-width: 900px) {
  .content-container {
    flex-direction: column;
    height: auto;
    gap: 30px;
  }
  .left-section,
  .right-section {
    flex: auto;
    width: 100%;
  }
  .journey-page {
    padding: 20px;
  }
}
</style>
