<template>
  <main class="home-main">
    <section id="hero" class="hero-section">
      <div class="bg-layer">
        <img src="/assets/start_bg.png" alt="Background" class="bg-image" />
        <div class="bg-overlay"></div>
      </div>

      <div class="hero-content">
        <div class="dice-area">
          <div
            class="dice-wrapper"
            @mouseenter="isDiceHovered = true"
            @mouseleave="isDiceHovered = false"
          >
            <HeroDice auto-spin :scale="[2, 2, 2]" @click="startGame" :is-hovered="isDiceHovered" />
          </div>

          <p class="click-hint">주사위를 굴려 여행을 떠나세요!</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import HeroDice from '@/components/hero/HeroDice.vue';
import { ref } from 'vue';

const router = useRouter();
const isDiceHovered = ref(false);

const startGame = () => {
  router.push('/game');
};
</script>

<style scoped>
.home-main {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* --- Layout --- */
.hero-section {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* --- Background --- */
.bg-layer {
  position: relative;

  width: 1600px;
  max-width: 100%;
  aspect-ratio: 1920/1080;

  z-index: 0;
  margin: 0 auto;
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* --- Hero Content --- */
.hero-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;

  /* Center the dice inside the image area */
  display: flex;
  justify-content: center;
  align-items: center;
}

.dice-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.dice-wrapper {
  width: 18vh;
  height: 18vh;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.click-hint {
  color: rgba(0, 0, 0, 0.9);
  font-size: 0.9rem;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
