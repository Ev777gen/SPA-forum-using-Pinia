import { shallowMount } from '@vue/test-utils';
import PostList from '@/components/forum/PostList.vue';

const posts = [
  {
    "text": "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    "publishedAt": 1594035908,
    "id": "1",
    "threadId": "1",
    "userId": "1"
  },
];


describe('PostList.vue', () => {
  let wrapper;
  
  beforeEach(() => {
    wrapper = shallowMount(PostList, {
      props: {
        posts
      }
    });
  });

  it('renders correctly from props', () => {
    expect(wrapper.text()).toContain(posts[0].text);
  });
});

