<script setup>
import { useDarkMode } from '../composables/useDarkMode.js'
const { isDark } = useDarkMode()
</script>

<template>
  <main class="settings-page">
    <div class="settings-section">
      <p class="section-title">화면 설정</p>
      <div class="settings-card">
        <div class="settings-row">
          <div class="settings-left">
            <div class="settings-icon-bg">
              <span class="settings-emoji">🌙</span>
            </div>
            <div class="settings-texts">
              <p class="settings-label">다크 모드</p>
              <p class="settings-desc">{{ isDark ? '어두운 테마가 적용되었습니다' : '어두운 테마로 전환합니다' }}</p>
            </div>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="isDark" />
            <span class="slider" />
          </label>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.settings-page {
  padding: 24px 22px 96px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-secondary);
  margin-bottom: 10px;
  letter-spacing: .2px;
  transition: color .3s;
}

.settings-card {
  background: var(--c-panel-bg);
  border: 1px solid var(--c-panel-border);
  border-radius: 18px;
  padding: 6px 20px;
  transition: background .3s, border-color .3s;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.settings-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.settings-icon-bg {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: var(--c-settings-icon-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background .3s;
}

.settings-emoji {
  font-size: 20px;
  line-height: 1;
}

.settings-texts {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.settings-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text-primary);
  transition: color .3s;
}

.settings-desc {
  font-size: 12px;
  color: var(--c-text-secondary);
  transition: color .3s;
}
</style>
