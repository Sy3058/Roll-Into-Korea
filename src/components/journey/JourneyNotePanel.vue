<template>
  <div class="binder-wrapper">
    <div class="binder-page">
      <Transition name="fade" mode="out-in">
        <div :key="activeTabId" class="collection-content">
          <h2 class="category-title" :style="{ color: currentCollection?.color }">
            {{ currentCollection?.label }}
          </h2>

          <div class="badge-grid">
            <div
              v-for="badge in currentCollection?.badges"
              :key="badge.id"
              class="badge-item"
              :class="{ locked: !badge.isObtained }"
            >
              <div class="badge-circle">
                <span v-if="badge.icon.length < 3" class="emoji-icon">{{ badge.icon }}</span>
                <span v-else class="text-icon">?</span>
              </div>

              <span class="badge-name">{{ badge.name }}</span>

              <div v-if="!badge.isObtained" class="lock-overlay">🔒</div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <div class="binder-tabs">
      <button
        v-for="tab in collections"
        :key="tab.id"
        class="tab-btn"
        :class="{ 'is-active': activeTabId === tab.id }"
        :style="{ backgroundColor: tab.color }"
        @click="selectTab(tab.id)"
      >
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 뱃지 데이터 구조 정의
interface Badge {
  id: number;
  name: string;
  icon: string; // 이미지 경로 또는 이모지
  isObtained: boolean; // 획득 여부
}

interface BadgeCategory {
  id: string;
  label: string; // 탭에 표시될 이름
  color: string; // 탭 색상
  badges: Badge[];
}

// 더미 데이터
const collections = ref<BadgeCategory[]>([
  {
    id: 'achieve',
    label: '칭호',
    color: '#ab47bc', // 보라 (업적)
    badges: [
      { id: 99, name: '첫 걸음', icon: '👣', isObtained: true },
      { id: 98, name: '부자 되기', icon: '💰', isObtained: false },
    ],
  },
  {
    id: 'place',
    label: '여행지',
    color: '#ef5350',
    badges: [
      { id: 1, name: '남산 타워', icon: '🗼', isObtained: true },
      { id: 2, name: '경복궁', icon: '🏯', isObtained: true },
      { id: 3, name: '한강 공원', icon: 'river', isObtained: false }, // 미획득
      { id: 4, name: '강남 대로', icon: 'city', isObtained: false },
      { id: 5, name: '롯데 타워', icon: 'bldg', isObtained: true },
      { id: 6, name: 'DDP', icon: 'ufo', isObtained: false },
    ],
  },
  {
    id: 'souvenir',
    label: '기념품',
    color: '#42a5f5', // 파랑 (부산)
    badges: [
      { id: 7, name: '계란빵', icon: 'eggbread', isObtained: true },
      { id: 8, name: '경복궁 키링', icon: 'keyring', isObtained: false },
      { id: 9, name: '한복', icon: 'hanbok', isObtained: false },
    ],
  },
]);

// 현재 선택된 카테고리 ID
const activeTabId = ref(collections.value[0].id);

// 현재 선택된 카테고리 데이터 계산
const currentCollection = computed(() => collections.value.find((c) => c.id === activeTabId.value));

const selectTab = (id: string) => {
  activeTabId.value = id;
};
</script>

<style scoped>
.binder-wrapper {
  display: flex;
  height: 90%;
  filter: drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.1));
}

/* --- 페이지 본문 --- */
.binder-page {
  flex: 1;
  background-color: #fff;
  border-radius: 16px;
  padding: 40px;
  border: 1px solid #e0e0e0;
  border-right: none;
  overflow-y: auto; /* 뱃지가 많으면 스크롤 */
}

.category-title {
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 30px;
  text-transform: uppercase;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

/* --- 뱃지 그리드 레이아웃 --- */
.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); /* 반응형 그리드 */
  gap: 24px;
  justify-items: center;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
  transition: transform 0.2s;
}

.badge-item:hover {
  transform: translateY(-5px);
}

.badge-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f5f5f5;
  border: 3px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}

.badge-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  text-align: center;
}

/* 미획득(Locked) 스타일 */
.badge-item.locked .badge-circle {
  background-color: #e0e0e0;
  border-color: #ccc;
  color: transparent; /* 아이콘 숨김 */
}
.badge-item.locked .badge-name {
  color: #aaa;
}
.lock-overlay {
  position: absolute;
  top: 25px; /* 원 중앙 쯤 */
  font-size: 1.5rem;
  opacity: 0.6;
}

/* --- 오른쪽 탭 스타일 --- */
.binder-tabs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 40px;
}

.tab-btn {
  width: 60px; /* 탭 너비 */
  height: 100px; /* 탭 높이 */
  border: none;
  border-radius: 0 12px 12px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);

  /* 텍스트 세로 쓰기 등 */
  color: rgba(255, 255, 255, 0.9);
  font-weight: 800;
  font-size: 0.9rem;
  position: relative;
  left: -2px;
}

.tab-label {
  /* 텍스트를 세로로 표시 */
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 6px;
}

/* 활성화된 탭 */
.tab-btn.is-active {
  width: 75px; /* 더 튀어나오게 */
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.15);
  z-index: 10;
  color: white;
}

/* 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
