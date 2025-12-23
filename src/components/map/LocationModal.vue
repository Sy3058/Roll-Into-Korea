<template>
  <Teleport to="body">
    <Transition name="pop">
      <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
        <div class="game-card" :class="locationData?.type?.toLowerCase()">
          <div class="game-header">
            <span class="icon">{{ locationData?.type === 'SHOP' ? '🛒' : '📍' }}</span>
            <h2 class="title">{{ locationData?.name }}</h2>
            <button class="close-btn" @click="$emit('close')">✕</button>
          </div>

          <div class="game-body">
            <div v-if="locationData?.type === 'SHOP'" class="shop-view">
              <div class="money-display">
                <span class="coin-icon">💰</span>
                <span class="amount">₩{{ userMoney.toLocaleString() }}</span>
              </div>

              <div v-if="locationData.items && locationData.items.length > 0" class="items-list">
                <div v-for="item in locationData.items" :key="item.id" class="shop-item">
                  <div class="item-left">
                    <div class="item-icon">{{ getCategoryIcon(item.category) }}</div>
                    <div class="item-info">
                      <div class="item-name">{{ item.name }}</div>
                      <div class="item-price">₩{{ item.price.toLocaleString() }}</div>
                    </div>
                  </div>
                  <button
                    class="buy-btn"
                    :disabled="userMoney < item.price"
                    @click="$emit('buy-item', item)"
                  >
                    {{ userMoney < item.price ? '부족' : '구매' }}
                  </button>
                </div>
              </div>
              <div v-else class="empty-state">진열된 상품이 없습니다.</div>
            </div>

            <div v-else class="landmark-view">
              <div class="landmark-img-box">
                <span class="placeholder-text">PHOTO</span>
              </div>
              <p class="description">{{ locationData?.description }}</p>
            </div>
          </div>

          <div class="game-actions">
            <button class="game-btn confirm" @click="$emit('close')">닫기</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { QuestData, ShopItem, ItemCategory } from '@/types/quest';

interface Props {
  isOpen: boolean;
  locationData: QuestData | null;
  userMoney: number;
}

defineProps<Props>();
defineEmits<{
  (e: 'close'): void;
  (e: 'buy-item', item: ShopItem): void;
}>();

const getCategoryIcon = (category: ItemCategory) => {
  switch (category) {
    case 'FOOD':
      return '🍱';
    case 'GIFT':
      return '🎁';
    default:
      return '📦';
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.game-card {
  width: 90%;
  max-width: 420px;
  background: #ffffff;
  border: 4px solid #1a1a1a;
  border-radius: 16px;
  box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 85vh; /* Limit height for long item lists */
}

/* --- Header --- */
.game-header {
  padding: 16px 20px;
  border-bottom: 4px solid #1a1a1a;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #f3f4f6;
  color: #1a1a1a;
}
/* Header Colors per Type */
.game-card.shop .game-header {
  background-color: #4ade80; /* Bright Green */
}
.game-card.landmark .game-header {
  background-color: #60a5fa; /* Blue */
}

.title {
  margin: 0;
  flex: 1;
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: -0.5px;
}
.icon {
  font-size: 1.5rem;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  color: #1a1a1a;
}

/* --- Body --- */
.game-body {
  padding: 0; /* Let children handle padding or scroll */
  background-color: #fff;
  overflow-y: auto; /* Scrollable body */
}

/* --- Shop View Styling --- */
.shop-view {
  padding: 20px;
}

.money-display {
  background-color: #1a1a1a;
  color: #fbbf24;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 800;
  font-size: 1.2rem;
  margin-bottom: 20px;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shop-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 3px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.1s;
}
.shop-item:hover {
  border-color: #1a1a1a;
  background-color: #fafafa;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.item-icon {
  font-size: 1.8rem;
}
.item-info {
  display: flex;
  flex-direction: column;
}
.item-name {
  font-weight: 700;
  color: #1f2937;
}
.item-price {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
}

.buy-btn {
  padding: 8px 16px;
  background-color: #fbbf24;
  border: 3px solid #1a1a1a;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 2px 2px 0 #1a1a1a;
}
.buy-btn:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}
.buy-btn:disabled {
  background-color: #e5e7eb;
  border-color: #9ca3af;
  color: #9ca3af;
  box-shadow: none;
  cursor: not-allowed;
}

/* --- Landmark View Styling --- */
.landmark-view {
  padding: 24px;
  text-align: center;
}

.landmark-img-box {
  width: 100%;
  height: 180px;
  background-color: #e5e7eb;
  border: 3px dashed #9ca3af;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.placeholder-text {
  font-weight: 800;
  color: #9ca3af;
  letter-spacing: 2px;
}

.description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #4b5563;
  font-weight: 600;
  word-break: keep-all;
}

/* --- Footer Actions --- */
.game-actions {
  display: flex;
  border-top: 4px solid #1a1a1a;
}

.game-btn {
  flex: 1;
  padding: 18px;
  font-size: 1.1rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
}
.game-btn.confirm {
  background-color: #fbbf24;
  color: #1a1a1a;
}
.game-btn.confirm:hover {
  background-color: #f59e0b;
}
.game-btn:active {
  background-color: #d97706;
}

/* --- Pop Animation --- */
.pop-enter-active {
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-leave-active {
  animation: pop-out 0.2s ease-in;
}

@keyframes pop-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes pop-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
}
</style>
