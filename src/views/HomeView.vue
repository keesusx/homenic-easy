<script setup>
import { ref, reactive, computed } from 'vue'
import { useToast } from '../composables/useToast.js'

const { toastMsg, toastShow, showToast } = useToast()

// ── 활성 섹션 ─────────────────────────────────────────
const active = ref(null)

function toggle(key) {
  active.value = active.value === key ? null : key
}

// ── 글자 크기 ─────────────────────────────────────────
const fontScale = ref(1)
const SCALE_MIN = 0.85
const SCALE_MAX = 1.35
const SCALE_STEP = 0.1

function changeFontSize(delta) {
  const next = Math.round((fontScale.value + delta) * 100) / 100
  fontScale.value = Math.max(SCALE_MIN, Math.min(SCALE_MAX, next))
}

const fontSizeLabel = computed(() => {
  if (fontScale.value <= 0.9) return '작게'
  if (fontScale.value >= 1.25) return '아주 크게'
  if (fontScale.value >= 1.1) return '크게'
  return '보통'
})

// ── IoT 기기 ──────────────────────────────────────────
const iotDevices = reactive([
  { key: 'living-light', label: '거실 조명', value: true,  confirmOff: false },
  { key: 'bed-light',    label: '안방 조명', value: false, confirmOff: false },
  { key: 'boiler',       label: '보일러',    value: true,  confirmOff: true },
  { key: 'gas',          label: '가스 차단', value: false, confirmOff: false },
])

function iotStatus(d) {
  const on = d.value
  if (d.key.includes('light')) return on ? '현재 조명이 켜져 있습니다' : '현재 조명이 꺼져 있습니다'
  if (d.key === 'boiler')      return on ? '현재 보일러가 켜져 있습니다' : '현재 보일러가 꺼져 있습니다'
  if (d.key === 'gas')         return on ? '현재 가스가 차단되어 있습니다' : '현재 가스가 열려 있습니다'
  return ''
}

const iotSummary = computed(() => {
  const names = iotDevices.map(d => d.label)
  return `${names[0]}, ${names[1]} 외 ${names.length - 2}개`
})

// ── 팝업 ──────────────────────────────────────────────
const popup = ref(null)

function toggleIot(device) {
  if (device.value && device.confirmOff) {
    popup.value = {
      type: 'boiler-off',
      device,
      title: '보일러를 끄시겠습니까?',
      body: '보일러를 끄면 난방이 중지됩니다.\n계속하시겠습니까?',
      confirmLabel: '끄기',
    }
    return
  }
  device.value = !device.value
  showToast(`${device.label} ${device.value ? 'ON' : 'OFF'}`)
}

function confirmPopup() {
  if (!popup.value) return
  if (popup.value.type === 'boiler-off') {
    popup.value.device.value = false
    showToast('보일러가 꺼졌습니다')
  } else if (popup.value.type === 'car-delete') {
    const idx = recentCars.findIndex(c => c.id === popup.value.car.id)
    if (idx >= 0) recentCars.splice(idx, 1)
    showToast('차량이 삭제되었습니다')
  }
  popup.value = null
}

function cancelPopup() {
  popup.value = null
}

// ── 방문차량 ──────────────────────────────────────────
const carDateOptions = computed(() => {
  const today = new Date()
  const fmt = (d) => `${d.getMonth() + 1}.${d.getDate()}`
  const d1 = new Date(today); d1.setDate(today.getDate() + 1)
  const d2 = new Date(today); d2.setDate(today.getDate() + 2)
  return [
    { key: 'today',    label: '오늘',  sub: fmt(today) },
    { key: 'tomorrow', label: '내일',  sub: fmt(d1) },
    { key: 'dayAfter', label: '모레',  sub: fmt(d2) },
  ]
})
const carDate  = ref('today')
const carPlate = ref('')

