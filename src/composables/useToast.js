import { ref } from 'vue'

export function useToast() {
  const toastMsg  = ref('')
  const toastShow = ref(false)
  let timer = null

  function showToast(msg) {
    toastMsg.value  = msg
    toastShow.value = false
    clearTimeout(timer)
    requestAnimationFrame(() => {
      toastShow.value = true
      timer = setTimeout(() => { toastShow.value = false }, 2400)
    })
  }

  return { toastMsg, toastShow, showToast }
}
