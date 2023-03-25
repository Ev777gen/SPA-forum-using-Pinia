<template>
  <div v-if="isAsyncDataLoaded" >
    <h1 class="title">
      Редактирование темы <i>{{ thread.title }}</i>
    </h1>

    <ThreadEditor
      :title="thread.title"
      :text="text"
      @save="save"
      @cancel="cancel"
      @dirty="formIsDirty = true"
      @clean="formIsDirty = false"
    />
  </div>
</template>

<script>
import ThreadEditor from '@/components/forum/ThreadEditor';
import { findItemById } from '@/helpers';
import { mapActions } from 'vuex';

export default {
  components: { ThreadEditor },
  props: {
    id: { type: String, required: true }
  },
  data () {
    return {
      formIsDirty: false
    }
  },
  computed: {
    thread () {
      return findItemById(this.$store.state.threads, this.id);
    },
    text () {
      const post = findItemById(this.$store.state.posts, this.thread?.postIds[0]);
      return post ? post.text : '';
    },
    isAsyncDataLoaded() {
      return this.$store.state.isLoaded;
    },
  },
  async created () {
    this.startLoadingIndicator();
    const thread = await this.fetchThread({ id: this.id });
    await this.fetchPost({ id: thread.postIds[0] });
    this.stopLoadingIndicator();
  },
  methods: {
    ...mapActions(['fetchThread', 'updateThread', 'fetchPost', 'startLoadingIndicator', 'stopLoadingIndicator']),
    async save ({ title, text }) {
      const thread = await this.updateThread({
        id: this.id,
        title,
        text
      });
      this.$router.push({ name: 'ThreadView', params: { id: thread.id } });
    },
    cancel () {
      this.$router.push({ name: 'ThreadView', params: { id: this.id } });
    }
  },
  beforeRouteLeave () {
    if (this.formIsDirty) {
      const confirmed = window.confirm('Вы уверены, что хотите покинуть страницу? Все несохраненные изменения будут потеряны.');
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