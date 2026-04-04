<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useToast } from '../composables/useToast.js'
import CardIcon from '../components/CardIcon.vue'

const { toastMsg, toastShow, showToast } = useToast()

// ── 선택된 섹션 ──────────────────────────────────────────────
const active = ref(null)
function select(key) {
  active.value = active.value === key ? null : key
}

// ── 카드 목록 (flat, 순서 변경 가능) ─────────────────────────────
const cards = reactive([
  { key: 'iot',     title: '우리집 제어', sub: '조명 · 냉방 · 방범' },
  { key: 'booking', title: '시설 예약', sub: '커뮤니티 예약' },
  { key: 'notice',  title: '공지사항',  sub: '아파트 공지' },
  { key: 'car',     title: '방문차량',  sub: '차량 등록' },
  { key: 'fee',     title: '관리비',   sub: '이번달 납부 현황' },
  { key: 'chat',    title: '모두챗',   sub: '입주민 채팅' },
])

// 행별 카드 구성 (computed)
const rows = computed(() => {
  const result = []
  let i = 0
  while (i < cards.length) {
    if (cards[i].full) {
      result.push([cards[i]])
      i++
    } else if (i + 1 < cards.length && !cards[i + 1].full) {
      result.push([cards[i], cards[i + 1]])
      i += 2
    } else {
      result.push([cards[i]])
      i++
    }
  }
  return result
})

function cardIdx(key) { return cards.findIndex(c => c.key === key) }
function rowOf(key)   { return rows.value.find(row => row.some(c => c.key === key)) }
function isRowActive(row) { return row.some(c => c.key === active.value) }

// ── Drag-to-reorder ───────────────────────────────────────────────
const drag = reactive({
  on: false, fromIdx: -1, overIdx: -1,
  ghostLeft: 0, ghostTop: 0, ghostW: 0, ghostH: 0,
  offX: 0, offY: 0, startX: 0, startY: 0,
})
let lpTimer = null
let dragJustEnded = false

const ghostStyle = computed(() => ({
  left:   drag.ghostLeft + 'px',
  top:    drag.ghostTop  + 'px',
  width:  drag.ghostW    + 'px',
  height: drag.ghostH    + 'px',
}))

function onCardPointerDown(e, key) {
  drag.startX = e.clientX
  drag.startY = e.clientY
  const el = e.currentTarget

  lpTimer = setTimeout(() => {
    const rect = el.getBoundingClientRect()
    Object.assign(drag, {
      on: true, fromIdx: cardIdx(key), overIdx: -1,
      ghostLeft: rect.left, ghostTop: rect.top,
      ghostW: rect.width,   ghostH: rect.height,
      offX: e.clientX - rect.left, offY: e.clientY - rect.top,
    })
    active.value = null
    navigator.vibrate?.(30)
  }, 500)
}

function onMainPointerMove(e) {
  if (!drag.on) {
    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 8)
      clearTimeout(lpTimer)
    return
  }
  e.preventDefault()

  drag.ghostLeft = e.clientX - drag.offX
  drag.ghostTop  = e.clientY - drag.offY

  const under  = document.elementFromPoint(e.clientX, e.clientY)
  const cardEl = under?.closest?.('[data-card-key]')
  if (cardEl) {
    const idx = cardIdx(cardEl.dataset.cardKey)
    drag.overIdx = idx !== drag.fromIdx ? idx : -1
  } else {
    drag.overIdx = -1
  }
}

function onMainPointerUp() {
  clearTimeout(lpTimer)
  if (!drag.on) return

  if (drag.overIdx >= 0) {
    const a = drag.fromIdx, b = drag.overIdx
    const tmp = { ...cards[a] }
    cards.splice(a, 1, { ...cards[b] })
    cards.splice(b, 1, tmp)
  }

  drag.on = false
  drag.fromIdx = -1
  drag.overIdx = -1
  dragJustEnded = true
  setTimeout(() => { dragJustEnded = false }, 50)
}

function onCardClick(key) {
  if (dragJustEnded || drag.on) return
  select(key)
}

