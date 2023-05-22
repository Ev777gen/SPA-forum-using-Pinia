import { shallowMount } from '@vue/test-utils';
import ThreadList from '@/components/forum/ThreadList.vue';

const threads = [
  {
    "title": "Заголовок темы № 1",
    "slug": "title-of-topic-1",
    "id": "1",
    "forumId": "1",
    "userId": "1",
    "firstPostId": "1",
    "publishedAt": 1594035908,
    "lastPostAt": 1594040497,
    "lastPostId": "2",
    "postIds": ["1", "2"],
    "contributorIds": ["1", "2"]
  },
]

describe('ThreadList.vue', () => {
  let wrapper;
  
  beforeEach(() => {
    wrapper = shallowMount(ThreadList, {
      props: {
        threads
      }
    });
  });

  it('renders correctly from props', async () => {
    expect(wrapper.text()).toContain(threads[0].title);
  });
});
