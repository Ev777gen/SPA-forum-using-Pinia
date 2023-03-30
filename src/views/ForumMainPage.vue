<template>
  <div v-if="isAsyncDataLoaded">
    <h1 class="title">Добро пожаловать на форум!</h1>
    <CategoryList :categories="categories" />
  </div>
</template>

<script>
import CategoryList from '@/components/forum/CategoryList';
import { mapState, mapActions } from 'pinia';
import { useForumStore } from '@/stores/ForumStore';

export default {
  components: { CategoryList },
  computed: {
    ...mapState(useForumStore, ['categories', 'isAsyncDataLoaded']),
  },
  async created () {
    this.startLoadingIndicator();
    const categories = await this.fetchAllCategories();
    const forumIds = categories.map(category => category.forumIds).flat();
    await this.fetchForums({ ids: forumIds });
    this.stopLoadingIndicator();
  },
  methods: {
    ...mapActions(useForumStore, ['fetchAllCategories', 'fetchForums', 'startLoadingIndicator', 'stopLoadingIndicator'])
  }
}
</script>

<style lang="scss" scoped>
.title {
  margin: 30px 0;
}
</style>