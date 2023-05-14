import { shallowMount } from '@vue/test-utils';
import CategoryList from '@/components/forum/CategoryList.vue';
import testData from '@/data.json';

describe('CategoryList.vue', () => {
  it('displays title', async () => {
    const category = testData.categories[0];

    const wrapper = shallowMount(CategoryList, {
      props: {
        categories: [category]
      }
    });

    const title = wrapper.get('.list__title').text();
    expect(title).toBe(category.name);
    //expect(true).toBeTruthy();
  });
});
