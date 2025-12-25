<template>
  <div class="journey-panel">
    <div class="journey-header">
      <h3>여행 노트</h3>
      <p>여행을 통해 뱃지를 모아보세요.</p>
      <button class="more-btn" @click="handleMoreClick">더보기 ></button>
    </div>

    <div class="journey-list">
      <div class="list-item" v-for="category in collections" :key="category.id">
        <div class="item-header">
          <span class="category-name">{{ category.label }}</span>
          <span class="count">{{ category.obtainedCount }}개</span>
        </div>

        <div class="badge-row">
          <div
            v-for="badge in category.badges"
            :key="badge.id"
            class="badge-item"
            :class="{ locked: badge.isLocked }"
          >
            <div class="badge-circle">
              <span class="emoji-icon">
                {{ badge.isLocked ? '🔒' : getBadgeEmoji(badge.id, badge.name, category.id) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/player';

const router = useRouter();
const playerStore = usePlayerStore();

const handleMoreClick = () => {
  router.push('/journey');
};

// 🎨 아이콘 매핑 함수
const getBadgeEmoji = (id: number, name: string, type: string) => {
  // 예외적으로 매핑할 특수 아이콘들
  const iconMap: Record<number, string> = {
    1: '🗼',
    2: '🏯',
    3: '🌊',
    4: '🏙️',
    5: '🏢',
    7: '🍞',
    8: '🔑',
    9: '👗',
    10: '🧢',
    99: '👣',
    98: '💰',
    97: '🏃',
  };
  if (iconMap[id]) return iconMap[id];

  // 기본 아이콘
  if (type === 'trophy') return '🏆';
  if (type === 'spot') return '📍';
  if (type === 'item') return '🎁';
  return '✨';
};

// 🔥 [핵심 로직] 4칸을 항상 채워주는 함수
const fillWithPlaceholders = (items: any[] | undefined) => {
  const MAX_SLOTS = 4;
  const realItems = items ? [...items] : [];
  const result = [];

  // 1. 실제 아이콘 채우기 (최대 4개)
  for (let i = 0; i < MAX_SLOTS; i++) {
    if (i < realItems.length) {
      // 실제 뱃지
      result.push({
        ...realItems[i],
        isLocked: false, // 획득함
      });
    } else {
      // 빈 자리 (Placeholder)
      result.push({
        id: `locked-${i}`, // 고유 키
        name: '???',
        isLocked: true, // 잠김
      });
    }
  }
  return result;
};

// 데이터 매핑
const collections = computed(() => {
  const data = playerStore.journeyData;
  // 데이터가 로드되지 않았더라도 기본 구조는 보여줍니다.

  return [
    {
      id: 'trophy',
      label: '🏆 트로피',
      obtainedCount: data?.trophies?.length || 0,
      badges: fillWithPlaceholders(data?.trophies),
    },
    {
      id: 'spot',
      label: '📍 여행지',
      obtainedCount: data?.spots?.length || 0,
      badges: fillWithPlaceholders(data?.spots),
    },
    {
      id: 'item',
      label: '🎒 수집품',
      obtainedCount: data?.items?.length || 0,
      badges: fillWithPlaceholders(data?.items),
    },
  ];
});
</script>

<style scoped>
.journey-panel {
  flex: 1;
  background-color: transparent;
  padding: 20px 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.journey-header {
  position: relative;
  margin-bottom: 10px;
}
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

.more-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  font-size: 0.8rem;
  color: #999;
  cursor: pointer;
  padding: 0;
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
.count {
  font-size: 0.8rem;
  color: #888;
}

.badge-row {
  display: flex;
  gap: 12px;
  /* 줄바꿈 없이 한 줄에 보여주기 */
  flex-wrap: nowrap;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
}
.badge-item:hover {
  transform: translateY(-3px);
}

.badge-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #fff;
  border: 2px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  font-size: 1.5rem;
  line-height: 1;
}

/* 🔥 [추가] 잠긴 상태 스타일: 약간 흐릿하게 처리 */
.badge-item.locked .badge-circle {
  background-color: #f5f5f5; /* 회색 배경 */
  border-color: #e0e0e0;
  opacity: 0.7;
}

.emoji-icon {
  display: inline-block;
  transform: translateY(1px);
}
</style>
