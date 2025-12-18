<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="app-container">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

#app {
  width: 100%;
  height: 100%;
}

.app-container {
  width: 100%;
  height: 100vh;
  background-color: var(--bg-page);
  color: var(--color-text-main);
  font-family: 'Noto Sans KR', sans-serif;
  position: relative;
}

/* --- 페이지 전환 애니메이션 (Fade) --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
