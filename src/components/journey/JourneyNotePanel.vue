<template>
  <div class="binder-wrapper">
    <div class="binder-page">
      <Transition name="fade" mode="out-in">
        <div v-if="currentCollection" :key="activeTabId" class="collection-content">
          <h2 class="category-title" :style="{ color: currentCollection.color }">
            {{ currentCollection.label }}
            <span class="total-count">({{ currentCollection.badges.length }})</span>
          </h2>

          <div v-if="currentCollection.badges.length === 0" class="empty-state">
            아직 획득한 뱃지가 없습니다.
          </div>

          <div v-else class="badge-grid">
            <div v-for="badge in currentCollection.badges" :key="badge.id" class="badge-item">
              <div class="badge-circle">
                <span class="emoji-icon">
                  {{ getBadgeEmoji(badge.id, badge.name, currentCollection.id) }}
                </span>
              </div>
              <span class="badge-name">{{ badge.name }}</span>
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
import { ref, computed, watch } from 'vue';
import { usePlayerStore } from '@/stores/player';

const playerStore = usePlayerStore();

// 🎨 아이콘 매핑 함수 (JourneyPanel과 동일하게 유지하거나 import 해서 사용)
const getBadgeEmoji = (id: number, name: string, type: string) => {
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

  if (type === 'trophy') return '🏆';
  if (type === 'spot') return '📍';
  if (type === 'item') return '🎁';
  return '✨';
};

// ... (인터페이스 정의 등) ...

// 실제 데이터 매핑
const collections = computed(() => {
  const data = playerStore.journeyData;
  if (!data) return [];

  return [
    {
      id: 'trophy',
      label: '트로피',
      color: '#ab47bc',
      // Store의 데이터를 그대로 넘겨줌 (iconUrl 무시하고 id로 매핑할 것이므로)
      badges: data.trophies || [],
    },
    {
      id: 'spot',
      label: '여행지',
      color: '#ef5350',
      badges: data.spots || [],
    },
    {
      id: 'item',
      label: '수집품',
      color: '#42a5f5',
      badges: data.items || [],
    },
  ];
});

const activeTabId = ref('trophy');

watch(
  collections,
  (newVal) => {
    if (newVal.length > 0 && !newVal.find((c) => c.id === activeTabId.value)) {
      activeTabId.value = newVal[0].id;
    }
  },
  { immediate: true },
);

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

.binder-page {
  flex: 1;
  background-color: #fff;
  border-radius: 16px;
  padding: 40px;
  border: 1px solid #e0e0e0;
  border-right: none;
  overflow-y: auto;
}

.category-title {
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 30px;
  text-transform: uppercase;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}
.total-count {
  font-size: 1rem;
  color: #888;
  vertical-align: middle;
  margin-left: 8px;
}

.empty-state {
  text-align: center;
  color: #999;
  margin-top: 50px;
  font-size: 1.1rem;
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 24px;
  justify-items: center;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: transform 0.2s;
}
.badge-item:hover {
  transform: translateY(-5px);
}

.badge-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #fff;
  border: 3px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.emoji-icon {
  display: inline-block;
  line-height: 1;
  transform: translateY(2px);
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
}

.text-icon {
  font-size: 2rem;
  color: #ccc;
}

.badge-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  text-align: center;
  word-break: keep-all;
}

.binder-tabs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 40px;
}
.tab-btn {
  width: 60px;
  height: 100px;
  border: none;
  border-radius: 0 12px 12px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 800;
  font-size: 0.9rem;
  position: relative;
  left: -2px;
}
.tab-label {
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 6px;
}
.tab-btn.is-active {
  width: 75px;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.15);
  z-index: 10;
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
