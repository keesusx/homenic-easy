<script setup>
import { ref } from 'vue'
const hasNotif = ref(true)
</script>

<template>
  <header class="header">
    <div class="header-info">
      <h1 class="header-title">홈닉 Easy</h1>
      <p class="header-location">강남 아파트 1단지 · 101동 502호</p>
    </div>
    <button class="notif-btn" @click="hasNotif = false" aria-label="알림">
      <span class="notif-label">알림</span>
      <span v-if="hasNotif" class="notif-dot" />
    </button>
  </header>
</template>

<style scoped>
.header {
  background: linear-gradient(
    180deg,
    var(--header-bg-start) 0%,
    var(--header-bg-end) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 50px 24px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 0 rgba(160, 175, 230, 0.25),
              0 4px 16px rgba(160, 175, 230, 0.08);
  transition: background .3s;
}
.header-title    { font-size: 30px; font-weight: 700; color: var(--c-text-primary); letter-spacing: -.8px; line-height: 1.02; transition: color .3s; }
.header-location { font-size: 12px; color: var(--c-text-secondary); font-weight: 500; margin-top: 6px; transition: color .3s; }
.notif-btn {
  background: none; border: none; cursor: pointer;
  padding: 4px 6px;
  position: relative;
  display: flex; align-items: center; justify-content: center;
  min-width: 44px; min-height: 44px;
}
.notif-label {
  font-size: 15px; font-weight: 600; color: var(--c-text-primary); transition: color .3s;
}
.notif-dot {
  width: 7px; height: 7px;
  background: #ef4444; border-radius: 50%;
  position: absolute; top: 6px; right: 4px;
  border: 1.5px solid transparent;
}
</style>
