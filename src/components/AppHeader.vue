<script setup>
import { ref } from 'vue'
const hasNotif = ref(true)
</script>

<template>
  <header class="header">
    <div class="header-info">
      <h1 class="header-title">강남 아파트 1단지</h1>
      <p class="header-location">101동 502호</p>
    </div>
    <button class="notif-btn" @click="hasNotif = false" aria-label="알림">
      <span class="notif-text">알림</span>
      <span v-if="hasNotif" class="notif-badge">
        <span class="notif-count">1</span>
      </span>
    </button>
  </header>
</template>

<style scoped>
.header {
  background: #fff;
  padding: 56px 24px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 800;
  color: #111;
  letter-spacing: -1px;
  line-height: 1.2;
}

.header-location {
  font-family: var(--font-body);
  font-size: 16px;
  color: #666;
  font-weight: 500;
  margin-top: 4px;
  letter-spacing: -0.5px;
}

.notif-btn {
  background: var(--c-icon-bg, #EDEDED);
  border: none;
  cursor: pointer;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #111;
  -webkit-tap-highlight-color: transparent;
}

.notif-text {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: #111;
  letter-spacing: -1px;
  line-height: 1;
}

.notif-badge {
  width: 20px;
  height: 20px;
  background: var(--c-badge-red, #BA1A1A);
  border-radius: 50%;
  position: absolute;
  top: -4px;
  right: -6px;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-count {
  font-family: 'Noto Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.6px;
}
</style>
