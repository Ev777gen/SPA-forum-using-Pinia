<template>
  <div v-if="isAsyncDataLoaded">
    <h1 class="title">Добро пожаловать на форум!</h1>
    <CategoryList :categories="categories" />
  </div>
</template>

<script setup>
import CategoryList from '@/components/forum/CategoryList';
import { storeToRefs } from 'pinia';
import { useForumStore } from '@/stores/ForumStore';

const { categories, isAsyncDataLoaded } = storeToRefs(useForumStore());
const { 
  fetchAllCategories, 
  fetchForums, 
  startLoadingIndicator, 
  stopLoadingIndicator 
} = useForumStore();

fetchAsyncData();

async function fetchAsyncData() {
  startLoadingIndicator();
  const categoriesToDisplay = await fetchAllCategories();
  const forumIds = categoriesToDisplay.map(category => category.forumIds).flat();
  await fetchForums({ ids: forumIds });
  stopLoadingIndicator();
}
</script>

<style lang="scss" scoped>
.title {
  margin: 30px 0;
}
</style>