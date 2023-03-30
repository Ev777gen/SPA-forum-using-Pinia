import { defineStore } from 'pinia';
import router from '@/router';

export const useBreadcrumbsStore = defineStore('BreadcrumbsStore', {
  state: () => {
    return {
      breadcrumbs: [{ name: 'HomeView', nameToDisplay: 'Главная' }]
    }
  },
  actions: {
    updateBreadcrumbs(route) {
      if (!route) return;
      if (route.meta.breadcrumb) {
        const lastIndex = this.breadcrumbs.length - 1;
        const currentIndex = this.breadcrumbs.findIndex(breadcrumb => breadcrumb.name === route.name);
        const hasSameNameAsLast = this.breadcrumbs[lastIndex].name === route.name;
        const isHomePage = route.path === '/';
        const isPageAdded = currentIndex > 0 && currentIndex <= lastIndex;
        
        if (!isPageAdded && !isHomePage) {
          this.addBreadcrumb(route);
        } else if (isPageAdded && hasSameNameAsLast) {
          this.replaceLastBreadcrumbWith(route);
        } else {
          this.deleteNextBreadcrumbs(currentIndex);
        }
      } else {
        this.initialiseBreadcrumbs();
      }
    },
    changeRoute (breadcrumb) {
      router.push({ 
        name: breadcrumb.name,
        params: breadcrumb.params,
        query: breadcrumb.query
      });
    },
    addBreadcrumb (route) {
      if (route) {
        const currentRoute = {
          name: route.name,
          params: route.params,
          query: route.query,
          nameToDisplay: route.meta.breadcrumb
        };
        this.breadcrumbs.push(currentRoute);
      }
    },
    deleteNextBreadcrumbs(idx) {
      this.breadcrumbs.splice(idx + 1);
    },
    replaceLastBreadcrumbWith(route) {
      this.breadcrumbs.pop();
      this.addBreadcrumb(route);
    },
    initialiseBreadcrumbs() {
      if (this.breadcrumbs.length > 0) {
        this.deleteNextBreadcrumbs(0);
      } else {
        this.breadcrumbs.push({ name: 'HomeView', nameToDisplay: 'Главная' });
      }
    }
  },
  persist: true,
});
