<template>
  <div class="home-view-wrapper">
    <HomeHeader />
    <HomeMain />
    <HomeFooter />
  </div>
</template>

<script setup lang="ts">
import HomeHeader from '@/components/home/HomeHeader.vue';
import HomeMain from '@/components/home/HomeMain.vue';
import HomeFooter from '@/components/home/HomeFooter.vue';
</script>

<style scoped>
.home-view-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #f8f4e8;
}
</style>
