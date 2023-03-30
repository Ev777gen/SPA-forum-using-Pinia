<template>
  <header class="header">
    <div class="header__body container">

      <router-link :to="{name: 'HomeView'}" v-if="!isMobile || (authUser && isMobile)" class="header__logo">Logo</router-link>
      <a
        v-if="authUser && !isMobile"
        @click.prevent="isDropdownOpen = !isDropdownOpen"
        v-click-outside="onClickOutside"
        class="header__user-avatar"
      >
        <AppAvatar class="header__avatar avatar_small" :src="authUser?.avatar" :alt="`${authUser.name} profile image`"/>
        <font-awesome-icon icon="fa-solid fa-angle-down" class="header__arrow" :class="{'header__arrow_up': isDropdownOpen}" />
      </a>
      
      <div 
        v-else-if="authUser && isMobile" 
        @click="isDropdownOpen = !isDropdownOpen"
        v-click-outside="onClickOutside"
        class="burger"
      >
        <div class="burger__top-bar"></div>
        <div class="burger__middle-bar"></div>
        <div class="burger__bottom-bar"></div>
      </div>

      <div v-else class="header__not-auth-user">
        <router-link :to="{name: 'RegisterForm'}" class="header__link">Зарегистрироваться</router-link>
        <router-link :to="{name: 'SignIn'}" class="header__link">
          <font-awesome-icon icon="fa-solid fa-right-to-bracket" /> Войти
        </router-link>
      </div>

      <div class="dropdown" :class="{'dropdown_open': isDropdownOpen}">
        <nav class="dropdown__nav mobile-only">
          <router-link :to="{name: 'HomeView'}" class="dropdown__link">На главную</router-link>
          <router-link :to="{name: 'ForumMainPage'}" class="dropdown__link">Форум</router-link>
          <router-link :to="{name: 'AboutMe'}" class="dropdown__link">Обо мне</router-link>
          <hr>
        </nav>
        <router-link :to="{name: 'ProfileView'}" class="dropdown__link">Мой профиль</router-link>
        <router-link :to="{name: 'SettingsView'}" class="dropdown__link">Настройки</router-link>
        <a href="" class="dropdown__link" @click.prevent="onSignOut">Выйти <font-awesome-icon icon="fa-solid fa-right-from-bracket" /></a>
      </div>
      
    </div>
  </header>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import { useAuthStore } from '@/stores/AuthStore';
import vClickOutside from 'click-outside-vue3';

export default {
  directives: {
    clickOutside: vClickOutside.directive
  },
  data () {
    return {
      isDropdownOpen: false,
      isMobile: false
    }
  },
  computed: {
    ...mapState(useAuthStore, ['authUser'])
  },
  created () {
    this.$router.beforeEach(() => {
      this.isDropdownOpen = false;
    });
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  },
  methods: {
    ...mapActions(useAuthStore, ['signOut']),
    onSignOut () {
      this.signOut();
      this.isDropdownOpen = false;
    },
    onClickOutside () {
      this.isDropdownOpen = false;
    }
  }
}
</script>

<style lang="scss" scoped>
$burger-size: 35px;
$dropdown-color: #fff;
$dropdown-link-color: #444;
$triangle-size: 8px;

.header {
  padding: 20px 0;
  background-color: #23374d;

  &__body {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 35px;
  }

  &__logo {
    font-size: 32px;
    font-weight: bold;
    color: #fff;
  }

  &__not-auth-user {
    margin-left: auto;
  }

  &__user-avatar {
    cursor: pointer;
  }

  &__arrow {
    margin-left: 5px;
    margin-top: 10px;
    vertical-align: middle;
    color: #fff;
    transition: all 0.3s;
  }

  &__arrow_up {
    transform: rotate(-180deg);
  }

  &__link {
    margin-left: 15px;
    font-size: 16px;
    font-weight: 700;
    color: #ffb579;
    &:last-child {
      color: #fff;
    }
  }
}

.burger {
  width: $burger-size;
  height: $burger-size;
  margin: 0 10px;
  cursor: pointer;

  &__top-bar,
  &__middle-bar,
  &__bottom-bar {
    width: $burger-size;
    height: 3px;
    background: white;
    position: absolute;
    border-radius: 10px;
    transition: all 0.5s;
  }

  &__top-bar {
    top: 15%;
  }

  &__middle-bar {
    top: 50%;
  }

  &__bottom-bar {
    top: 85%;
  }
}


.dropdown {
  position: absolute;
  display: block;
  top: 100%;
  right: 15px;
  margin-top: 10px;
  padding: 20px 40px;
  background-color: $dropdown-color;
  box-shadow: 1px 15px 15px rgba(1, 1, 1, 0.1);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
  z-index: 1000;

  &::after {
    content: ''; 
    position: absolute;
    right: 25px; 
    top: -2 * $triangle-size;
    border: $triangle-size solid transparent;
    border-bottom: $triangle-size solid $dropdown-color;
    @media (max-width: 720px) {
      & {
        right: 20px;
      }
    }
  }

  &__link {
    display: block;
    font-size: 20px;
    line-height: 2;
    color: $dropdown-link-color;
    @media (max-width: 720px) {
      & {
        font-size: 24px;
        line-height: 1.8;
      }
    }
  }

  &__nav hr {
    height: 2px;
    width: 100%;
    margin: 15px 0;
    background-color: #eee;
  }

  &_open {
    opacity: 1;
    visibility: visible;
  }
}
</style>
