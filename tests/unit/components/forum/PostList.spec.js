import { shallowMount } from '@vue/test-utils';
import PostList from '@/components/forum/PostList.vue';
import testData from '@/data.json';

describe('PostList.vue', () => {
  it('displays post text', async () => {
    const post = testData.posts[0];

    const wrapper = shallowMount(PostList, {
      props: {
        posts: [post]
      }
    });

    const postText = wrapper.find('.post__body').text();
    expect(postText).toBe(post.text);
    // expect(true).toBeTruthy();
  });
});

