<template>
  <div class="bag-panel">
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
import { computed } from 'vue';
import { usePlayerStore } from '@/stores/player';

const playerStore = usePlayerStore();

const bagImageMap: Record<number, string> = {
  1: 'plastic_bag', // 비닐봉지
  2: 'paper_bag', // 종이봉투
  3: 'canvas_bag', // 에코백
  4: 'sub_bag', // 보조가방
  5: 'backpack', // 백팩
  6: 'hiking_bag', // 등산용 배낭
  7: 'duffle_bag', // 여행용 더플백
  8: 'suitcase_s', // 소형 캐리어
  9: 'suitcase_m', // 대형 캐리어
  10: 'suitcase_l', // 32인치 캐리어
};

// Store 데이터 매핑
const bagInfo = computed(() => {
  const data = playerStore.journeyData;

  // 데이터 로딩 전 기본값
  if (!data) {
    return {
      lv: 0,
      name: '가방 정보 로딩 중...',
      description: '',
      stats: [
        { label: '내구성', current: 0, max: 100, color: '#e0e0e0' },
        { label: '수납력', current: 0, max: 100, color: '#e0e0e0' },
      ],
    };
  }

  const MAX_STAT = 100;

  return {
    lv: data.level,
    name: data.levelName,
    description: data.levelDescription,
    stats: [
      {
        label: '내구성',
        current: data.levelStrength,
        max: MAX_STAT,
        color: '#8d6e63',
      },
      {
        label: '수납력',
        current: data.levelCapacity,
        max: MAX_STAT,
        color: '#5c6bc0',
      },
    ],
  };
});

// 이미지 경로 생성
const currentBagImage = computed(() => {
  const lv = bagInfo.value.lv || 1;
  // 매핑된 파일명이 없으면 기본값(plastic_bag) 사용
  const fileName = bagImageMap[lv] || 'plastic_bag';
  return new URL(`/src/assets/bag/${fileName}.png`, import.meta.url).href;
});
</script>

<style scoped>
.bag-panel {
  background-color: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  height: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.img-wrapper {
  margin-bottom: 15px;
  width: 10vw;
  max-width: 120px;
  height: 10vw;
  max-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bag-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 8px 8px rgba(0, 0, 0, 0.15));
  transition: transform 0.3s ease;
}
.bag-img:hover {
  transform: scale(1.05) rotate(-2deg);
}

.info-text {
  margin-bottom: 25px;
  width: 100%;
}

.bag-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #333;
  margin: 0 0 8px 0;
}

.lv {
  color: #007bff;
  margin-right: 6px;
  font-size: 1.2rem;
}

.bag-desc {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
  word-break: keep-all;
  padding: 0 10px;
}

.stats-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #555;
  font-weight: 700;
}

.stat-value {
  color: #888;
  font-weight: 500;
  font-size: 0.85rem;
}

.progress-bar-bg {
  width: 100%;
  height: 12px;
  background-color: #f1f3f5;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.progress-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}
</style>
