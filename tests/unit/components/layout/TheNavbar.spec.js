import { mount } from '@vue/test-utils';
import TheNavbar from '@/components/layout/TheNavbar.vue';
import router from '@/router';
// import { createRouter, createWebHistory } from 'vue-router';
// import { defineStore } from 'pinia';
import { createTestingPinia } from '@pinia/testing';

// Fake router:
// const routes = [
//   {
//     path: '/',
//     component: {
//       template: 'Home'
//     }
//   },
//   {
//     path: '/profile',
//     component: {
//       template: 'Profile'
//     }
//   }
// ];

// const router = createRouter({
//   history: createWebHistory(),
//   routes: routes,
// });

// Fake store:
// const useAuthStore = defineStore('counter', {
//   state: () => ({ authId: null }),
//   getters: {
//     authUser: () => null,
//   },
// });

// const pinia = createTestingPinia();
// const auth = useAuthStore(pinia);

describe('TheNavbar.vue', () => {
  let wrapper;

  beforeEach(async () => {
    await router.isReady();

    wrapper = mount(TheNavbar, {
      global: {
        plugins: [router, createTestingPinia()],
      }
    });
  });

  it('displays correctly when user is not logged in', () => {
    expect(wrapper.find('[data-test="not-logged-in"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="avatar"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="burger"]').exists()).toBe(false);
  });
});
