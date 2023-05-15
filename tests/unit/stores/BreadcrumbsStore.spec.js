import { setActivePinia, createPinia } from 'pinia';
import { useBreadcrumbsStore } from '@/stores/BreadcrumbsStore';

describe('BreadcrumbsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should update breadcrumbs array', () => {
    const breadcrumbsStore = useBreadcrumbsStore();
    const route = {
      name: 'page',
      params: '1',
      query: '1',
      meta: {
        breadcrumb: 'page',
      },
    };
    const breadcrumb = {
      name: route.name,
      params: route.params,
      query: route.query,
      nameToDisplay: route.meta.breadcrumb,
    };
    let lastBreadcrumb;
    let breadcrumbsLength;

    // Случай 1 - добавляем новый breadcrumb
    // должен просто добавить его в массив breadcrumbs
    breadcrumbsStore.updateBreadcrumbs(route);
    lastBreadcrumb = breadcrumbsStore.breadcrumbs[breadcrumbsStore.breadcrumbs.length - 1];
    expect(lastBreadcrumb).toStrictEqual(breadcrumb);

    // Случай 2 - добавляем новый breadcrumb с таким же именем
    // должен заменить последний breadcrumb на этот
    const newRouteWithSameName = { ...route, query: '2' };
    const newBreadcrumbWithSameName = { ...breadcrumb, query: '2' };
    breadcrumbsLength = breadcrumbsStore.breadcrumbs.length;
    breadcrumbsStore.updateBreadcrumbs(newRouteWithSameName);
    lastBreadcrumb = breadcrumbsStore.breadcrumbs[breadcrumbsStore.breadcrumbs.length - 1];
    expect(lastBreadcrumb).toStrictEqual(newBreadcrumbWithSameName);
    expect(breadcrumbsStore.breadcrumbs.length).toBe(breadcrumbsLength);

    // Случай 3 - добавляем существующий breadcrumb
    // при этом должны удалиться все breadcrumbs после него
    const newRoute = { ...route, name: 'page2' };
    breadcrumbsStore.updateBreadcrumbs(newRoute);
    breadcrumbsLength = breadcrumbsStore.breadcrumbs.length;
    const existingRoute = newRouteWithSameName;
    const existingBreadcrumb = newBreadcrumbWithSameName;
    breadcrumbsStore.updateBreadcrumbs(existingRoute);
    lastBreadcrumb = breadcrumbsStore.breadcrumbs[breadcrumbsStore.breadcrumbs.length - 1];
    expect(lastBreadcrumb).toStrictEqual(existingBreadcrumb);
    expect(breadcrumbsStore.breadcrumbs.length).toBe(breadcrumbsLength - 1);

    // Случай 4 - добавляем home page
    // массив breadcrumbs должен содержать один элемент
    const homePageRoute = {
      path: '/',
      name: 'HomeView',
      meta: {
        breadcrumb: 'Главная',
      },
    };
    const homePageBreadcrumb = {
      name: homePageRoute.name,
      nameToDisplay: homePageRoute.meta.breadcrumb,
    };
    breadcrumbsStore.updateBreadcrumbs(homePageRoute);
    lastBreadcrumb = breadcrumbsStore.breadcrumbs[breadcrumbsStore.breadcrumbs.length - 1];
    expect(lastBreadcrumb).toEqual(homePageBreadcrumb);
    expect(breadcrumbsStore.breadcrumbs.length).toBe(1);
  });
});
