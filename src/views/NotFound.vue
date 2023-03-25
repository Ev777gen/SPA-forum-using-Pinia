<template>
  <div class="not-found">
    <h1 class="not-found__title title">Страница не найдена</h1>
    <span>Вернуться на </span>
    <router-link to="/">главную</router-link>.
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  font-size: 16px;
  
  &__title {
    margin: 35px 0;
  }
}
</style>