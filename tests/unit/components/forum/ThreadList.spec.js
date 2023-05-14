import { shallowMount } from '@vue/test-utils';
import ThreadList from '@/components/forum/ThreadList.vue';
import testData from '@/data.json';

describe('ThreadList.vue', () => {
  it('displays title', async () => {
    const thread = testData.threads[0];

    const wrapper = shallowMount(ThreadList, {
      props: {
        threads: [thread]
      }
    });

    const title = wrapper.get('.thread__title').text();
    expect(title).toBe(thread.title);
    // expect(true).toBeTruthy();
  });
});
