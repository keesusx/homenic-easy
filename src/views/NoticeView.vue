<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const notices = ref([
  {
    id: 1, tag: '긴급', tagClass: 'tag-urgent',
    title: '4월 5일(토) 단수 예정 안내 (오전 10시~12시)',
    date: '2026.04.03',
    body: '노후 배관 교체 공사로 인해 4월 5일(토) 오전 10시부터 12시까지 전 세대 단수가 예정되어 있습니다. 미리 물을 받아 두시기 바랍니다.',
    open: false,
  },
  {
    id: 2, tag: '안내', tagClass: 'tag-info',
    title: '2026년 관리비 납부 마감일 안내',
    date: '2026.04.01',
    body: '4월 관리비 납부 마감일은 4월 25일(금)입니다. 납부 방법: 자동이체, 가상계좌, 앱 내 납부 가능합니다.',
    open: false,
  },
  {
    id: 3, tag: '일반', tagClass: 'tag-gen',
    title: '엘리베이터 정기 점검 일정 공지',
    date: '2026.03.28',
    body: '4월 10일(목) 오전 9시~11시 사이 엘리베이터 정기 점검이 진행됩니다. 이용에 불편을 드려 죄송합니다.',
    open: false,
  },
  {
    id: 4, tag: '일반', tagClass: 'tag-gen',
    title: '재활용 분리수거 요일 변경 안내',
    date: '2026.03.20',
    body: '4월부터 분리수거 요일이 화·목·토로 변경됩니다. 기존 월·수·금에서 변경되오니 참고 바랍니다.',
    open: false,
  },
  {
    id: 5, tag: '안내', tagClass: 'tag-info',
    title: '지하 주차장 CCTV 교체 완료 안내',
    date: '2026.03.15',
    body: '지하 주차장 전 구역 CCTV 교체 공사가 완료되었습니다. 총 32대로 사각지대가 해소되었습니다.',
    open: false,
  },
])

function toggle(notice) {
  notice.open = !notice.open
}
</script>

<template>
  <div class="page-wrap">
    <div class="top-bar">
      <button class="back-btn" @click="router.back()">←</button>
      <span class="top-bar-title">공지사항</span>
    </div>

    <div class="content">
      <div
        v-for="n in notices" :key="n.id"
        class="notice-card card"
        @click="toggle(n)"
      >
        <div class="notice-header">
          <div class="notice-meta">
            <span class="tag" :class="n.tagClass">{{ n.tag }}</span>
            <span class="notice-date">{{ n.date }}</span>
          </div>
          <div class="notice-title">{{ n.title }}</div>
        </div>
        <Transition name="expand">
          <div v-if="n.open" class="notice-body">
            {{ n.body }}
          </div>
        </Transition>
        <div class="chevron" :class="{ flipped: n.open }">›</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrap { flex: 1; padding-bottom: 32px; }
.content { padding: 10px 14px 0; display: flex; flex-direction: column; gap: 10px; }

.notice-card {
  padding: 18px 16px 14px;
  cursor: pointer;
  position: relative;
  transition: box-shadow .15s;
}
.notice-card:active { box-shadow: 0 1px 4px rgba(0,0,0,.1); }

.notice-header { padding-right: 24px; }
.notice-meta {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 7px;
}
.tag {
  font-size: 10px; font-weight: 700;
  padding: 3px 8px; border-radius: 6px;
}
.tag-urgent { background: #fee2e2; color: #dc2626; }
.tag-info   { background: #dbeafe; color: #1d4ed8; }
.tag-gen    { background: #f3f4f6; color: #666; }

.notice-date  { font-size: 12px; color: #aaa; }
.notice-title { font-size: 15px; font-weight: 700; color: #1a1a2e; line-height: 1.4; }

.notice-body {
  font-size: 14px; color: #555;
  line-height: 1.65;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.chevron {
  position: absolute;
  right: 16px; top: 18px;
  font-size: 22px; color: #ccc;
  transform: rotate(90deg);
  transition: transform .2s;
  line-height: 1;
}
.chevron.flipped { transform: rotate(-90deg); }

/* expand transition */
.expand-enter-active, .expand-leave-active { transition: opacity .2s, max-height .25s ease; max-height: 300px; overflow: hidden; }
.expand-enter-from, .expand-leave-to       { opacity: 0; max-height: 0; }
</style>
