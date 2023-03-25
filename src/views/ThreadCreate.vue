<template>
  <div v-if="isAsyncDataLoaded">
    <h1 class="title">
      Создать новую тему в форуме <i>{{ forum.name }}</i>
    </h1>

    <ThreadEditor @save="save" @cancel="cancel" @dirty="formIsDirty = true" @clean="formIsDirty = false"/>
  </div>
</template>
<script>
import ThreadEditor from '@/components/forum/ThreadEditor';
import { findItemById } from '@/helpers';
import { mapActions } from 'vuex';
export default {
  components: { ThreadEditor },
  props: {
    forumId: { 
      type: String, 
      required: true 
    }
  },
  data () {
    return {
      formIsDirty: false
    }
  },
  computed: {
    forum () {
      return findItemById(this.$store.state.forums, this.forumId);
    },
    isAsyncDataLoaded() {
      return this.$store.state.isLoaded;
    },
  },
  async created () {
    this.startLoadingIndicator();
    await this.fetchForum({ id: this.forumId });
    this.stopLoadingIndicator();
  },
  methods: {
    ...mapActions(['fetchForum', 'createThread', 'startLoadingIndicator', 'stopLoadingIndicator']),
    async save ({ title, text }) {
      const thread = await this.createThread({
        title,
        text,
        forumId: this.forum.id
      });
      this.$router.push({ name: 'ThreadView', params: { id: thread.id } });
    },
    cancel () {
      this.$router.push({ name: 'ForumView', params: { id: this.forum.id } });
    }
  },
  beforeRouteLeave () {
    if (this.formIsDirty) {
      const confirmed = window.confirm('Вы уверены, что хотите покунуть страницу? Все несохраненные изменения будут потеряны.');
      if (!confirmed) return false;
    }
  }
}
</script>

<style scoped>
.title {
  margin: 35px 0;
}
</style>