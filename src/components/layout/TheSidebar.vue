<template>
  <div class="sidebar">
    <nav class="sidebar__nav">
      <router-link :to="{name: 'HomeView'}" class="sidebar__link">На главную</router-link>
      <router-link :to="{name: 'ForumMainPage'}" class="sidebar__link">Форум</router-link>
      <router-link :to="{name: 'AboutMe'}" class="sidebar__link">Обо мне</router-link>
    </nav>
  </div>
</template>

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
      background-color: #eee;
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
