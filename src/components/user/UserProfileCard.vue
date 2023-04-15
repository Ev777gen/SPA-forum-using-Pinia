<template>
  <div v-if="user" class="card">
    <div class="card__header">
      <div class="card__background_cover"></div>
      <div class="card__background_footer" :style="isDarkMode ? { backgroundColor: '#4f4f55' } : null">
        <p class="card__name">{{ user.name }}</p>
        <p class="card__date text_gray desktop-only">Зарегистрирован {{ localeDate(user.registeredAt) }}</p>
      </div>
      <div class="card__avatar">
        <AppAvatar :src="user.avatar" class="avatar_xlarge" />
      </div>
    </div>
    <div class="card__info">
      <div class="card__username">
        <span>Логин: </span>
        <span>{{ user.username }}</span>
      </div>
      <div class="card__bio">
        <span>Обо мне: </span>
        <span>{{ user.bio || '---' }}</span>
      </div>
      <div class="card__website">
        <span>Вебсайт: </span>
        <span>
          <a v-if="user.website" :href="user.website">{{ user.website }}</a>
          <span v-else>не указан</span>
        </span>
      </div>
      <div class="card__posts-count">
        <span>Постов на форуме: </span>
        <span>{{ user.postsCount }}</span>
      </div>
      <div class="card__threads-count">
        <span>Начатых тем на форуме: </span>
        <span>{{ user.threadsCount }}</span>
      </div>
    </div>
    <div v-if="user.id === authId" class="card__button">
      <router-link :to="{name: 'ProfileEdit'}" class="btn btn_orange">Редактировать профиль</router-link>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/AuthStore';
import { localeDate } from '@/helpers';
import useDarkMode from '@/composables/useDarkMode';

defineProps({
  user: {
    type: Object,
    required: true
  }
});

const { authId } = storeToRefs(useAuthStore());
const { isDarkMode } = useDarkMode();

</script>

<style lang="scss" scoped>
/* 
  Общая часть стилей компонентов 
  UserProfileCard.vue и UserProfileCardEditor.vue 
  находится в файле ProfileView.vue 
*/
.card {
  
  &__info {
    margin: 15px 0;
    padding: 15px 25px;
    border: 2px solid #eee;
    border-radius: 5px;
    font-size: 18px;
    @media (max-width: 720px) {
      & {
        padding: 10px;
      }
    }

    & div {
      padding: 10px;
      display: flex;
      flex-wrap: nowrap;
      & > span:first-child {
        width: 250px;
        @media (max-width: 720px) {
          & {
            width: 40%;
          }
        }
      }
      & > span:last-child {
        @media (max-width: 720px) {
          & {
            width: 60%;
            padding-left: 5%;
          }
        }
      }
    }
  }

  &__button {
    margin-bottom: 30px;
    text-align: right;
    @media (max-width: 720px) {
      & {
        text-align: center;
      }
    }
    @media (max-width: 550px) {
      & .btn {
        width: 100%;
        text-align: center;
      }
    }
  }
}
</style>