// ── 1. 홈 IoT ────────────────────────────────────────────────
const iot = reactive([
  { key: 'light',    label: '조명', value: false, onlyOn: false },
  { key: 'ac',       label: '냉방', value: false, onlyOn: false },
  { key: 'security', label: '방범', value: false, onlyOn: true  },
])
function onIotToggle(d) {
  if (d.onlyOn && !d.value) {
    d.value = true
    showToast('방범 모드는 앱에서 해제할 수 없습니다.')
    return
  }
  showToast(`${d.label} ${d.value ? 'ON' : 'OFF'}`)
}

// ── 2. 시설 예약 ─────────────────────────────────────────────
const facilities = reactive([
  { name: '헬스장', expiry: '2026-04-30' },
  { name: '수영장', expiry: '2026-04-08' },
  { name: '골프장', expiry: null },
  { name: 'BBQ장',  expiry: null },
  { name: '독서실', expiry: '2026-04-10' },
])

function hasPass(fac) {
  if (!fac.expiry) return false
  return new Date(fac.expiry) >= new Date(new Date().toDateString())
}

function daysLeft(fac) {
  if (!fac.expiry) return 0
  const diff = new Date(fac.expiry) - new Date(new Date().toDateString())
  return Math.max(0, Math.ceil(diff / 86400000))
}

const expiringFacilities = computed(() =>
  facilities.filter(f => hasPass(f) && daysLeft(f) <= 7)
)

const selFacility = ref('헬스장')
const ticketAlert = ref(null)

function selectFacility(fac) {
  if (!hasPass(fac)) {
    ticketAlert.value = fac.name
    return
  }
  ticketAlert.value = null
  selFacility.value = fac.name
  selSlot.value = null
}

function dismissTicketAlert() {
  ticketAlert.value = null
}
const selDate     = ref(null)
const selSlot     = ref(null)
const slotSeed    = reactive({})
const rawSlots    = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']

// 시설별 휴관 요일 (0=일, 1=월, ..., 6=토)
const facilityClosedDays = {
  '헬스장': [1],
  '수영장': [1, 2],
  '골프장': [0, 1],
  'BBQ장':  [1, 2, 3, 4, 5],
  '독서실': [0],
}

const OFFICE_PHONE = 'tel:021234567'

// 향후 14일 날짜 목록 (시설별 활성 여부 포함)
const DAYS_KO = ['일','월','화','수','목','금','토']
const bookingDays = computed(() => {
  const days = []
  const base = new Date()
  base.setHours(0, 0, 0, 0)
  const closed = facilityClosedDays[selFacility.value] || []
  for (let i = 0; i < 14; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    const dow = d.getDay()
    days.push({
      dateStr,
      day:       d.getDate(),
      dow:       DAYS_KO[dow],
      isSat:     dow === 6,
      isSun:     dow === 0,
      available: !closed.includes(dow),
    })
  }
  return days
})

// 시설 변경 시 → 선택 날짜가 휴관이면 첫 가능일로 이동
watch(selFacility, () => {
  selSlot.value = null
  const closed = facilityClosedDays[selFacility.value] || []
  const cur = selDate.value ? new Date(selDate.value) : null
  if (!cur || closed.includes(cur.getDay())) {
    const first = bookingDays.value.find(d => d.available)
    selDate.value = first ? first.dateStr : null
  }
}, { immediate: true })

function fullSlots(fac, date) {
  const k = `${fac}:${date}`
  if (!slotSeed[k]) slotSeed[k] = rawSlots.filter((_, i) => (i * 7 + fac.length) % 3 === 0)
  return slotSeed[k]
}
const slots = computed(() =>
  rawSlots.map(t => ({ time: t, full: fullSlots(selFacility.value, selDate.value).includes(t) }))
)
function selectDate(day) {
  if (!day.available) return
  selDate.value = day.dateStr
  selSlot.value = null
}
function submitBooking() {
  if (!selSlot.value) { showToast('시간대를 선택해 주세요.'); return }
  showToast(`${selFacility.value} ${selSlot.value} 예약 완료`)
  selSlot.value = null
}

