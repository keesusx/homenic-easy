<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast.js'

const router = useRouter()
const { toastMsg, toastShow, showToast } = useToast()

const devices = reactive([
  { key: 'light',    label: '조명',   icon: '💡', value: false, onlyOn: false },
  { key: 'ac',       label: '냉방',   icon: '❄️', value: false, onlyOn: false },
  { key: 'security', label: '방범',   icon: '🔒', value: false, onlyOn: true  },
])

function onToggle(device) {
  if (device.onlyOn && !device.value) {
    // 방범은 끄기 시도 시 되돌림
    device.value = true
    showToast('방범 모드는 해제할 수 없습니다.')
    return
  }
  const state = device.value ? 'ON' : 'OFF'
  showToast(`${device.label} ${state} 되었습니다.`)
  // TODO: API PATCH /api/iot/${device.key}  { state }
}
</script>

<template>
  <div class="page-wrap">
    <!-- top bar -->
    <div class="top-bar">
      <button class="back-btn" @click="router.back()">←</button>
      <span class="top-bar-title">홈 IoT</span>
    </div>

    <div class="content">
      <div class="device-card card" v-for="d in devices" :key="d.key">
        <div class="device-info">
          <span class="device-icon">{{ d.icon }}</span>
          <div>
            <div class="device-name">{{ d.label }}</div>
            <div class="device-status" :class="d.value ? 'on' : 'off'">
              {{ d.value ? 'ON' : 'OFF' }}
              <span v-if="d.onlyOn && !d.value" class="hint">· 켜기만 가능</span>
            </div>
          </div>
        </div>
        <label class="switch">
          <input
            type="checkbox"
            v-model="d.value"
            @change="onToggle(d)"
          />
          <span class="slider" :class="{ red: d.onlyOn }" />
        </label>
      </div>

      <p class="notice-text">
        ※ 방범 모드는 보안상 앱에서 해제할 수 없습니다.<br/>
        해제가 필요하면 관리사무소에 문의하세요.
      </p>
    </div>

    <Transition name="toast">
      <div v-if="toastShow" class="toast">{{ toastMsg }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.page-wrap {
  flex: 1;
  padding-bottom: 32px;
}
.content {
  padding: 10px 14px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.device-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 20px;
}
.device-info {
  display: flex;
  align-items: center;
  gap: 16px;
}
.device-icon { font-size: 34px; line-height: 1; }
.device-name { font-size: 18px; font-weight: 700; color: #1a1a2e; }
.device-status {
  font-size: 13px; font-weight: 600;
  margin-top: 3px;
}
.device-status.on  { color: #1a56db; }
.device-status.off { color: #aaa; }
.hint { font-size: 11px; font-weight: 400; color: #ccc; }

.notice-text {
  font-size: 12px;
  color: #bbb;
  line-height: 1.7;
  padding: 0 4px;
  margin-top: 4px;
}

/* toast transition */
.toast-enter-active { animation: toastIn .25s ease; }
.toast-leave-active { animation: toastOut .3s ease forwards; }
</style>
