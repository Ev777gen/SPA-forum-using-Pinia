import { ref } from 'vue';

const isDarkMode = ref(false);

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  //document.body.classList.toggle('dark');
  if (document.body.classList.contains('dark-mode')) {
    document.body.classList.remove('dark-mode');
  } else {
    document.body.classList.add('dark-mode');
  }
}

export default function useDarkMode() {
  return { isDarkMode, toggleDarkMode }
}
