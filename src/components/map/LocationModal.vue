<template>
  <Teleport to="body">
    <Transition name="pop">
      <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ locationData?.name || '장소 정보' }}</h3>
            <button class="close-btn" @click="$emit('close')">✕</button>
          </div>

          <div class="modal-body">
            <div class="description">
              {{ locationData?.description || '설명이 없습니다.' }}
            </div>

            <div v-if="locationData?.type === 'SHOP'" class="shop-section">
              <h4>🛒 판매 물품</h4>
              <ul class="item-list">
                <li v-for="item in locationData.items" :key="item.id" class="item-row">
                  <div class="item-info">
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-cost">₩{{ item.cost.toLocaleString() }}</span>
                  </div>
                  <BaseButton
                    size="sm"
                    :disabled="userMoney < item.cost"
                    @click="$emit('buy-item', item)"
                  >
                    구매
                  </BaseButton>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { MapQuest, MapQuestItem } from '@/types/game'; // game.ts 사용
import BaseButton from '@/components/common/BaseButton.vue';

interface Props {
  isOpen: boolean;
  locationData: MapQuest | null; // MapQuest 타입 사용
  userMoney: number;
}

defineProps<Props>();
defineEmits(['close', 'buy-item']);
</script>

<style scoped>
/* (스타일은 기존 그대로 유지) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-card {
  background: white;
  width: 90%;
  max-width: 360px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
.modal-header {
  background: #f3f4f6;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.modal-body {
  padding: 20px;
}
.description {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}
.shop-section h4 {
  margin: 0 0 10px 0;
  color: #333;
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
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.item-info {
  display: flex;
  flex-direction: column;
}
.item-name {
  font-weight: bold;
}
.item-cost {
  font-size: 0.9rem;
  color: #888;
}
</style>