// ── 3. 공지사항 ───────────────────────────────────────────────
const notices = reactive([
  { id:1, tag:'긴급', tc:'urgent', title:'4월 5일(토) 단수 예정 (오전 10~12시)', date:'04.03', body:'노후 배관 교체 공사로 인해 4월 5일(토) 오전 10시~12시 전 세대 단수가 예정되어 있습니다. 미리 물을 받아 두시기 바랍니다.', open:false },
  { id:2, tag:'안내', tc:'info',   title:'2026년 관리비 납부 마감일 안내',       date:'04.01', body:'4월 관리비 납부 마감은 4월 25일(금)입니다. 자동이체·가상계좌·앱 내 납부 가능합니다.', open:false },
  { id:3, tag:'일반', tc:'gen',    title:'엘리베이터 정기 점검 일정 공지',       date:'03.28', body:'4월 10일(목) 오전 9시~11시 엘리베이터 정기 점검이 진행됩니다.', open:false },
  { id:4, tag:'일반', tc:'gen',    title:'재활용 분리수거 요일 변경 안내',       date:'03.20', body:'4월부터 분리수거 요일이 화·목·토로 변경됩니다.', open:false },
])

// ── 4. 관리비 ─────────────────────────────────────────────────
const fee = reactive({
  month: '2026년 4월',
  total: 287500,
  dueDate: '4월 25일(금)',
  paid: false,
  items: [
    { label: '일반관리비', amount: 45000 },
    { label: '청소비',     amount: 32000 },
    { label: '경비비',     amount: 58000 },
    { label: '승강기유지비', amount: 12000 },
    { label: '수선유지비', amount: 28000 },
    { label: '전기료',     amount: 67500 },
    { label: '수도료',     amount: 25000 },
    { label: '난방비',     amount: 20000 },
  ],
})
function formatKRW(n) {
  return n.toLocaleString('ko-KR') + '원'
}

// ── 5. 방문차량 ───────────────────────────────────────────────
const car = reactive({ plate: '', datetime: '', purpose: '' })
function submitCar() {
  if (!car.plate.trim()) { showToast('차량번호를 입력해 주세요.'); return }
  if (!car.datetime)     { showToast('방문 일시를 선택해 주세요.'); return }
  showToast(`${car.plate} 등록 완료`)
  Object.assign(car, { plate: '', datetime: '', purpose: '' })
}

// ── 5. 모두챗 ─────────────────────────────────────────────────
const chatWrap  = ref(null)
const chatInput = ref('')
const messages  = reactive([
  { id:1, me:false, sender:'박이웃 (301호)', text:'혹시 어제 엘리베이터에 우산 두고 가신 분 계세요? 경비실에 맡겨뒀어요 😊', time:'08:42' },
  { id:2, me:false, sender:'김이웃 (502호)', text:'아 저예요! 감사합니다 ㅠㅠ', time:'08:45' },
  { id:3, me:false, sender:'이이웃 (401호)', text:'내일 지하주차장 A구역 도색공사 있다고 하네요. 차 미리 빼두세요~', time:'09:10' },
  { id:4, me:false, sender:'최이웃 (105호)', text:'알려주셔서 감사해요! 몰랐네요', time:'09:12' },
])
let nextMsgId = 4
function getTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
async function sendChat() {
  const txt = chatInput.value.trim()
  if (!txt) return
  messages.push({ id: nextMsgId++, me: true, sender: '나 (502호)', text: txt, time: getTime() })
  chatInput.value = ''
  await nextTick()
  if (chatWrap.value) chatWrap.value.scrollTop = chatWrap.value.scrollHeight
}
</script>

