import { setActivePinia, createPinia } from 'pinia';
// import { useForumStore } from '@/stores/ForumStore';

describe('ForumStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('...', () => {
    expect(1).toBe(1);
  });
});
