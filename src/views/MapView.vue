<template>
  <div class="map-wrapper">
    <div id="roadview" ref="rvRef"></div>
    <div id="minimap" ref="mapRef"></div>

    <BaseButton class="finish-btn" variant="danger" size="lg" @click="isFinishModalOpen = true">
      여행 끝내기
    </BaseButton>

    <BaseModal :isOpen="isFinishModalOpen" @close="isFinishModalOpen = false">
      <template #header>
        <h3 style="margin: 0; font-weight: bold">여행 종료</h3>
      </template>

      <template #body>
        <p style="margin: 0; font-size: 1.1rem; color: #333">정말로 여행을 끝내시겠습니까?</p>
        <p style="margin: 8px 0 0 0; font-size: 0.9rem; color: #888">
          (저장되지 않은 기록은 사라질 수 있습니다)
        </p>
      </template>

      <template #footer>
        <BaseButton variant="secondary" @click="isFinishModalOpen = false"> 취소 </BaseButton>
        <BaseButton variant="danger" @click="confirmFinish"> 종료하기 </BaseButton>
      </template>
    </BaseModal>

    <Transition name="toast">
      <div v-if="isWarningVisible" class="warning-toast">{{ warningMsg }}</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useKakaoMap } from '@/composables/useKakaoMap';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseModal from '@/components/common/BaseModal.vue';

const mapRef = ref<HTMLElement | null>(null);
const rvRef = ref<HTMLElement | null>(null);
const router = useRouter();
const isFinishModalOpen = ref(false);

const { initialize, isWarningVisible, warningMsg } = useKakaoMap();

// 여행 끝내기
const confirmFinish = () => {
  isFinishModalOpen.value = false;
  router.push('/game');
};

onMounted(() => {
  if (mapRef.value && rvRef.value) initialize(mapRef.value, rvRef.value);
});
</script>

<style>
/* --- 전역 스타일 (scoped 안에 있으면 안 됨) --- */
/* 우측 하단 줌/나침반 컨트롤 숨기기 */
div[id^='_box_util_'] {
  display: none !important;
}

/* MapWalker */
.MapWalker {
  width: 0;
  height: 0;
  position: absolute;
  transition: transform 0.1s ease-out;
}
.MapWalker .figure {
  position: absolute;
  width: 14px;
  height: 14px;
  top: -9px;
  left: -9px;
  background-color: #ff0000;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  z-index: 2;
}
.MapWalker .angleBack {
  position: absolute;
  width: 0;
  height: 0;
  top: -20px;
  left: -5px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 10px solid rgba(255, 0, 0, 0.7);
  pointer-events: none;
  z-index: 1;
}

/* QuestMark */
.QuestMark {
  position: absolute;
  cursor: pointer;
  animation: float 1.5s infinite ease-in-out;
  transform: translateY(-200px);
}
.QuestMark .icon-bg {
  width: 30px;
  height: 30px;
  background-color: #ffd700;
  border: 2px solid #fff;
  border-radius: 50% 50% 0 50%;
  transform: rotate(45deg);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
.QuestMark .icon-text {
  font-size: 18px;
  font-weight: 900;
  color: #d32f2f;
  transform: rotate(-45deg);
  margin-left: 2px;
  margin-bottom: 2px;
}
.QuestMark .quest-name {
  margin-top: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
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

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
}
#roadview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
#minimap {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 200px;
  height: 200px;
  z-index: 1;
  border: 3px solid white;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  overflow: hidden;
}
.finish-btn {
  position: absolute;
  bottom: 30px; /* 바닥에서 띄울 간격 */
  right: 30px; /* 오른쪽에서 띄울 간격 */
  z-index: 10; /* 로드뷰보다 위에 표시 */

  /* 그림자 등으로 좀 더 잘 보이게 꾸미기 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.warning-toast {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  pointer-events: none;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