<template>
  <main
    class="home"
    :class="{ 'dragging-mode': drag.on }"
    @pointermove="onMainPointerMove"
    @pointerup="onMainPointerUp"
    @pointercancel="onMainPointerUp"
  >

    <template v-for="(row, ri) in rows" :key="ri">

      <!-- 카드 행 -->
      <div class="card-row">
        <button
          v-for="card in row" :key="card.key"
          class="menu-card"
          :class="{
            active:       active === card.key,
            full:         card.full,
            'is-dragging': drag.on && cardIdx(card.key) === drag.fromIdx,
            'is-over':    drag.on && cardIdx(card.key) === drag.overIdx,
          }"
          :data-card-key="card.key"
          @click="onCardClick(card.key)"
          @pointerdown="onCardPointerDown($event, card.key)"
        >
          <span class="menu-title">{{ card.title }}</span>
          <span class="menu-sub">{{ card.sub }}</span>
          <span class="menu-arrow" :class="{ open: active === card.key }" />
          <CardIcon :name="card.key" class="card-icon" />
        </button>
      </div>

      <!-- 이 행의 카드가 선택됐을 때만 확장 패널 -->
      <Transition name="panel">
        <div v-if="isRowActive(row)" class="content-panel card">

          <!-- IoT -->
          <template v-if="active === 'iot'">
            <p class="panel-title">우리집 제어</p>
            <div v-for="d in iot" :key="d.key" class="toggle-row">
              <div>
                <p class="toggle-label">{{ d.label }}</p>
                <p class="toggle-state" :class="{ on: d.value }">
                  {{ d.value ? 'ON' : 'OFF' }}
                  <span v-if="d.onlyOn && !d.value" class="only-hint">켜기만 가능</span>
                </p>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="d.value" @change="onIotToggle(d)" />
                <span class="slider" />
              </label>
            </div>
          </template>

          <!-- 시설 예약 -->
          <template v-else-if="active === 'booking'">
            <p class="panel-title">커뮤니티시설 예약</p>
            <p class="field-label">시설</p>
            <div class="chip-row">
              <button
                v-for="fac in facilities" :key="fac.name"
                class="chip"
                :class="{
                  active:  selFacility === fac.name && hasPass(fac),
                  locked:  !hasPass(fac),
                }"
                @click="selectFacility(fac)"
              >
                <span v-if="!hasPass(fac)" class="chip-lock">🔒</span>
                {{ fac.name }}
              </button>
            </div>

            <!-- 만료 임박 안내 (선택된 시설만, 입장권 없음 안내가 없을 때만) -->
            <div v-if="!ticketAlert && expiringFacilities.some(f => f.name === selFacility)" class="expiry-warn">
              <div class="expiry-warn-left">
                <span class="expiry-icon">🕐</span>
                <div class="expiry-texts">
                  <span class="expiry-sub">{{ selFacility }} 입장권 만료 예정</span>
                  <span class="expiry-main">{{ daysLeft(facilities.find(f => f.name === selFacility)) }}일 후 만료됩니다</span>
                </div>
              </div>
              <span class="expiry-badge">D-{{ daysLeft(facilities.find(f => f.name === selFacility)) }}</span>
            </div>

            <!-- 입장권 없음 안내 -->
            <Transition name="expand">
              <div v-if="ticketAlert" class="ticket-alert">
                <p class="ticket-alert-title">입장권이 필요해요</p>
                <p class="ticket-alert-desc">{{ ticketAlert }} 이용을 위해 입장권을 구매해 주세요.</p>
                <div class="ticket-alert-actions">
                  <a :href="OFFICE_PHONE" class="btn btn-primary ticket-call-btn">📞 관리사무소 전화</a>
                  <button class="btn btn-outline ticket-close-btn" @click="dismissTicketAlert">닫기</button>
                </div>
              </div>
            </Transition>

            <template v-if="!ticketAlert">
            <p class="field-label" style="margin-top:16px">날짜</p>
            <div class="date-strip">
              <button
                v-for="day in bookingDays" :key="day.dateStr"
                class="date-cell"
                :class="{
                  selected:    selDate === day.dateStr,
                  unavailable: !day.available,
                  sat:         day.isSat,
                  sun:         day.isSun,
                }"
                :disabled="!day.available"
                @click="selectDate(day)"
              >
                <span class="date-dow">{{ day.dow }}</span>
                <span class="date-num">{{ day.day }}</span>
              </button>
            </div>
            <p class="field-label" style="margin-top:16px">시간</p>
            <div class="slot-grid">
              <button
                v-for="s in slots" :key="s.time"
                class="slot-btn" :class="{ full: s.full, selected: selSlot === s.time }"
                @click="!s.full && (selSlot = s.time)"
              >
                {{ s.time }}<br/>
                <span class="slot-avail">{{ s.full ? '마감' : '가능' }}</span>
              </button>
            </div>
            <button class="btn btn-primary btn-full" style="margin-top:16px" @click="submitBooking">예약 신청</button>
            </template>
          </template>

          <!-- 공지사항 -->
          <template v-else-if="active === 'notice'">
            <p class="panel-title">공지사항</p>
            <div v-for="n in notices" :key="n.id" class="notice-item" @click="n.open = !n.open">
              <div class="notice-row">
                <div class="notice-left">
                  <span class="notice-tag" :class="n.tc">{{ n.tag }}</span>
                  <span class="notice-title-text">{{ n.title }}</span>
                </div>
                <span class="notice-date">{{ n.date }}</span>
              </div>
              <Transition name="expand">
                <p v-if="n.open" class="notice-body">{{ n.body }}</p>
              </Transition>
            </div>
          </template>

          <!-- 관리비 -->
          <template v-else-if="active === 'fee'">
            <div class="fee-header">
              <div>
                <p class="panel-title" style="margin-bottom:2px">{{ fee.month }} 관리비</p>
                <p class="fee-due">납부기한 · {{ fee.dueDate }}</p>
              </div>
              <div class="fee-total-wrap">
                <p class="fee-total">{{ formatKRW(fee.total) }}</p>
                <span class="fee-status" :class="{ paid: fee.paid }">{{ fee.paid ? '납부완료' : '미납' }}</span>
              </div>
            </div>
            <div class="fee-divider" />
            <div class="fee-items">
              <div v-for="item in fee.items" :key="item.label" class="fee-row">
                <span class="fee-label">{{ item.label }}</span>
                <span class="fee-amount">{{ formatKRW(item.amount) }}</span>
              </div>
            </div>
            <div class="fee-total-row">
              <span class="fee-total-label">합계</span>
              <span class="fee-total-amount">{{ formatKRW(fee.total) }}</span>
            </div>
            <button class="btn btn-primary btn-full" style="margin-top:16px" @click="showToast('납부 페이지로 이동합니다.')">납부하기</button>
          </template>

          <!-- 방문차량 -->
          <template v-else-if="active === 'car'">
            <p class="panel-title">방문차량 등록</p>
            <div class="form-group">
              <label class="form-label">차량번호</label>
              <input class="form-input" v-model="car.plate" placeholder="예) 12가 3456" maxlength="12" />
            </div>
            <div class="form-group">
              <label class="form-label">방문 일시</label>
              <input class="form-input" type="datetime-local" v-model="car.datetime" />
            </div>
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">방문 목적 <span class="optional">(선택)</span></label>
              <input class="form-input" v-model="car.purpose" placeholder="예) 가족 방문" maxlength="30" />
            </div>
            <button class="btn btn-primary btn-full" style="margin-top:16px" @click="submitCar">등록 완료</button>
          </template>

          <!-- 모두챗 -->
          <template v-else-if="active === 'chat'">
            <p class="panel-title">모두챗</p>
            <div class="chat-wrap" ref="chatWrap">
              <div v-for="m in messages" :key="m.id" class="msg-row" :class="{ me: m.me }">
                <template v-if="!m.me">
                  <div class="avatar">{{ m.sender[0] }}</div>
                  <div>
                    <p class="sender-name">{{ m.sender }}</p>
                    <div class="bubble other">{{ m.text }}</div>
                  </div>
                  <span class="msg-time">{{ m.time }}</span>
                </template>
                <template v-else>
                  <span class="msg-time me-time">{{ m.time }}</span>
                  <div class="bubble me">{{ m.text }}</div>
                </template>
              </div>
            </div>
            <div class="chat-input-row">
              <input class="form-input chat-input" v-model="chatInput" placeholder="메시지를 입력하세요" @keyup.enter="sendChat" />
              <button class="btn btn-primary send-btn" @click="sendChat">전송</button>
            </div>
          </template>

        </div>
      </Transition>

    </template>

  </main>

  <!-- 드래그 고스트 -->
  <Teleport to="body">
    <div v-if="drag.on && drag.fromIdx >= 0" class="drag-ghost" :style="ghostStyle">
      <span class="menu-title">{{ cards[drag.fromIdx].title }}</span>
      <span class="menu-sub">{{ cards[drag.fromIdx].sub }}</span>
      <CardIcon :name="cards[drag.fromIdx].key" class="card-icon" />
    </div>
  </Teleport>

  <Transition name="toast">
    <div v-if="toastShow" class="toast">{{ toastMsg }}</div>
  </Transition>
