import { ref, watch } from 'vue';

const isDarkMode = ref(getIsDarkModeBooleanFromLocalStorage() || false);

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
}

watch(isDarkMode, (newValue) => {
  if (newValue === true) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  localStorage.setItem('isDarkMode', !!isDarkMode.value);
});

// Если сразу влючен темный режим, то добавляем body класс 'dark-mode'
if (isDarkMode.value === true && !document.body.classList.contains('dark-mode')) {
  document.body.classList.add('dark-mode');
}

// Читаем строку из LocalStorage и преобразуем ее в boolean
function getIsDarkModeBooleanFromLocalStorage() {
  let isDarkModeBoolean;
  const isDarkModeString = localStorage.getItem('isDarkMode');
  if (isDarkModeString === 'true') {
    isDarkModeBoolean = true;
  } else if (isDarkModeString === 'false') {
    isDarkModeBoolean = false;
  }
  return isDarkModeBoolean;
}

export default function useDarkMode() {
  return { isDarkMode, toggleDarkMode }
}