const recentCars = reactive([
  { id: 1, plate: '12가 3456', date: '5.20 (오늘)' },
  { id: 2, plate: '34나 7890', date: '5.18 (토)' },
])
let nextCarId = 3

function submitCar() {
  if (!carPlate.value.trim()) {
    showToast('차량 번호를 입력해 주세요')
    return
  }
  const opt = carDateOptions.value.find(o => o.key === carDate.value)
  recentCars.unshift({
    id: nextCarId++,
    plate: carPlate.value.trim(),
    date: `${opt.sub} (${opt.label})`,
  })
  showToast(`${carPlate.value.trim()} 등록 완료`)
  carPlate.value = ''
}

function deleteCar(car) {
  popup.value = {
    type: 'car-delete',
    car,
    title: '차량을 삭제하시겠습니까?',
    body: '등록된 방문 차량 정보가\n삭제됩니다.',
    confirmLabel: '삭제',
  }
}

// ── 공지사항 ──────────────────────────────────────────
const notices = reactive([
  { id: 1, title: '분리수거 요일이 바뀌어요', sub: '6월부터 화/금 저녁 6시까지' },
  { id: 2, title: '4월 5일(토) 단수 예정', sub: '오전 10시~12시 전 세대 단수' },
  { id: 3, title: '관리비 납부 마감 안내', sub: '4월 25일(금)까지 납부해 주세요' },
])
const noticeIdx = ref(0)

function prevNotice() {
  noticeIdx.value = noticeIdx.value > 0 ? noticeIdx.value - 1 : notices.length - 1
}
function nextNotice() {
  noticeIdx.value = noticeIdx.value < notices.length - 1 ? noticeIdx.value + 1 : 0
}

// ── 시설 예약 ─────────────────────────────────────────
const facilities = ['헬스장', '수영장', '골프장', 'BBQ장', '독서실']
const selFacility  = ref('헬스장')
const bookingDate  = ref('today')
const bookingSlot  = ref(null)
const timeSlots    = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00']
const closedSlots  = ['12:00','15:00']

function submitBooking() {
  if (!bookingSlot.value) {
    showToast('시간대를 선택해 주세요')
    return
  }
  showToast(`${selFacility.value} ${bookingSlot.value} 예약 완료`)
  bookingSlot.value = null
}

// ── 이벤트 배너 ───────────────────────────────────────
const events = reactive([
  { id: 1, title: '관리비 납부하고\n스타벅스 쿠폰 받아가세요!', sub: '4월 이벤트' },
  { id: 2, title: '헬스장 이용권 봄맞이\n특별 할인 중!', sub: '시설 이벤트' },
  { id: 3, title: '입주민 사진 공모전\n참여하세요!', sub: '봄 이벤트' },
  { id: 4, title: '주차장 도색공사 안내', sub: '시설 공지' },
  { id: 5, title: '커뮤니티 라운지 오픈!', sub: '신규 시설' },
])
const eventIdx = ref(0)

function prevEvent() {
  if (eventIdx.value > 0) eventIdx.value--
}
function nextEvent() {
  if (eventIdx.value < events.length - 1) eventIdx.value++
}
</script>