</template>

<style scoped>
.home {
  padding: 24px 22px 96px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── 카드 행 ── */
.card-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.menu-card {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 18px;
  padding: 20px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 110px;
  position: relative;
  transition: border-color .15s, background .15s, box-shadow .15s;
  box-shadow: 0 4px 12px rgba(100, 120, 200, 0.10);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  touch-action: none;
  user-select: none;
}
.menu-card:hover  { border-color: rgba(180, 195, 255, 0.6); box-shadow: 0 4px 16px rgba(100, 120, 200, 0.14); }
.menu-card:active { transform: scale(.98); }
.menu-card.active {
  background: #26306E;
  border-color: #2A3578;
  box-shadow: 0 4px 16px rgba(26, 31, 74, 0.17);
}
.menu-card.full {
  grid-column: span 2;
  min-height: 80px;
  flex-direction: row;
  align-items: center;
  padding: 20px 24px;
}

/* 드래그 상태 */
.menu-card.is-dragging {
  opacity: 0.3;
  border-style: dashed;
}
.menu-card.is-over {
  border-color: #6B8EFF;
  border-width: 2px;
  background: rgba(230, 235, 255, 0.9);
}
.menu-card.active.is-over {
  background: #2a2680;
  border-color: #8B9FFF;
}

/* ── 카드 아이콘 ── */
.card-icon {
  position: absolute;
  right: 14px;
  top: 14px;
  width: 24px;
  height: 24px;
  color: #d4d4d4;
  pointer-events: none;
  transition: color .15s, opacity .15s;
}
.menu-card.active .card-icon {
  color: rgba(255, 255, 255, 0.25);
}
.menu-card.full .card-icon {
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
}

.menu-title { font-size: 17px; font-weight: 700; color: #1a1a3e; line-height: 1.3; }
.menu-sub   { font-size: 12px; color: #9BA3C0; font-weight: 400; }
.menu-card.active .menu-title { color: #fff; }
.menu-card.active .menu-sub   { color: #D7DDF5; }

.menu-arrow {
  position: absolute; right: 14px; bottom: 14px;
  width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
}
.menu-card.full .menu-arrow { bottom: auto; top: 50%; transform: translateY(-50%); }
.menu-arrow::after {
  content: '';
  display: block;
  width: 7px; height: 7px;
  border-right: 2px solid #C5CADF;
  border-bottom: 2px solid #C5CADF;
  transform: rotate(45deg);
  transition: transform .2s, border-color .15s;
}
.menu-card.active .menu-arrow::after {
  border-color: rgba(255,255,255,.4);
  transform: rotate(-135deg);
}
.menu-card.full.active .menu-arrow::after {
  transform: rotate(-135deg);
}

/* ── 드래그 고스트 ── */
.drag-ghost {
  position: fixed;
  background: rgba(255, 255, 255, 0.92);
  border: 2px solid #6B8EFF;
  border-radius: 20px;
  padding: 20px 16px 16px;
  box-shadow: 0 12px 32px rgba(80, 100, 200, 0.28);
  pointer-events: none;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transform: scale(1.05);
  transform-origin: center center;
  opacity: 0.95;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* ── 콘텐츠 패널 ── */
.content-panel {
  background: rgba(255, 255, 255, 0.88);
  border-radius: 18px;
  padding: 24px 20px;
  box-shadow: 0 4px 16px rgba(100, 120, 200, 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.9);
}
.panel-title {
  font-size: 16px; font-weight: 700; color: #111;
  margin-bottom: 22px;
}

/* ── IoT ── */
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 0; border-bottom: 1px solid #f3f3f3;
}
.toggle-row:last-child { border-bottom: none; }
.toggle-label { font-size: 15px; font-weight: 600; color: #111; }
.toggle-state { font-size: 12px; font-weight: 500; color: #ccc; margin-top: 3px; transition: color .2s; }
.toggle-state.on { color: #111; }
.only-hint { font-size: 11px; color: #e0e0e0; margin-left: 4px; font-weight: 400; }

/* ── Chips ── */
.field-label { font-size: 12px; font-weight: 600; color: #aaa; margin-bottom: 8px; }
.chip-row { display: flex; flex-wrap: wrap; gap: 7px; }
.chip {
  padding: 8px 14px; border-radius: 20px;
  border: 1.5px solid #e4e4e7; background: #fff;
  font-size: 13px; font-weight: 600; color: #555;
  cursor: pointer; font-family: inherit; transition: all .15s;
}
.chip.active { background: #3A4AA3; color: #fff; border-color: #3A4AA3; }
.chip.locked {
  opacity: 0.4;
  cursor: default;
  background: #f5f6f8;
  border-color: #e4e4e7;
  color: #aaa;
}
.chip-lock { margin-right: 3px; font-size: 11px; }

/* ── Expiry warning ── */
.expiry-warn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #EEF2FF;
  border: 1px solid #CFD8FF;
  border-radius: 12px;
  padding: 10px 12px;
  gap: 10px;
}
.expiry-warn-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.expiry-icon { font-size: 14px; }
.expiry-texts {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.expiry-sub {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
}
.expiry-main {
  font-size: 13px;
  font-weight: 700;
  color: #1E3A8A;
}
.expiry-badge {
  font-size: 12px;
  font-weight: 700;
  color: #2F3DB8;
  background: #DDE4FF;
  border-radius: 999px;
  padding: 4px 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Ticket alert ── */
.ticket-alert {
  margin-top: 14px;
  padding: 18px 16px;
  background: #EEF2FF;
  border: 1px solid #CFD8FF;
  border-radius: 14px;
  text-align: center;
}
.ticket-alert-title {
  font-size: 16px;
  font-weight: 700;
  color: #1E3A8A;
  margin-bottom: 6px;
}
.ticket-alert-desc {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 14px;
}
.ticket-alert-actions {
  display: flex;
  gap: 8px;
}
.ticket-call-btn {
  flex: 1;
  text-decoration: none;
  font-size: 14px;
  padding: 12px 0;
}
.ticket-close-btn {
  padding: 12px 16px;
  font-size: 14px;
}

/* ── Date strip ── */
.date-strip {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.date-strip::-webkit-scrollbar { display: none; }

.date-cell {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1.5px solid #E8EBFA;
  background: rgba(255,255,255,0.7);
  cursor: pointer;
  font-family: inherit;
  transition: all .15s;
  min-width: 44px;
}
.date-cell.sat .date-dow { color: #4B7BDB; }
.date-cell.sun .date-dow { color: #E05252; }
.date-cell.unavailable {
  background: rgba(240, 241, 248, 0.5);
  border-color: transparent;
  cursor: not-allowed;
  opacity: 0.4;
}
.date-cell.selected {
  background: #3A4AA3;
  border-color: #3A4AA3;
  box-shadow: 0 3px 10px rgba(47, 61, 184, 0.28);
}
.date-dow {
  font-size: 11px;
  font-weight: 600;
  color: #9BA3C0;
}
.date-num {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a3e;
}
.date-cell.selected .date-dow { color: #D5DCF8; }
.date-cell.selected .date-num { color: #fff; }

/* ── Slot grid ── */
.slot-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-top: 8px;
}
.slot-btn {
  display: flex; flex-direction: column; align-items: center;
  padding: 10px 2px; border-radius: 10px;
  border: 1.5px solid #e4e4e7; background: #fff;
  cursor: pointer; font-size: 12px; font-weight: 600;
  font-family: inherit; color: #111; line-height: 1.4; transition: all .15s;
}
.slot-btn.full     { background: #fafafa; color: #ddd; cursor: not-allowed; border-color: #f0f0f0; }
.slot-btn.selected { background: #3A4AA3; color: #fff; border-color: #3A4AA3; }
.slot-avail { font-size: 10px; font-weight: 500; color: #aaa; }
.slot-btn.full .slot-avail { color: #ddd; }
.slot-btn.selected .slot-avail { color: #D5DCF8; }

/* ── Notices ── */
.notice-item {
  padding: 14px 0; border-bottom: 1px solid #f3f3f3; cursor: pointer;
}
.notice-item:last-child { border-bottom: none; }
.notice-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.notice-left { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.notice-tag {
  display: inline-block; font-size: 10px; font-weight: 700;
  padding: 2px 7px; border-radius: 4px; align-self: flex-start;
}
.notice-tag.urgent { background: #fff0f0; color: #e53e3e; }
.notice-tag.info   { background: #ebf4ff; color: #2b6cb0; }
.notice-tag.gen    { background: #f5f5f5; color: #888; }
.notice-title-text { font-size: 14px; font-weight: 600; color: #111; line-height: 1.4; }
.notice-date { font-size: 11px; color: #ccc; white-space: nowrap; flex-shrink: 0; padding-top: 2px; }
.notice-body {
  margin-top: 10px; font-size: 13px; color: #666; line-height: 1.65;
  padding: 12px 14px; background: #f9f9f9; border-radius: 8px;
}

/* ── 관리비 ── */
.fee-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}
.fee-due { font-size: 12px; color: #9BA3C0; margin-top: 3px; }
.fee-total-wrap { text-align: right; }
.fee-total { font-size: 20px; font-weight: 700; color: #1a1a3e; letter-spacing: -0.5px; }
.fee-status {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: #FEE2E2;
  color: #DC2626;
}
.fee-status.paid { background: #DCFCE7; color: #16A34A; }
.fee-divider { height: 1px; background: #f3f3f3; margin-bottom: 12px; }
.fee-items { display: flex; flex-direction: column; gap: 10px; }
.fee-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.fee-label  { font-size: 14px; color: #555; }
.fee-amount { font-size: 14px; font-weight: 600; color: #1a1a3e; }
.fee-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1.5px solid #e8ebfa;
}
.fee-total-label  { font-size: 14px; font-weight: 700; color: #1a1a3e; }
.fee-total-amount { font-size: 17px; font-weight: 700; color: #3A4AA3; }

/* ── 방문차량 ── */
.optional { font-size: 12px; color: #bbb; font-weight: 400; }

/* ── Chat ── */
.chat-wrap {
  height: 240px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 12px;
  margin-bottom: 12px;
}
.msg-row { display: flex; align-items: flex-end; gap: 8px; }
.msg-row.me { flex-direction: row-reverse; }
.avatar {
  width: 28px; height: 28px; background: #f0f0f0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #666; flex-shrink: 0;
}
.sender-name { font-size: 11px; color: #bbb; margin-bottom: 4px; padding-left: 2px; }
.bubble {
  padding: 10px 13px; border-radius: 14px;
  font-size: 14px; line-height: 1.5; word-break: break-word; max-width: 210px;
}
.bubble.other { background: rgba(230, 234, 255, 0.7); color: #1a1a3e; border-bottom-left-radius: 4px; }
.bubble.me    { background: #3A4AA3; color: #fff; border-bottom-right-radius: 4px; }
.msg-time { font-size: 11px; color: #ccc; flex-shrink: 0; }
.me-time  { align-self: flex-end; }
.chat-input-row { display: flex; gap: 8px; }
.chat-input { flex: 1; }
.send-btn   { padding: 0 18px; font-size: 14px; white-space: nowrap; }

/* ── Transitions ── */
.panel-enter-active { transition: opacity .2s ease, transform .2s ease; }
.panel-leave-active { transition: opacity .15s ease, transform .15s ease; }
.panel-enter-from   { opacity: 0; transform: translateY(-6px); }
.panel-leave-to     { opacity: 0; transform: translateY(-4px); }

.expand-enter-active, .expand-leave-active { transition: opacity .2s, max-height .2s ease; overflow: hidden; max-height: 200px; }
.expand-enter-from, .expand-leave-to       { opacity: 0; max-height: 0; }

.toast-enter-active { animation: toastIn .2s ease; }
.toast-leave-active { animation: toastOut .3s ease forwards; }
</style>
