import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/AuthStore';
import { useForumStore } from '../stores/ForumStore';
import { findItemById } from '@/helpers';

const routes = [
  {
    path: '/',
    name: 'HomeView',
    component: () => import(/* webpackChunkName: "HomeView" */ '@/views/HomeView.vue'),
    meta: { toTop: true, smoothScroll: true, breadcrumb: 'Главная' }
  },
  {
    path: '/profile',
    name: 'ProfileView',
    component: () => import(/* webpackChunkName: "ProfileView" */'@/views/ProfileView.vue'),
    props: { edit: false },
    meta: { isAuthRequired: true, toTop: true, smoothScroll: true, breadcrumb: 'Мой профиль' }
  },
  {
    path: '/profile/edit',
    name: 'ProfileEdit',
    component: () => import(/* webpackChunkName: "ProfileEdit" */'@/views/ProfileView.vue'),
    props: { edit: true },
    meta: { isAuthRequired: true, breadcrumb: 'Редактировать профиль' }
  },
  {
    path: '/profile/:userId',
    name: 'ProfileOfAnyUser',
    component: () => import(/* webpackChunkName: "ProfileOfAnyUser" */'@/views/ProfileView.vue'),
    props: true,
    meta: { toTop: true, smoothScroll: true, breadcrumb: 'Профиль пользователя' }
  },
  {
    path: '/settings',
    name: 'SettingsView',
    component: () => import(/* webpackChunkName: "SettingsView" */'@/views/SettingsView.vue'),
    meta: { isAuthRequired: true, toTop: true, smoothScroll: true, breadcrumb: 'Настройки' }
  },
  {
    path: '/register',
    name: 'RegisterForm',
    component: () => import(/* webpackChunkName: "RegisterForm" */'@/views/RegisterForm.vue'),
    meta: { isForGuests: true, breadcrumb: 'Зарегистрироваться' }
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: () => import(/* webpackChunkName: "SignIn" */'@/views/SignIn.vue'),
    meta: { isForGuests: true, breadcrumb: 'Войти' }
  },
  {
    path: '/forum',
    name: 'ForumMainPage',
    component: () => import(/* webpackChunkName: "ForumMainPage" */ '@/views/ForumMainPage.vue'),
    meta: { breadcrumb: 'Категории' }
  },
  {
    path: '/forum/:id',
    name: 'ForumView',
    component: () => import(/* webpackChunkName: "ForumView" */ '@/views/ForumView.vue'),
    props: true,
    meta: { breadcrumb: 'Форум' }
  },
  {
    path: '/thread/:id',
    name: 'ThreadView',
    component: () => import(/* webpackChunkName: "ThreadView" */ '@/views/ThreadView.vue'),
    props: true,
    meta: { breadcrumb: 'Тема' },
    async beforeEnter (to, from, next) {
      const forum = useForumStore();

      await forum.fetchThread({ id: to.params.id, once: true });
      // Проверяем, есть ли такая тема
      const threadExists = findItemById(forum.threads, to.params.id);
      // если есть - продолжаем
      if (threadExists) {
        return next();
      } else {
        // Если такой темы нет - переходим на страницу 404
        next({
          name: 'NotFound',
          params: { pathMatch: to.path.substring(1).split('/') },
          // сохраняем текущие значения query и hash
          query: to.query,
          hash: to.hash
        })
      }
    }
  },
  {
    path: '/forum/:forumId/thread/create',
    name: 'ThreadCreate',
    component: () => import(/* webpackChunkName: "ThreadCreate" */ '@/views/ThreadCreate.vue'),
    props: true,
    meta: { isAuthRequired: true, breadcrumb: 'Создать тему' }
  },
  {
    path: '/thread/:id/edit',
    name: 'ThreadEdit',
    component: () => import(/* webpackChunkName: "ThreadEdit" */'@/views/ThreadEdit.vue'),
    props: true,
    meta: { isAuthRequired: true, breadcrumb: 'Редактировать тему' }
  },
  {
    path: '/aboutme',
    name: 'AboutMe',
    component: () => import(/* webpackChunkName: "AboutMe" */ '@/views/AboutMe.vue'),
    meta: { breadcrumb: 'Обо мне' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import(/* webpackChunkName: "NotFound" */'@/views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  const { unsubscribeAllSnapshots } = useForumStore();

  await auth.initAuthentication();
  unsubscribeAllSnapshots();

  if (to.meta.isAuthRequired && !auth.authId) {
    return { name: 'SignIn', query: { redirectTo: to.path } };
  }
  if (to.meta.isForGuests && auth.authId) {
    return { name: 'HomeView' };
  }
});

export default router;
