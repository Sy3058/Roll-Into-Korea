<template>
  <header class="home-header">
    <div class="header-content">
      <div class="logo-container">
        <div class="logo-box">굴려서 한국 속으로</div>
      </div>

      <nav class="nav-links">
        <a href="#hero">ABOUT</a>
        <a href="#about">LOGIN</a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts"></script>

<style scoped>
.home-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  z-index: 1000;
  background-color: transparent;
}

.header-content {
  position: relative;
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 0 40px;

  display: flex;
  align-items: center;
  justify-content: flex-end; /* 메뉴 우측 정렬 */
}

.logo-container {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%); /* 정중앙 배치 */
}

.logo-box {
  font-size: 1.2rem;
  font-weight: 800;
  color: #333;
  background-color: #fff;
  padding: 8px 16px;
  border: 2px solid #333;
}

/* 네비게이션 스타일 */
.nav-links {
  display: flex;
  gap: 30px;
}

.nav-links a {
  color: rgba(10, 10, 10, 0.9);
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.nav-links a:hover {
  opacity: 0.7;
}
</style>
