<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast.js'

const router = useRouter()
const { toastMsg, toastShow, showToast } = useToast()

const facilities = ['헬스장', '수영장', '골프장', 'BBQ장', '독서실']
const selectedFacility = ref('헬스장')

const today = new Date().toISOString().slice(0, 10)
const selectedDate = ref(today)

const rawSlots = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00',
]

// 시설+날짜 조합마다 마감 슬롯을 랜덤 고정 (mock)
const fullSlotSeed = reactive({})
function getFullSlots(facility, date) {
  const key = `${facility}:${date}`
  if (!fullSlotSeed[key]) {
    fullSlotSeed[key] = rawSlots.filter((_, i) => (i * 7 + facility.length) % 3 === 0)
  }
  return fullSlotSeed[key]
}
const slots = computed(() =>
  rawSlots.map(t => ({
    time: t,
    full: getFullSlots(selectedFacility.value, selectedDate.value).includes(t),
  }))
)

const selectedSlot = ref(null)

function selectSlot(slot) {
  if (!slot.full) selectedSlot.value = slot.time
}

async function submitBooking() {
  if (!selectedSlot.value) { showToast('시간대를 선택해 주세요.'); return }
  // TODO: POST /api/booking
  showToast(`${selectedFacility.value} ${selectedSlot.value} 예약 완료!`)
  selectedSlot.value = null
}
</script>

<template>
  <div class="page-wrap">
    <div class="top-bar">
      <button class="back-btn" @click="router.back()">←</button>
      <span class="top-bar-title">커뮤니티시설 예약</span>
    </div>

    <div class="content">
      <!-- 시설 선택 -->
      <div class="card section">
        <div class="section-title">시설 선택</div>
        <div class="facility-tabs">
          <button
            v-for="f in facilities" :key="f"
            class="tab-btn"
            :class="{ active: selectedFacility === f }"
            @click="selectedFacility = f; selectedSlot = null"
          >{{ f }}</button>
        </div>
      </div>

      <!-- 날짜 선택 -->
      <div class="card section">
        <div class="section-title">날짜 선택</div>
        <input
          class="form-input"
          type="date"
          v-model="selectedDate"
          :min="today"
          @change="selectedSlot = null"
        />
      </div>

      <!-- 시간 슬롯 -->
      <div class="card section">
        <div class="section-title">시간 선택</div>
        <div class="slot-grid">
          <button
            v-for="s in slots" :key="s.time"
            class="slot-btn"
            :class="{ full: s.full, selected: selectedSlot === s.time }"
            @click="selectSlot(s)"
          >
            <span class="slot-time">{{ s.time }}</span>
            <span class="slot-avail">{{ s.full ? '마감' : '가능' }}</span>
          </button>
        </div>
      </div>

      <!-- 예약 신청 -->
      <button class="btn btn-green btn-full" @click="submitBooking">
        예약 신청
      </button>
    </div>

    <Transition name="toast">
      <div v-if="toastShow" class="toast">{{ toastMsg }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.page-wrap { flex: 1; padding-bottom: 32px; }
.content { padding: 10px 14px 0; display: flex; flex-direction: column; gap: 12px; }
.section { padding: 18px 16px; }

.facility-tabs {
  display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;
}
.tab-btn {
  padding: 9px 16px;
  border-radius: 20px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  font-size: 14px; font-weight: 600;
  color: #555; cursor: pointer;
  transition: all .15s;
  font-family: inherit;
}
.tab-btn.active { background: #1a56db; color: #fff; border-color: #1a56db; }

.slot-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 4px;
}
.slot-btn {
  display: flex; flex-direction: column; align-items: center;
  padding: 11px 4px;
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  transition: all .15s;
  font-family: inherit;
  gap: 3px;
}
.slot-btn:hover:not(.full) { border-color: #1a56db; }
.slot-btn.full { background: #f9fafb; cursor: not-allowed; }
.slot-btn.selected { background: #1a56db; border-color: #1a56db; }

.slot-time {
  font-size: 14px; font-weight: 700;
  color: #1a1a2e;
}
.slot-avail {
  font-size: 11px; font-weight: 500;
  color: #16a34a;
}
.slot-btn.full .slot-time  { color: #ccc; }
.slot-btn.full .slot-avail { color: #ccc; }
.slot-btn.selected .slot-time,
.slot-btn.selected .slot-avail { color: #fff; }

.toast-enter-active { animation: toastIn .25s ease; }
.toast-leave-active { animation: toastOut .3s ease forwards; }
</style>
