<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="inventory-overlay" @click.self="$emit('close')">
        <div class="inventory-card">
          <div class="header">
            <div class="title-area">
              <h2>내 가방</h2>
              <span class="capacity-badge" :class="{ full: isBagFull }">
                {{ inventory.length }} / {{ maxCapacity }}
              </span>
            </div>
            <BaseButton variant="text" @click="$emit('close')" class="close-btn-custom"
              >✕</BaseButton
            >
          </div>

          <div class="body">
            <div v-if="inventory.length === 0" class="empty-state">
              가방이 텅 비었습니다.<br />
              상점에서 물건을 구매해보세요!
            </div>

            <ul v-else class="item-list">
              <li v-for="item in inventory" :key="item.badgeId" class="item-row">
                <div class="item-info">
                  <span class="item-icon">
                    {{ item.category === 'FOOD' ? '🍱' : '🎁' }}
                  </span>
                  <div>
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-cost">₩{{ item.cost.toLocaleString() }}</div>
                  </div>
                </div>
                <BaseButton
                  variant="danger"
                  size="sm"
                  :disabled="isTransactionPending"
                  @click="handleDonate(item.badgeId)"
                >
                  기부하기
                </BaseButton>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePlayerStore } from '@/stores/player';
import BaseButton from '@/components/common/BaseButton.vue';

defineProps<{
  isOpen: boolean;
}>();

defineEmits(['close']);

const playerStore = usePlayerStore();
// Store에서 상태 가져오기
const { inventory, maxCapacity, isBagFull, isTransactionPending } = storeToRefs(playerStore);

const handleDonate = async (badgeId: number) => {
  await playerStore.donateItem(badgeId);
};
</script>

<style scoped>
.inventory-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(2px);
}

.inventory-card {
  width: 90%;
  max-width: 380px;
  background: #fff;
  border-radius: 16px;
  border: 4px solid #1a1a1a;
  box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  overflow: hidden;
}

.header {
  background: #f3f4f6;
  padding: 16px;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
}

.capacity-badge {
  background: #e5e7eb;
  color: #4b5563;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
}
.capacity-badge.full {
  background: #fee2e2;
  color: #ef4444;
}

.close-btn-custom {
  font-size: 1.5rem;
  padding: 4px 8px !important;
}

.body {
  padding: 20px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  color: #888;
  padding: 40px 0;
  line-height: 1.5;
}

.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.05);
}

.item-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.item-icon {
  font-size: 1.4rem;
}
.item-name {
  font-weight: 700;
  color: #333;
  font-size: 0.95rem;
}
.item-cost {
  font-size: 0.8rem;
  color: #666;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
