<template>
  <div class="profile-panel">
    <button class="edit-btn" @click="isModalOpen = true">정보 수정</button>

    <div class="img-wrapper">
      <img :src="profileImg" alt="Profile" class="profile-img" />
    </div>
    <div class="info-text">
      <h2 class="profile-title">{{ nickname }}</h2>
    </div>

    <EditProfileModal
      :is-open="isModalOpen"
      :initial-name="nickname"
      :initial-img="profileImg"
      @close="isModalOpen = false"
      @save="onProfileUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game';
import { usePlayerStore } from '@/stores/player';
import defaultImg from '@/assets/images/profile.png';
import EditProfileModal from '@/components/ui/EditProfileModal.vue';

const gameStore = useGameStore();
const playerStore = usePlayerStore();

const isModalOpen = ref(false);

const profileImg = computed(() => {
  return gameStore.memberInfo?.profileImgUrl || defaultImg;
});

const nickname = computed(() => {
  return playerStore.journeyData?.nickname || '여행자';
});

const onProfileUpdate = (newData: { name: string; img: string }) => {
  // TODO: 실제 API 업데이트 로직 구현 필요
  console.log('Update Profile:', newData);
  isModalOpen.value = false;
};
</script>

<style scoped>
.profile-panel {
  position: relative;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  height: 25%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  text-align: center;
  padding-top: 20px;
  margin-bottom: 5%;
}

.edit-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 0.8rem;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}
.edit-btn:hover {
  background-color: #f9f9f9;
  color: #555;
  border-color: #ccc;
}

.img-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile-img {
  width: 7vw;
  height: 7vw;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.info-text {
  width: 100%;
}
.profile-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #333;
}
</style>
