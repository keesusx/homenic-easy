import { ref, watch } from 'vue'

const isDark = ref(localStorage.getItem('darkMode') === '1')

function applyDark(val) {
  document.documentElement.classList.toggle('dark', val)
}

applyDark(isDark.value)

watch(isDark, val => {
  applyDark(val)
  localStorage.setItem('darkMode', val ? '1' : '0')
})

export function useDarkMode() {
  return { isDark }
}
