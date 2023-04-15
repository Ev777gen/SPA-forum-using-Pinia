<template>
  <div class="sidebar">
    <nav class="sidebar__nav" :style="isDarkMode ? { backgroundColor: '#777' } : null">
      <router-link 
        :to="{name: 'HomeView'}" class="sidebar__link" 
        :style="isDarkMode ? { color: '#fff', 'border-bottom': '1px solid #333' } : null"
      >
        На главную
      </router-link>
      <router-link 
        :to="{name: 'ForumMainPage'}" class="sidebar__link"
        :style="isDarkMode ? { color: '#fff', 'border-bottom': '1px solid #333' } : null"
      >
        Форум
      </router-link>
      <router-link 
        :to="{name: 'AboutMe'}" class="sidebar__link"
        :style="isDarkMode ? { color: '#fff' } : null"
      >
        Обо мне
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import useDarkMode from '@/composables/useDarkMode';
const { isDarkMode } = useDarkMode();
</script>

<style lang="scss" scoped>
.sidebar {
  
  &__nav {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    border-radius: 5px;
    background-color: #fff;
  }

  &__link {
    padding: 10px 20px;
    width: 100%;
    font-size: 20px;
    border-bottom: 1px solid #eee;
    color: #555;
    &:hover {
      color: #222;
      /*background-color: #eee;*/
      background-color: #bbb;
      &:first-child {
        border-top-right-radius: 5px;
        border-top-left-radius: 5px;
      }
      &:last-child {
        border-bottom-right-radius: 5px;
        border-bottom-left-radius: 5px;
      }
    }
    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
