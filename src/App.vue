<script setup>
import { ref } from 'vue'
import AppHeader    from './components/AppHeader.vue'
import HomeView     from './views/HomeView.vue'
import SettingsView from './views/SettingsView.vue'

const activeNav = ref('home')

const navItems = [
  { key: 'home',    label: '홈' },
  { key: 'settings', label: '설정' },
]
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <HomeView     v-if="activeNav === 'home'" />
    <SettingsView v-else-if="activeNav === 'settings'" />
  </div>

  <nav class="bottom-nav">
    <button
      v-for="item in navItems"
      :key="item.key"
      class="nav-item"
      :class="{ active: activeNav === item.key }"
      @click="activeNav = item.key"
    >
      <!-- 홈 -->
      <svg v-if="item.key === 'home'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <!-- 설정 -->
      <svg v-else-if="item.key === 'settings'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
      <span>{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  height: 80px;
  display: flex;
  align-items: flex-start;
  padding-top: 12px;
  background: linear-gradient(
    180deg,
    var(--header-bg-start, rgba(238,243,255,0.72)) 0%,
    var(--header-bg-end,   rgba(227,234,252,0.95)) 100%
  );
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 100;
  transition: background .3s;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: var(--c-text-secondary, #A5AECC);
  padding: 0;
  transition: color .15s;
}

.nav-item svg {
  width: 22px;
  height: 22px;
}

.nav-item span {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: -.1px;
}

.nav-item.active {
  color: #3B5BDB;
}
</style>
