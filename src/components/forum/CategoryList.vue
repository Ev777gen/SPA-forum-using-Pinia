<template>
  <div class="list"
    v-for="category in categories"
    :key="category.id"
  >
    <h2 class="list__title">{{ category.name }}</h2>
    <ForumList :forums="getForumsForCategory(category)" />
  </div>
</template>

<script setup>
import ForumList from '@/components/forum/ForumList';
import { storeToRefs } from 'pinia';
import { useForumStore } from '@/stores/ForumStore';

const props = defineProps({
  categories: {
    type: Array,
    required: true
  }
});

const { forums } = storeToRefs(useForumStore());

function getForumsForCategory (category) {
  return forums.value.filter(forum => forum.categoryId === category.id);
}
</script>