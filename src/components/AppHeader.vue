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
  background: transparent;
  padding: 18px 20px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}
.header-title    { font-size: 20px; font-weight: 800; color: #111; letter-spacing: -.3px; line-height: 1.2; }
.header-location { font-size: 12px; color: #aaa; font-weight: 500; margin-top: 3px; }
.notif-btn {
  background: none; border: none; cursor: pointer;
  color: #111; padding: 4px 6px;
  position: relative;
  display: flex; align-items: center; justify-content: center;
  min-width: 44px; min-height: 44px;
}
.notif-label {
  font-size: 15px; font-weight: 600; color: #111;
}
.notif-dot {
  width: 7px; height: 7px;
  background: #ef4444; border-radius: 50%;
  position: absolute; top: 6px; right: 4px;
  border: 1.5px solid #fff;
}
</style>
