<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const chatWrap = ref(null)
const inputText = ref('')

const messages = reactive([
  { id: 1, sender: '관리사무소',      text: '안녕하세요! 무엇이든 문의해 주세요 😊',   time: '09:00', me: false },
  { id: 2, sender: '김이웃 (203호)', text: '내일 BBQ장 사용 가능한가요?',            time: '09:05', me: false },
  { id: 3, sender: '관리사무소',      text: '네, 오후 2시 이후 예약 가능합니다.',      time: '09:06', me: false },
  { id: 4, sender: '이주민 (405호)', text: '주차장 405 구역 차 빼주세요 🙏',         time: '09:20', me: false },
])

let nextId = 5

function getTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

async function send() {
  const txt = inputText.value.trim()
  if (!txt) return
  messages.push({ id: nextId++, sender: '나 (502호)', text: txt, time: getTime(), me: true })
  inputText.value = ''
  await nextTick()
  scrollBottom()
  // TODO: WebSocket / POST /api/chat
}

function scrollBottom() {
  if (chatWrap.value) chatWrap.value.scrollTop = chatWrap.value.scrollHeight
}

onMounted(scrollBottom)
</script>

<template>
  <div class="page-wrap">
    <div class="top-bar">
      <button class="back-btn" @click="router.back()">←</button>
      <span class="top-bar-title">모두챗</span>
      <span class="online-badge">● 온라인</span>
    </div>

    <div class="chat-wrap" ref="chatWrap">
      <div
        v-for="m in messages" :key="m.id"
        class="msg-row"
        :class="{ me: m.me }"
      >
        <template v-if="!m.me">
          <div class="avatar">{{ m.sender[0] }}</div>
          <div class="bubble-wrap">
            <div class="sender-name">{{ m.sender }}</div>
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

    <div class="input-bar">
      <input
        class="chat-input"
        v-model="inputText"
        placeholder="메시지를 입력하세요"
        @keyup.enter="send"
        maxlength="200"
      />
      <button class="send-btn" @click="send">전송</button>
    </div>
  </div>
</template>

<style scoped>
.page-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100dvh - 62px); /* header height */
}

.top-bar { flex-shrink: 0; }
.online-badge {
  margin-left: auto;
  font-size: 12px; font-weight: 600;
  color: #16a34a;
  margin-right: 4px;
}

.chat-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px 8px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.msg-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.msg-row.me { flex-direction: row-reverse; }

.avatar {
  width: 34px; height: 34px;
  background: #e0e7ff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: #1a56db;
  flex-shrink: 0;
}

.bubble-wrap { display: flex; flex-direction: column; max-width: 68%; }
.sender-name { font-size: 11px; color: #aaa; font-weight: 600; margin-bottom: 4px; padding-left: 2px; }

.bubble {
  padding: 11px 14px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
}
.bubble.other {
  background: #f3f4f6; color: #1a1a2e;
  border-bottom-left-radius: 4px;
}
.bubble.me {
  background: #1a56db; color: #fff;
  border-bottom-right-radius: 4px;
  max-width: 68%;
}

.msg-time {
  font-size: 11px; color: #ccc;
  flex-shrink: 0;
  margin-bottom: 2px;
}
.me-time { align-self: flex-end; }

/* Input bar */
.input-bar {
  display: flex;
  gap: 8px;
  padding: 10px 14px 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.chat-input {
  flex: 1;
  padding: 13px 15px;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  font-size: 15px;
  outline: none;
  font-family: inherit;
  transition: border-color .2s;
}
.chat-input:focus { border-color: #1a56db; }
.send-btn {
  padding: 0 20px;
  background: #1a56db; color: #fff;
  border: none; border-radius: 14px;
  font-size: 15px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: filter .15s;
}
.send-btn:hover { filter: brightness(1.1); }
</style>
