<template>
  <div v-if="isAsyncDataLoaded" class="thread">
    <h1 class="thread__title title">
      <p>{{ thread.title }}</p>
      <router-link
        v-if="thread.userId === authUser?.id"
        :to="{ name: 'ThreadEdit', id: this.id }"
      >
        <button class="thread__button btn_small btn_green">Редактировать тему</button>
      </router-link>
    </h1>
    <p class="thread__info text_gray">
      <span class="thread__info_user desktop-only">
        Тема начата пользователем 
        <router-link :to="{name: 'ProfileOfAnyUser', params: {userId: thread.author?.id}}">{{thread.author?.name}}</router-link>, 
        {{ localeDate(thread.publishedAt) }}
      </span>
      <span v-if="thread.repliesCount" class="thread__replies">
        {{ thread.repliesCount }}
        {{ repliesCountWording(thread.repliesCount) }}
        от {{ thread.contributorsCount - 1 <= 1 ? 1 : thread.contributorsCount - 1 }}
        {{ thread.contributorsCount - 1 <= 1 ? 'пользователя' : 'пользователей' }}
      </span>
      <span v-else class="thread__replies">Нет ответов</span>
    </p>

    <PostList :posts="threadPosts" />

    <PostEditor v-if="authUser" @save="addPost" />
    <div v-else class="thread__no-auth-user">
      Чтобы написать пост, нужно 
      <router-link :to="{name: 'SignIn', query:{redirectTo: $route.path}}">Войти</router-link> 
      или 
      <router-link :to="{name: 'RegisterForm',  query:{redirectTo: $route.path}}">Зарегистрироваться</router-link>
    </div>
  </div>
</template>

<script>
import PostList from '@/components/forum/PostList';
import PostEditor from '@/components/forum/PostEditor';
import { mapActions, mapGetters } from 'vuex';
import { localeDate, repliesCountWording } from '@/helpers';

export default {
  name: 'ThreadView',
  components: { PostList, PostEditor },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapGetters(['authUser']),
    threads() {
      return this.$store.state.threads;
    },
    posts() {
      return this.$store.state.posts;
    },
    thread() {
      return this.$store.getters.thread(this.id);
    },
    threadPosts() {
      return this.posts.filter(post => post.threadId === this.id);
    },
    isAsyncDataLoaded() {
      return this.$store.state.isLoaded;
    },
  },
  async created () {
    this.startLoadingIndicator();
    const thread = await this.fetchThread({ id: this.id });
    await this.fetchPostsWithUsers(thread.postIds);
    this.stopLoadingIndicator();
  },
  methods: {
    ...mapActions(['fetchThread', 'fetchUsers', 'fetchPosts', 'createPost', 'startLoadingIndicator', 'stopLoadingIndicator']),
    localeDate,
    repliesCountWording,
    addPost (eventData) {
      const post = {
        ...eventData.post,
        threadId: this.id
      };
      this.createPost(post);
    },
    async fetchPostsWithUsers (ids) {
      // Загружаем из базы данных посты
      const posts = await this.fetchPosts({ ids });
      // Загружаем пользователей, написавших эти посты
      const users = posts.map(post => post.userId).concat(this.thread.userId);
      await this.fetchUsers({ ids: users });
    }
  }
}
</script>

<style lang="scss" scoped>
.thread {

  &__title {
    display: flex;
    justify-content: space-between;
    margin: 20px 0;
  }

  &__info {
    display: flex;
    justify-content: space-between;
  }

  &__replies {
    justify-self: flex-end;
    text-align: right;
  }
  
  &__no-auth-user {
    margin: 30px 0;
    text-align: center;
    font-size: 16px;
  }
}
</style>