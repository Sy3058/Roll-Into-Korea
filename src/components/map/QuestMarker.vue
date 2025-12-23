<template>
  <div class="quest-mark-container" @click="handleClick">
    <div class="icon-bg">
      <span class="icon-text">{{ iconChar }}</span>
    </div>
    <div class="quest-name">{{ name }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Define what data this marker needs
interface Props {
  name: string;
  type: 'SHOP' | 'LANDMARK';
}

const props = defineProps<Props>();

// Define events
const emit = defineEmits<{
  (e: 'click'): void;
}>();

const handleClick = () => {
  emit('click');
};

// Computed logic for the icon
const iconChar = computed(() => {
  return props.type === 'SHOP' ? '🛒' : '📍';
});
</script>

<style scoped>
.quest-mark-container {
  position: absolute;
  cursor: pointer;
  animation: float 1.5s infinite ease-in-out;
  transform: translateY(-200px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-bg {
  width: 36px;
  height: 36px;
  background-color: #ffd700;
  border: 3px solid #fff;
  border-radius: 50% 50% 0 50%;
  transform: rotate(45deg);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text {
  font-size: 20px;
  font-weight: 900;
  color: #d32f2f;
  transform: rotate(-45deg); /* Counter-rotate text */
}

.quest-name {
  margin-top: 12px; /* Adjusted spacing */
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(-200px);
  }
  50% {
    transform: translateY(-215px);
  }
}
</style>