<template>
  <main class="home" :style="{ '--font-scale': fontScale }">

    <!-- ━━━ 공지 섹션 ━━━ -->
    <section class="section">
      <span class="section-label">공지</span>
      <div class="notice-card">
        <button class="notice-nav-btn" @click="prevNotice" aria-label="이전 공지">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2L4 6l4 4" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="notice-content">
          <p class="notice-title">{{ notices[noticeIdx].title }}</p>
          <p class="notice-sub">{{ notices[noticeIdx].sub }}</p>
        </div>
        <button class="notice-nav-btn" @click="nextNotice" aria-label="다음 공지">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4 2l4 4-4 4" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </section>

    <!-- ━━━ 간편모드 섹션 ━━━ -->
    <section class="section">
      <span class="section-label">간편모드</span>

      <!-- ── 집 리모컨 ── -->
      <div class="feature-card" :class="{ expanded: active === 'iot' }">
        <div class="card-top">
          <div class="icon-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div class="card-info">
            <h3 class="card-title">집 리모컨</h3>
            <p class="card-desc">{{ iotSummary }}</p>
          </div>
        </div>

        <!-- 사용하기 버튼 (접힌 상태) -->
        <div v-if="active !== 'iot'" class="card-action">
          <button class="action-btn use" @click="toggle('iot')">사용하기</button>
        </div>

        <!-- IoT 확장 패널 -->
        <div v-if="active === 'iot'" class="card-body">
          <div class="inner-panel">
            <div
              v-for="(d, di) in iotDevices"
              :key="d.key"
              class="iot-row"
              :class="{ 'no-border': di === iotDevices.length - 1 }"
            >
              <div class="iot-info">
                <span class="iot-label">{{ d.label }}</span>
                <span class="iot-status">{{ iotStatus(d) }}</span>
              </div>
              <button
                class="iot-toggle"
                :class="d.value ? 'on' : 'off'"
                @click="toggleIot(d)"
              >
                {{ d.value ? '끄키' : '켜키' }}
              </button>
            </div>
          </div>

          <!-- 되돌아가기 버튼 (확장 하단) -->
          <button class="action-btn back full" @click="toggle('iot')">되돌아가기</button>
        </div>
      </div>

      <!-- ── 방문 차량 ── -->
      <div class="feature-card" :class="{ expanded: active === 'car' }">
        <div class="card-top">
          <div class="icon-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.4A2 2 0 0 0 13.7 6H10a2 2 0 0 0-1.6.8L5.9 10l-2.4 1.1C2.7 11.7 2 12.5 2 13.4V16c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <circle cx="17" cy="17" r="2"/>
            </svg>
          </div>
          <div class="card-info">
            <h3 class="card-title">방문 차량</h3>
            <p class="card-desc">방문 차량을 등록하세요</p>
          </div>
        </div>

        <!-- 사용하기 버튼 (접힌 상태) -->
        <div v-if="active !== 'car'" class="card-action">
          <button class="action-btn use" @click="toggle('car')">사용하기</button>
        </div>

        <!-- 차량등록 확장 패널 -->
        <div v-if="active === 'car'" class="card-body">
          <div class="inner-panel">
            <!-- 방문 날짜 -->
            <div class="field-group">
              <label class="field-label">방문 날짜</label>
              <div class="date-chips">
                <button
                  v-for="opt in carDateOptions"
                  :key="opt.key"
                  class="date-chip"
                  :class="{ active: carDate === opt.key }"
                  @click="carDate = opt.key"
                >
                  <span class="date-chip-main">{{ opt.label }}</span>
                  <span class="date-chip-sub">{{ opt.sub }}</span>
                </button>
              </div>
            </div>

            <!-- 차량 번호 -->
            <div class="field-group">
              <label class="field-label">차량 번호</label>
              <input
                class="form-input"
                v-model="carPlate"
                placeholder="차량 번호를 입력해 주세요"
                maxlength="12"
              />
            </div>

            <button class="btn btn-primary btn-full submit-btn" @click="submitCar">
              등록하기
            </button>

            <!-- 최근 등록 차량 -->
            <div v-if="recentCars.length" class="recent-section">
              <span class="recent-label">최근 등록 차량</span>
              <div
                v-for="car in recentCars"
                :key="car.id"
                class="recent-car"
              >
                <div class="recent-car-info">
                  <span class="recent-car-plate">{{ car.plate }}</span>
                  <span class="recent-car-date">{{ car.date }}</span>
                </div>
                <button class="recent-car-del" @click="deleteCar(car)" aria-label="삭제">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 되돌아가기 버튼 (확장 하단) -->
          <button class="action-btn back full" @click="toggle('car')">되돌아가기</button>
        </div>
      </div>

      <!-- ── 시설 예약 ── -->
      <div class="feature-card" :class="{ expanded: active === 'booking' }">
        <div class="card-top">
          <div class="icon-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="card-info">
            <h3 class="card-title">시설 예약</h3>
            <p class="card-desc">헬스장 · 게스트룸 · 독서실</p>
          </div>
        </div>

        <!-- 사용하기 버튼 (접힌 상태) -->
        <div v-if="active !== 'booking'" class="card-action">
          <button class="action-btn use" @click="toggle('booking')">사용하기</button>
        </div>

        <!-- 시설예약 확장 패널 -->
        <div v-if="active === 'booking'" class="card-body">
          <div class="inner-panel">
            <!-- 시설 선택 -->
            <div class="field-group">
              <label class="field-label">시설 선택</label>
              <div class="facility-chips">
                <button
                  v-for="f in facilities"
                  :key="f"
                  class="facility-chip"
                  :class="{ active: selFacility === f }"
                  @click="selFacility = f"
                >
                  {{ f }}
                </button>
              </div>
            </div>

            <!-- 날짜 선택 -->
            <div class="field-group">
              <label class="field-label">날짜</label>
              <div class="date-chips">
                <button
                  v-for="opt in carDateOptions"
                  :key="opt.key"
                  class="date-chip"
                  :class="{ active: bookingDate === opt.key }"
                  @click="bookingDate = opt.key"
                >
                  <span class="date-chip-main">{{ opt.label }}</span>
                  <span class="date-chip-sub">{{ opt.sub }}</span>
                </button>
              </div>
            </div>

            <!-- 시간 선택 -->
            <div class="field-group">
              <label class="field-label">시간</label>
              <div class="slot-grid">
                <button
                  v-for="t in timeSlots"
                  :key="t"
                  class="slot-btn"
                  :class="{
                    selected: bookingSlot === t,
                    closed: closedSlots.includes(t),
                  }"
                  :disabled="closedSlots.includes(t)"
                  @click="bookingSlot = t"
                >
                  {{ t }}
                  <span class="slot-status">{{ closedSlots.includes(t) ? '마감' : '가능' }}</span>
                </button>
              </div>
            </div>

            <button class="btn btn-primary btn-full submit-btn" @click="submitBooking">
              예약 신청
            </button>
          </div>

          <!-- 되돌아가기 버튼 (확장 하단) -->
          <button class="action-btn back full" @click="toggle('booking')">되돌아가기</button>
        </div>
      </div>
    </section>

    <!-- ━━━ 이벤트 섹션 ━━━ -->
    <section class="section">
      <span class="section-label">이벤트</span>
      <div class="event-card">
        <p class="event-title">{{ events[eventIdx].title }}</p>
        <button class="event-detail-btn">자세히보기</button>
      </div>
      <div class="event-nav">
        <button class="event-nav-side" @click="prevEvent" :disabled="eventIdx <= 0">
          <span class="event-nav-label">이전</span>
          <span class="event-nav-circle">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6l4 4" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
        <span class="event-nav-page">{{ eventIdx + 1 }}/{{ events.length }}</span>
        <button class="event-nav-side" @click="nextEvent" :disabled="eventIdx >= events.length - 1">
          <span class="event-nav-circle">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 2l4 4-4 4" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="event-nav-label">다음</span>
        </button>
      </div>
    </section>

    <!-- ━━━ 글자 크기 섹션 ━━━ -->
    <section class="section font-section">
      <span class="section-label">글자 크기</span>
      <div class="font-control">
        <button
          class="font-btn"
          :disabled="fontScale <= SCALE_MIN"
          @click="changeFontSize(-SCALE_STEP)"
        >
          A<span class="font-btn-arrow">-</span>
        </button>
        <span class="font-current">{{ fontSizeLabel }}</span>
        <button
          class="font-btn"
          :disabled="fontScale >= SCALE_MAX"
          @click="changeFontSize(SCALE_STEP)"
        >
          A<span class="font-btn-arrow">+</span>
        </button>
      </div>
    </section>

    <div style="height: 40px" />
  </main>

  <!-- ━━━ 확인 팝업 ━━━ -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="popup" class="popup-overlay" @click.self="cancelPopup">
        <div class="popup-card">
          <h3 class="popup-title">{{ popup.title }}</h3>
          <p class="popup-body">{{ popup.body }}</p>
          <div class="popup-actions">
            <button class="popup-btn cancel" @click="cancelPopup">아니요</button>
            <button class="popup-btn confirm" @click="confirmPopup">{{ popup.confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 토스트 -->
  <Transition name="toast">
    <div v-if="toastShow" class="toast">{{ toastMsg }}</div>
  </Transition>
</template>

<style scoped>
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   레이아웃
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.home {
  padding: 12px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.section-label {
  font-family: var(--font-heading);
  font-size: calc(18px * var(--font-scale));
  font-weight: 600;
  color: #666;
  letter-spacing: -0.9px;
  padding-left: 4px;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   공지 카드
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.notice-card {
  background: var(--c-notice-green);
  border-radius: var(--card-radius);
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--card-shadow);
}
.notice-nav-btn {
  width: 32px;
  height: 32px;
  min-width: 32px;
  background: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform .1s;
}
.notice-nav-btn:active { transform: scale(.9); }

.notice-content {
  flex: 1;
  text-align: center;
  min-width: 0;
}
.notice-title {
  font-family: var(--font-heading);
  font-size: calc(22px * var(--font-scale));
  font-weight: 800;
  color: #fff;
  letter-spacing: -1.2px;
  line-height: 1.1;
}
.notice-sub {
  font-family: var(--font-body);
  font-size: calc(16px * var(--font-scale));
  font-weight: 500;
  color: #fff;
  letter-spacing: -0.8px;
  margin-top: 8px;
  line-height: 1.2;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   기능 카드 (공통)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.feature-card {
  background: var(--c-card-bg);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition: background .3s ease;
}
.feature-card.expanded {
  background: var(--c-card-expanded);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
}

.icon-circle {
  width: 60px;
  height: 60px;
  min-width: 60px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.card-info {
  flex: 1;
  min-width: 0;
}
.card-title {
  font-family: var(--font-heading);
  font-size: calc(24px * var(--font-scale));
  font-weight: 800;
  color: #111;
  letter-spacing: -1px;
  line-height: 1.2;
}
.card-desc {
  font-family: var(--font-body);
  font-size: calc(16px * var(--font-scale));
  font-weight: 500;
  color: #666;
  letter-spacing: -0.5px;
  margin-top: 3px;
}

/* ── 카드 하단 액션 영역 ── */
.card-action {
  padding: 0 16px 18px;
}

/* ── 사용하기 / 되돌아가기 버튼 ── */
.action-btn {
  font-family: var(--font-heading);
  font-weight: 800;
  border: none;
  border-radius: var(--btn-radius);
  cursor: pointer;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  transition: transform .1s;
  width: 100%;
  text-align: center;
}
.action-btn:active { transform: scale(.97); }

.action-btn.use {
  background: var(--c-btn-primary);
  color: var(--c-btn-primary-text);
  font-size: calc(22px * var(--font-scale));
  padding: 16px;
}
.action-btn.back {
  background: var(--c-btn-primary);
  color: var(--c-btn-primary-text);
  font-size: calc(22px * var(--font-scale));
  padding: 16px;
}
.action-btn.back.full {
  margin-top: 12px;
}

/* ── 확장 패널 본문 ── */
.card-body {
  padding: 0 16px 18px;
  animation: slideDown .25s ease;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.inner-panel {
  background: #fff;
  border-radius: var(--panel-radius);
  padding: 24px 20px;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   IoT 패널
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.iot-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--c-divider);
}
.iot-row.no-border { border-bottom: none; }

.iot-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.iot-label {
  font-family: var(--font-heading);
  font-size: calc(22px * var(--font-scale));
  font-weight: 800;
  color: #111;
  letter-spacing: -1.2px;
}
.iot-status {
  font-family: var(--font-body);
  font-size: calc(16px * var(--font-scale));
  font-weight: 500;
  color: #666;
  letter-spacing: -0.8px;
}

.iot-toggle {
  width: 75px;
  border: none;
  border-radius: var(--btn-radius);
  padding: 12px 0;
  font-family: var(--font-heading);
  font-size: calc(18px * var(--font-scale));
  font-weight: 800;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform .1s;
}
.iot-toggle:active { transform: scale(.95); }
.iot-toggle.on {
  background: var(--c-btn-primary);
  color: var(--c-btn-primary-text);
}
.iot-toggle.off {
  background: var(--c-btn-secondary);
  color: var(--c-btn-secondary-text);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   방문차량 패널
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.field-group {
  margin-bottom: 20px;
}
.field-label {
  font-family: var(--font-heading);
  font-size: calc(16px * var(--font-scale));
  font-weight: 700;
  color: #444;
  letter-spacing: -0.5px;
  margin-bottom: 10px;
  display: block;
}

.date-chips {
  display: flex;
  gap: 8px;
}
.date-chip {
  flex: 1;
  background: #F5F5F5;
  border: 2px solid transparent;
  border-radius: var(--panel-radius);
  padding: 12px 8px;
  cursor: pointer;
  text-align: center;
  font-family: var(--font-heading);
  -webkit-tap-highlight-color: transparent;
  transition: all .15s;
}
.date-chip.active {
  background: #111;
  border-color: #111;
}
.date-chip-main {
  display: block;
  font-size: calc(20px * var(--font-scale));
  font-weight: 800;
  color: #111;
  letter-spacing: -0.5px;
}
.date-chip.active .date-chip-main { color: #fff; }
.date-chip-sub {
  display: block;
  font-size: calc(14px * var(--font-scale));
  font-weight: 500;
  color: #999;
  margin-top: 2px;
}
.date-chip.active .date-chip-sub { color: rgba(255,255,255,0.7); }

.submit-btn {
  font-size: calc(22px * var(--font-scale));
  padding: 18px;
  margin-top: 4px;
}

/* 최근 등록 차량 */
.recent-section {
  margin-top: 24px;
  border-top: 1px solid var(--c-divider);
  padding-top: 18px;
}
.recent-label {
  font-family: var(--font-heading);
  font-size: calc(16px * var(--font-scale));
  font-weight: 700;
  color: #888;
  letter-spacing: -0.5px;
  display: block;
  margin-bottom: 12px;
}
.recent-car {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #F3F3F3;
}
.recent-car:last-child { border-bottom: none; }

.recent-car-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.recent-car-plate {
  font-family: var(--font-heading);
  font-size: calc(20px * var(--font-scale));
  font-weight: 800;
  color: #111;
  letter-spacing: -0.8px;
}
.recent-car-date {
  font-family: var(--font-body);
  font-size: calc(14px * var(--font-scale));
  font-weight: 500;
  color: #999;
}
.recent-car-del {
  background: none;
  border: none;
  cursor: pointer;
  color: #bbb;
  padding: 8px;
  border-radius: 8px;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}
.recent-car-del:hover { color: #888; }

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   시설 예약 패널
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.facility-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.facility-chip {
  background: #F5F5F5;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
  font-family: var(--font-heading);
  font-size: calc(16px * var(--font-scale));
  font-weight: 700;
  color: #555;
  -webkit-tap-highlight-color: transparent;
  transition: all .15s;
}
.facility-chip.active {
  background: #111;
  color: #fff;
  border-color: #111;
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.slot-btn {
  background: #F5F5F5;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 10px 4px;
  cursor: pointer;
  font-family: var(--font-heading);
  font-size: calc(16px * var(--font-scale));
  font-weight: 700;
  color: #333;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
  transition: all .15s;
}
.slot-btn.selected {
  background: #111;
  color: #fff;
  border-color: #111;
}
.slot-btn.closed {
  opacity: 0.4;
  cursor: not-allowed;
}
.slot-status {
  display: block;
  font-size: calc(12px * var(--font-scale));
  font-weight: 500;
  color: #999;
  margin-top: 2px;
}
.slot-btn.selected .slot-status { color: rgba(255,255,255,0.7); }
.slot-btn.closed .slot-status { color: #c00; }

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   이벤트 카드
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.event-card {
  background: var(--c-event-orange);
  border-radius: var(--card-radius);
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  box-shadow: var(--card-shadow);
}
.event-title {
  font-family: var(--font-heading);
  font-size: calc(22px * var(--font-scale));
  font-weight: 800;
  color: #fff;
  letter-spacing: -1px;
  line-height: 1.35;
  white-space: pre-line;
  text-align: center;
}
.event-detail-btn {
  width: 100%;
  max-width: 318px;
  background: #8535DB;
  color: #fff;
  border: none;
  border-radius: var(--btn-radius);
  padding: 20px;
  font-family: var(--font-heading);
  font-size: calc(22px * var(--font-scale));
  font-weight: 800;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform .1s;
}
.event-detail-btn:active { transform: scale(.97); }

/* ── 이벤트 네비게이션 ── */
.event-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 8px 0 0;
}
.event-nav-side {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  padding: 4px;
}
.event-nav-side:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.event-nav-label {
  font-family: var(--font-body);
  font-size: calc(18px * var(--font-scale));
  font-weight: 500;
  color: #666;
}
.event-nav-circle {
  width: 32px;
  height: 32px;
  background: #EDEDED;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.event-nav-page {
  font-family: var(--font-body);
  font-size: calc(20px * var(--font-scale));
  font-weight: 500;
  color: #333;
  min-width: 40px;
  text-align: center;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   글자 크기
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.font-section {
  margin-bottom: 0;
}
.font-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: var(--c-card-bg);
  border-radius: var(--card-radius);
  padding: 18px 24px;
  box-shadow: var(--card-shadow);
}
.font-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid #ddd;
  background: #fff;
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 800;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  transition: all .15s;
}
.font-btn:active { transform: scale(.93); }
.font-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.font-btn-arrow {
  font-size: 16px;
  margin-left: 1px;
}
.font-current {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: #666;
  min-width: 70px;
  text-align: center;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   확인 팝업
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}
.popup-card {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 320px;
  overflow: hidden;
  animation: popupIn .2s ease;
}
@keyframes popupIn {
  from { opacity: 0; transform: scale(.92); }
  to   { opacity: 1; transform: scale(1); }
}

.popup-title {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 800;
  color: #111;
  text-align: center;
  padding: 32px 24px 8px;
  letter-spacing: -0.8px;
}
.popup-body {
  font-family: var(--font-body);
  font-size: 17px;
  font-weight: 500;
  color: #666;
  text-align: center;
  padding: 4px 24px 28px;
  line-height: 1.45;
  white-space: pre-line;
}

.popup-actions {
  display: flex;
  border-top: 1px solid #eee;
}
.popup-btn {
  flex: 1;
  height: 56px;
  border: none;
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 800;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: filter .1s;
}
.popup-btn:active { filter: brightness(0.9); }
.popup-btn.cancel {
  background: #DDDDDD;
  color: #555;
  border-radius: 0 0 0 16px;
}
.popup-btn.confirm {
  background: #111;
  color: #fff;
  border-radius: 0 0 16px 0;
}
</style>
