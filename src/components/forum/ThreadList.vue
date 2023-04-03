<template>
  <h2 class="list__title">Список тем</h2>
  <div v-if="threads.length" class="list">
    <div v-for="thread in threads" :key="thread.id" class="list__item thread">
      <div>
        <p class="thread__title">
          <router-link :to="{name: 'ThreadView', params: {id: thread.id}}">{{ thread.title }}</router-link>
        </p>
        <p class="thread__info desktop-only">
          Тема начата пользователем  
          <router-link :to="{name: 'ProfileOfAnyUser', params: {userId: thread.userId}}">{{ userById(thread.userId).name }}</router-link>, 
          {{ localeDate(thread.publishedAt) }}
        </p>
      </div>
      <div class="thread__activity">
        <div class="thread__replies-count">
          {{ thread.repliesCount > 0 ? thread.repliesCount : '' }}
          {{ repliesCountWording(thread.repliesCount) }}
        </div>
        <AppAvatar class="thread__avatar avatar_small" :src="userById(thread.userId).avatar" />
        <div>
          <p class="thread__user">
            <router-link :to="{name: 'ProfileOfAnyUser', params: {userId: thread.userId}}">{{ userById(thread.userId).name }}</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="no-threads">
    <em>Здесь пока нет тем. Создайте первую!</em>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useForumStore } from '@/stores/ForumStore';
import { localeDate, findItemById, repliesCountWording } from '@/helpers';

const props = defineProps({
  threads: {
    type: Array,
    required: true
  }
});

const { posts, users } = storeToRefs(useForumStore());

function postById (postId) {
  return findItemById(posts.value, postId);
}

function userById (userId) {
  return findItemById(users.value, userId) || {};
}
</script>

<style lang="scss" scoped>
.thread {
  flex-wrap: wrap;
  padding: 5px 10px 5px 20px;
  min-height: 45px;

  &__title {
    font-size: 18px;
  }
  
  &__info {
    color: #777;
  }

  &__activity {
    flex-basis: 35%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  &__replies-count {
    flex-basis: 35%;
    text-align: center;
  }

  &__avatar {
    margin: 0 10px;
  }

  &__user {
    white-space: nowrap;
  }

  @media (max-width: 720px) {
    &__activity {
      flex-basis: 100%;
      margin-top: 5px;
    }
    &__replies-count {
      order: 2;
      line-height: 1;
      margin-left: auto;
      text-align: right;
    }
    &__avatar {
      order: -1;
      margin-left: 0;
      margin-right: 5px;
    }
    &__user {
      order: 1;
    }
  }
}

.no-threads {
  padding: 10px;
  text-align: center;
}
</style>
