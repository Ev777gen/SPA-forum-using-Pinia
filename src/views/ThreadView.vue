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

<script setup>
import PostList from '@/components/forum/PostList';
import PostEditor from '@/components/forum/PostEditor';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/AuthStore';
import { useForumStore } from '@/stores/ForumStore';
import { localeDate, repliesCountWording } from '@/helpers';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const { authUser } = storeToRefs(useAuthStore());
const { thread: threadGetter, posts, isAsyncDataLoaded } = storeToRefs(useForumStore());
const { 
  fetchThread, 
  fetchUsers, 
  fetchPosts, 
  createPost, 
  startLoadingIndicator, 
  stopLoadingIndicator 
} = useForumStore();

const thread = computed(() => {
  return threadGetter.value(props.id);
});

const threadPosts = computed(() => {
  return posts.value.filter(post => post.threadId === props.id);
});

fetchAsyncData();

async function fetchAsyncData() {
  startLoadingIndicator();
  const thread = await fetchThread({ id: props.id });
  await fetchPostsWithUsers(thread.postIds);
  stopLoadingIndicator();
}

function addPost (eventData) {
  const post = {
    ...eventData.post,
    threadId: props.id
  };
  createPost(post);
}

async function fetchPostsWithUsers (ids) {
  // Загружаем из базы данных посты
  const posts = await fetchPosts({ ids });
  // Загружаем id пользователей, написавших эти посты
  const userIds = posts.map(post => post.userId).concat(thread.value.userId);
  await fetchUsers({ ids: userIds });
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