<template>
  <div class="bag-panel">
    <!-- 가방 이미지 -->
    <div class="img-wrapper">
      <img :src="currentBagImage" :alt="bagInfo.name" class="bag-img" />
    </div>

    <div class="info-text">
      <h2 class="bag-title">
        <span class="lv">Lv.{{ bagInfo.lv }}</span> {{ bagInfo.name }}
      </h2>
      <p class="bag-desc">{{ bagInfo.description }}</p>
    </div>

    <div class="stats-container">
      <div v-for="(stat, index) in bagInfo.stats" :key="index" class="stat-item">
        <div class="stat-header">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-value">{{ stat.current }} / {{ stat.max }}</span>
        </div>
        <div class="progress-bar-bg">
          <div
            class="progress-bar-fill"
            :style="{
              width: `${(stat.current / stat.max) * 100}%`,
              backgroundColor: stat.color,
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const bagImageMap: Record<number, string> = {
  1: 'plastic_bag',
  2: 'paper_bag',
  3: 'canvas_bag',
  4: 'leather_bag',
  5: 'travel_bag',
  6: 'backpack',
  7: 'suitcase_s',
  8: 'suitcase_m',
  9: 'suitcase_l',
  10: 'luxury_trunk',
};

// 더미 데이터
const bagInfo = ref({
  lv: 1,
  name: '비닐봉지',
  description:
    '흔하게 볼 수 있는 검정 비닐봉지입니다. 내구성이 약하니 찢어지지 않게 조심해야 합니다.',
  stats: [
    // 현재값, 최대값, 색상
    { label: '내구성', current: 5, max: 100, color: '#8d6e63' }, // 갈색톤
    { label: '수납력', current: 5, max: 100, color: '#5c6bc0' }, // 파란톤
  ],
});

const currentBagImage = computed(() => {
  const fileName = bagImageMap[bagInfo.value.lv] || 'plastic_bag';

  return new URL(`/src/assets/bag/${fileName}.png`, import.meta.url).href;
});
</script>

<style scoped>
.bag-panel {
  background-color: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  height: 60%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* 이미지 스타일 */
.img-wrapper {
  margin-bottom: 10px;
  width: 8vw;
  height: 8vw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bag-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

/* 텍스트 정보 스타일 */
.info-text {
  margin-bottom: 30px;
}
.bag-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 12px;
}
.lv {
  color: #007bff; /* 레벨 강조색 */
  margin-right: 4px;
}
.bag-desc {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
  word-break: keep-all;
}

/* 스탯 바 스타일 */
.stats-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.stat-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 6px;
  font-weight: 600;
}
.progress-bar-bg {
  width: 100%;
  height: 10px;
  background-color: #eee;
  border-radius: 5px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.5s ease-out; /* 부드러운 게이지 애니메이션 */
}
</style>
