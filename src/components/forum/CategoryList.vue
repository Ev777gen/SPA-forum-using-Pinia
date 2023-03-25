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
export default {
  components: { ForumList },
  props: {
    categories: {
      type: Array,
      required: true
    }
  },
  methods: {
    getForumsForCategory (category) {
      return this.$store.state.forums.filter(forum => forum.categoryId === category.id);
    }
  }
}
</script>