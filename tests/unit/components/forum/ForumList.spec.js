import { shallowMount } from '@vue/test-utils';
import ForumList from '@/components/forum/ForumList.vue';
import testData from '@/data.json';

describe('ForumList.vue', () => {
  it('displays title', async () => {
    const forum = testData.forums[0];

    const wrapper = shallowMount(ForumList, {
      props: {
        forums: [forum]
      }
    });

    const title = wrapper.get('.forum__title').text();
    expect(title).toBe(forum.name);
    // expect(true).toBeTruthy();
  });
});



// "forums": [
//   {
//     "name": "Объявления",
//     "slug": "announcements",
//     "description": "Важные объявления о работе форума",
//     "id": "1",
//     "categoryId": "1",
//     "threadIds": ["1"],
//     "lastPostId": ""
//   },






// import { shallowMount } from '@vue/test-utils';
// import CategoryList from '@/components/forum/CategoryList.vue';

// describe('CategoryList.vue', () => {
//   it('displays title', () => {
//     const title = 'Добро пожаловать на форум!';
//     const wrapper = shallowMount(CategoryList/*, {
//       //props: { title }
//     }*/);
//     expect(true).toBeTruthy();
//     // expect(wrapper.text()).toContain(title);
//   });
// });