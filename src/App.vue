<template>
  <div class="app">
    <header class="app__header">
      <TheNavbar/>
    </header>
    <hr>
    <div class="app__body container">
      <aside class="app__sidebar desktop-only">
        <TheSidebar />
      </aside>
      <main class="app__content">
        <TheBreadcrumbs />
        <router-view v-show="isLoaded" :key="`${$route.path}${JSON.stringify($route.query)}`" />
        <AppSpinner v-show="!isLoaded" class="app__spinner" />
      </main>
    </div>
  </div>

</template>

<script>
import TheNavbar from '@/components/layout/TheNavbar';
import TheSidebar from '@/components/layout/TheSidebar';
import TheBreadcrumbs from '@/components/layout/TheBreadcrumbs';
import { mapActions } from 'vuex';
import NProgress from 'nprogress';

export default {
  name: 'App',
  components: { TheNavbar, TheSidebar, TheBreadcrumbs },
  computed: {
    isLoaded() {
      return this.$store.state.isLoaded;
    }
  },
  created () {
    this.fetchAuthUser();
    NProgress.configure({
      speed: 200,
      showSpinner: false
    });
    this.$router.beforeEach(() => {
      NProgress.start();
    });
    this.$router.afterEach(() => {
      setTimeout(() => NProgress.done(), 500);
    });
  },
  methods: {
    ...mapActions(['fetchAuthUser']),
  }
}
</script>

<style lang="scss">
@import '@/assets/reset.css';
@import '@/assets/global.scss';
@import "~nprogress/nprogress.css";

$container-width: 1100px;
$content-width: 900px;
$header-height: 75px;

.container {
  display: flex;
  justify-content: space-between;
  max-width: $container-width;
  margin: 0px auto;
  padding: 0 15px;
}

.app {
  min-height: 100%;
  height: 1px;
  
  &__header {
    position: fixed;
    top: 0;
    width: 100%;
    height: $header-height;
    background-color: #23374d;
    z-index: 999;
  }
  
  &__body {
    min-height: 100%;
    height: 1px;
    margin-top: $header-height;
  }

  &__content {
    width: $content-width;
    margin-left: $container-width - $content-width + 15px;
    @media (max-width: 720px) {
      & {
        margin-left: 0px;
      }
    }
  }

  &__sidebar {
    position: fixed;
    width: $container-width - $content-width;
    min-height: 100%;
    padding: 25px 15px;
    background-color: #f6f6f6;
  }

  &__spinner {
    margin-top: 40vh;
  }
}

#nprogress .bar{
  background: #5ce0b0 !important;
}
</style>