<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast.js'

const router = useRouter()
const { toastMsg, toastShow, showToast } = useToast()

const form = reactive({ plate: '', datetime: '', purpose: '' })

function validate() {
  const plateRegex = /^[0-9]{2,3}[가-힣][0-9]{4}$|^[가-힣]{2}[0-9]{2}[가-힣][0-9]{4}$/
  if (!form.plate.trim()) { showToast('차량번호를 입력해 주세요.'); return false }
  if (!form.datetime)      { showToast('방문 일시를 선택해 주세요.'); return false }
  return true
}

async function submit() {
  if (!validate()) return
  // TODO: POST /api/visitor-car  { plate, datetime, purpose }
  showToast(`${form.plate} 등록 완료!`)
  Object.assign(form, { plate: '', datetime: '', purpose: '' })
}
</script>

<template>
  <div class="page-wrap">
    <div class="top-bar">
      <button class="back-btn" @click="router.back()">←</button>
      <span class="top-bar-title">방문차량 등록</span>
    </div>

    <div class="content">
      <div class="card form-card">
        <div class="form-group">
          <label class="form-label">차량번호 *</label>
          <input
            class="form-input"
            v-model="form.plate"
            placeholder="예) 12가 3456"
            maxlength="12"
            inputmode="text"
          />
        </div>

        <div class="form-group">
          <label class="form-label">방문 일시 *</label>
          <input
            class="form-input"
            type="datetime-local"
            v-model="form.datetime"
          />
        </div>

        <div class="form-group">
          <label class="form-label">방문 목적 <span class="optional">(선택)</span></label>
          <input
            class="form-input"
            v-model="form.purpose"
            placeholder="예) 가족 방문, 택배 수령"
            maxlength="30"
          />
        </div>

        <button class="btn btn-primary btn-full" style="margin-top:6px" @click="submit">
          등록 완료
        </button>
      </div>

      <p class="hint-text">
        ※ 방문 차량은 최대 24시간 주차가 허용됩니다.<br/>
        연장이 필요한 경우 관리사무소에 문의해 주세요.
      </p>
    </div>

    <Transition name="toast">
      <div v-if="toastShow" class="toast">{{ toastMsg }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.page-wrap { flex: 1; padding-bottom: 32px; }
.content { padding: 10px 14px 0; display: flex; flex-direction: column; gap: 14px; }

.form-card { padding: 22px 18px; }
.optional  { font-size: 12px; color: #bbb; font-weight: 400; }

.hint-text {
  font-size: 12px; color: #bbb; line-height: 1.7;
  padding: 0 4px;
}

.toast-enter-active { animation: toastIn .25s ease; }
.toast-leave-active { animation: toastOut .3s ease forwards; }
</style>
