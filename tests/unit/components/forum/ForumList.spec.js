import { shallowMount } from '@vue/test-utils';
import ForumList from '@/components/forum/ForumList.vue';

const forums = [
  {
    "name": "Объявления",
    "slug": "announcements",
    "description": "Важные объявления о работе форума",
    "id": "1",
    "categoryId": "1",
    "threadIds": ["1"],
    "lastPostId": ""
  },
];

describe('ForumList.vue', () => {
  let wrapper;
  
  beforeEach(() => {
    wrapper = shallowMount(ForumList, {
      props: {
        forums
      }
    });
  });
    
  it('renders correctly from props', () => {
    expect(wrapper.text()).toContain(forums[0].name);
    expect(wrapper.text()).toContain(forums[0].description);
  });
});
