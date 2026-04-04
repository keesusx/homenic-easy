<script setup>
defineProps({ name: { type: String, required: true } })
</script>

<template>
  <svg viewBox="0 0 52 52" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">

    <!-- 홈 IoT: 전구 -->
    <template v-if="name === 'iot'">
      <path d="M26 9C19 9 13.5 14.5 13.5 21.5c0 4.5 2.3 8.5 5.8 10.9V36h13.4v-3.6c3.5-2.4 5.8-6.4 5.8-10.9C38.5 14.5 33 9 26 9z"
        stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M19 40h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M21 44h10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M26 14v4M20 16.5l2 2M32 16.5l-2 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </template>

    <!-- 시설 예약: 캘린더 -->
    <template v-else-if="name === 'booking'">
      <rect x="7" y="12" width="38" height="32" rx="4" stroke="currentColor" stroke-width="2.2"/>
      <path d="M7 22h38" stroke="currentColor" stroke-width="2.2"/>
      <path d="M17 7v10M35 7v10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M19 32l5 5 10-10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    </template>

    <!-- 공지사항: 확성기 -->
    <template v-else-if="name === 'notice'">
      <path d="M9 20h7l16-9v26L16 28H9a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3z"
        stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M16 28v10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M36 15.5s5 2.5 5 10.5-5 10.5-5 10.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M36 20s3 1.5 3 6-3 6-3 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </template>

    <!-- 방문차량: 자동차 -->
    <template v-else-if="name === 'car'">
      <path d="M11 26l6-12h18l6 12" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
      <rect x="6" y="26" width="40" height="12" rx="3.5" stroke="currentColor" stroke-width="2.2"/>
      <circle cx="16" cy="38" r="5" stroke="currentColor" stroke-width="2.2"/>
      <circle cx="36" cy="38" r="5" stroke="currentColor" stroke-width="2.2"/>
      <path d="M21 38h10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M14 26h24" stroke="currentColor" stroke-width="1.8"/>
    </template>

    <!-- 관리비: 지갑/영수증 -->
    <template v-else-if="name === 'fee'">
      <rect x="6" y="14" width="40" height="28" rx="4" stroke="currentColor" stroke-width="2.2"/>
      <path d="M6 22h40" stroke="currentColor" stroke-width="2.2"/>
      <path d="M14 31h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M14 36h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="36" cy="31" r="4" stroke="currentColor" stroke-width="2"/>
    </template>

    <!-- 모두챗: 말풍선 두 개 -->
    <template v-else-if="name === 'chat'">
      <path d="M5 10h25a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H15l-7 5v-5H5a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z"
        stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M34 17h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v4l-5-4h-6a3 3 0 0 1-3-3v-2"
        stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
      <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
      <circle cx="18" cy="16" r="1.5" fill="currentColor"/>
      <circle cx="24" cy="16" r="1.5" fill="currentColor"/>
    </template>

  </svg>
</template>
