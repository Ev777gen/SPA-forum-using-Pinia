<template>
  <div v-if="isAsyncDataLoaded" class="forum">
    <div v-if="forum" class="forum__header">
      <div class="forum__details">
        <h1 class="forum__title title">{{ forum.name }}</h1>
        <p class="forum__description">{{ forum.description }}</p>
      </div>
      <router-link
        v-if="authUser"
        :to="{name:'ThreadCreate', params: {forumId: forum.id}}"
        class="forum__button btn_orange btn_small"
      >
        Начать новую тему
      </router-link>
    </div>

    <div class="forum__thread-list">
      <ThreadList :threads="threads"/>
    </div>
    <div v-if="totalPagesCount > 1" class="pagination">
      <v-pagination
        v-model="page"
        :pages="totalPagesCount"
        active-color="#DCEDFF"
      />
    </div>
  </div>
</template>

<script>
import ThreadList from '@/components/forum/ThreadList';
import { findItemById } from '@/helpers';
import { mapActions, mapGetters } from 'vuex';

export default {
  components: { ThreadList },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      page: parseInt(this.$route.query.page) || 1,
      threadsPerPage: 10
    }
  },
  computed: {
    ...mapGetters(['authUser']),
    forum () {
      return findItemById(this.$store.state.forums, this.id);
    },
    threads () {
      if (!this.forum) return [];
      return this.$store.state.threads
        .filter(thread => thread.forumId === this.forum.id)
        .map(thread => this.$store.getters.thread(thread.id));
    },
    threadsCount () {
      return this.forum.threadIds?.length || 0;
    },
    isAsyncDataLoaded() {
      return this.$store.state.isLoaded;
    },
    totalPagesCount () {
      if (!this.threadsCount) return 0;
      return Math.ceil(this.threadsCount / this.threadsPerPage);
    }
  },
  watch: {
    async page (page) {
      this.$router.push({ query: { page } });
    }
  },
  async created () {
    this.startLoadingIndicator();
    const forum = await this.fetchForum({ id: this.id });
    const threads = await this.fetchThreadsByPage({ ids: forum.threadIds, page: this.page, threadsPerPage: this.threadsPerPage });
    await this.fetchUsers({ ids: threads.map(thread => thread.userId) });
    this.stopLoadingIndicator();
  },
  methods: {
    ...mapActions(['fetchForum', 'fetchThreads', 'fetchThreadsByPage', 'fetchUsers', 'startLoadingIndicator', 'stopLoadingIndicator']),
  }
}
</script>

<style lang="scss" scoped>
.forum {

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 30px;
  }

  &__details {
    flex-basis: 50%;
  }

  &__description {
    margin: 10px 0 15px 0;
    font-size: 16px;
  }

  &__button {
    align-self: flex-start;
    margin-left: 15px;
    text-align: center;
  }

  @media (max-width: 720px) {
    &__details {
      flex-basis: 100%;
    }
    &__button {
      padding: 5px;
    }
  }
}
.pagination {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}
</style>