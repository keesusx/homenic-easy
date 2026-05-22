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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span v-if="hasNotif" class="notif-badge" />
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

.notif-badge {
  width: 10px;
  height: 10px;
  background: var(--c-badge-red, #BA1A1A);
  border-radius: 50%;
  position: absolute;
  top: 8px;
  right: 8px;
  border: 2px solid #fff;
}
</style>
