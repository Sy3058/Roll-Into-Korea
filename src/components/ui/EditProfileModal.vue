<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <template #header>
      <h3 class="modal-title">프로필 수정</h3>
    </template>

    <template #body>
      <div class="edit-form">
        <div class="img-edit-area" @click="triggerFileInput">
          <img :src="localInfo.img" class="preview-img" />
          <div class="overlay">📷</div>
          <input type="file" ref="fileInput" hidden accept="image/*" @change="handleFileChange" />
        </div>

        <div class="input-group">
          <label>닉네임</label>
          <input v-model="localInfo.name" type="text" class="text-input" />
        </div>
      </div>
    </template>

    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')">취소</BaseButton>
      <BaseButton variant="primary" @click="handleSave"> 수정하기 </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import BaseButton from '@/components/common/BaseButton.vue';

// 부모로부터 받는 데이터
const props = defineProps<{
  isOpen: boolean;
  initialName: string;
  initialImg: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', payload: { name: string; img: string }): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

// 내부에서 수정할 임시 데이터
const localInfo = reactive({ name: '', img: '' });

// 모달이 열릴 때마다 부모의 데이터로 초기화
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      localInfo.name = props.initialName;
      localInfo.img = props.initialImg;
    }
  },
);

const triggerFileInput = () => fileInput.value?.click();

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files?.[0]) {
    localInfo.img = URL.createObjectURL(target.files[0]);
  }
};

const handleSave = () => {
  // 저장 버튼을 누르면 부모에게 변경된 데이터를 전달
  emit('save', { name: localInfo.name, img: localInfo.img });
};
</script>

<style scoped>
.modal-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #333;
}

.edit-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding-bottom: 10px;
}

.img-edit-area {
  position: relative;
  width: 100px;
  height: 100px;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #eee;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 1.5rem;
}
.img-edit-area:hover .overlay {
  opacity: 1;
}

.input-group {
  width: 100%;
  text-align: left;
  label {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
    color: #555;
    font-size: 0.9rem;
  }
}
.text-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
}
</style>
