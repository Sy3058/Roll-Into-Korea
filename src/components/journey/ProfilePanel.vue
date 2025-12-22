<template>
  <div class="profile-panel">
    <button class="edit-btn" @click="isModalOpen = true">정보 수정</button>

    <div class="img-wrapper">
      <img :src="profileInfo.img" alt="Profile" class="profile-img" />
    </div>
    <div class="info-text">
      <h2 class="profile-title">{{ profileInfo.name }}</h2>
    </div>

    <EditProfileModal
      :is-open="isModalOpen"
      :initial-name="profileInfo.name"
      :initial-img="profileInfo.img"
      @close="isModalOpen = false"
      @save="onProfileUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import defaultImg from '@/assets/images/profile.png';
import EditProfileModal from '@/components/ui/EditProfileModal.vue';

const isModalOpen = ref(false);

const profileInfo = reactive({
  name: '사용자이름',
  img: defaultImg,
});

/**
 * 변경된 정보로 프로필 업데이트
 * @param newData
 */
const onProfileUpdate = (newData: { name: string; img: string }) => {
  profileInfo.name = newData.name;
  profileInfo.img = newData.img;

  // TODO: API 호출 (axios.post...)

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
