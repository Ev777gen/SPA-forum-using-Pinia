<template>
  <div class="list"
    v-for="category in categories"
    :key="category.id"
  >
    <h2 class="list__title">{{ category.name }}</h2>
    <ForumList :forums="getForumsForCategory(category)" />
  </div>
</template>

<script>
import ForumList from '@/components/forum/ForumList';
import { useForumStore } from '@/stores/ForumStore';
import { mapState } from 'pinia';

export default {
  components: { ForumList },
  props: {
    categories: {
      type: Array,
      required: true
    }
  },
  computed: {
    ...mapState(useForumStore, ['forums']),
  },
  methods: {
    getForumsForCategory (category) {
      return this.forums.filter(forum => forum.categoryId === category.id);
    }
  }
}
</script>