import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import CategoryList from '@/components/forum/CategoryList.vue';

const categories = [
  {
    "name": "Информация и обратная связь",
    "slug": "information-and-feedback",
    "id": "1",
    "forumIds": ["1", "2"]
  },
];

describe('CategoryList.vue', () => {
  let wrapper;
  
  beforeEach(() => {
    wrapper = shallowMount(CategoryList, {
      props: {
        categories
      },
      global: {
        components: {
          'router-link': RouterLinkStub
        }
      }
    });
  });

  it('renders correctly from props', () => {
    expect(wrapper.text()).toContain(categories[0].name);
  });
});
