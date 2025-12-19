<template>
  <div class="journey-panel">
    <div class="journey-header">
      <h3>여행 노트</h3>
      <p>여행을 통해 뱃지를 모아보세요.</p>
    </div>

    <div class="journey-list">
      <div class="list-item" v-for="category in collections" :key="category.id">
        <div class="item-header">
          <span class="category-name">{{ category.label }}</span>
          <button class="more-btn" @click="handleMoreClick">더보기 ></button>
        </div>

        <div class="badge-row">
          <div
            v-for="badge in category.badges.slice(0, 4)"
            :key="badge.id"
            class="badge-item"
            :class="{ locked: !badge.isObtained }"
          >
            <div class="badge-circle">
              <span v-if="badge.isObtained" class="emoji-icon">{{ badge.icon }}</span>
              <span v-else class="text-icon">?</span>
            </div>

            <div v-if="!badge.isObtained" class="lock-overlay">🔒</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleMoreClick = () => {
  router.push('/journey');
};

// --- 데이터 인터페이스 ---
interface Badge {
  id: number;
  name: string;
  icon: string;
  isObtained: boolean;
}

interface BadgeCategory {
  id: string;
  label: string;
  badges: Badge[];
}

// --- 더미 데이터 (Binder 코드 내용 활용) ---
const collections = ref<BadgeCategory[]>([
  {
    id: 'achieve',
    label: '칭호',
    badges: [
      { id: 99, name: '첫 걸음', icon: '👣', isObtained: true },
      { id: 98, name: '부자 되기', icon: '💰', isObtained: false },
      { id: 97, name: '달리기', icon: '🏃', isObtained: false },
      { id: 96, name: '점프', icon: '💨', isObtained: true },
      { id: 95, name: '비행', icon: '✈️', isObtained: false },
    ],
  },
  {
    id: 'place',
    label: '여행지',
    badges: [
      { id: 1, name: '남산 타워', icon: '🗼', isObtained: true },
      { id: 2, name: '경복궁', icon: '🏯', isObtained: true },
      { id: 3, name: '한강', icon: '🌊', isObtained: false },
      { id: 4, name: '도시', icon: '🏙️', isObtained: false },
      { id: 5, name: '타워', icon: '🏢', isObtained: true },
    ],
  },
  {
    id: 'souvenir',
    label: '기념품',
    badges: [
      { id: 7, name: '계란빵', icon: '🍞', isObtained: true },
      { id: 8, name: '열쇠', icon: '🔑', isObtained: false },
      { id: 9, name: '한복', icon: '👗', isObtained: false },
      { id: 10, name: '모자', icon: '🧢', isObtained: true },
    ],
  },
]);
</script>

<style scoped>
.journey-panel {
  flex: 1;
  /* 이전 사이드바 스타일 배경색 */
  background-color: transparent;
  padding: 20px 10px; /* 사이드바 패딩 */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 헤더 스타일 */
.journey-header h3 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #333;
}
.journey-header p {
  margin: 0;
  font-size: 0.8rem;
  color: #777;
}

.journey-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #444;
}

.more-btn {
  background: none;
  border: none;
  font-size: 0.8rem;
  color: #999;
  cursor: pointer;
}

.badge-row {
  display: flex;
  gap: 12px;
  /* 가로로 나열 */
}

/* --- Binder Style Badges (가져온 CSS) --- */
.badge-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
}

.badge-item:hover {
  transform: translateY(-3px);
}

.badge-circle {
  /* 사이드바에 맞게 크기 약간 조정 (80px -> 56px) */
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #f9f9f9; /* 기본 밝은 회색 */
  border: 2px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem; /* 이모지 크기 */
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

/* 텍스트 아이콘 (물음표 등) */
.text-icon {
  font-size: 1.2rem;
  color: #ccc;
  font-weight: bold;
}

/* Locked State Styles */
.badge-item.locked .badge-circle {
  background-color: #e0e0e0; /* 잠겼을 때 어두운 회색 */
  border-color: #ccc;
  color: transparent; /* 아이콘 숨김 */
}

.lock-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2rem;
  opacity: 0.6;
  pointer-events: none; /* 클릭 방해 금지 */
}
</style>
