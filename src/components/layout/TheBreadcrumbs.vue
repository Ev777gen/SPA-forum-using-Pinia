<template>
  <div class="breadcrumbs">
    <ul v-if="breadcrumbs.length > 1">
      <li
        v-for="(breadcrumb, idx) in breadcrumbs"
        :key="breadcrumb.name"
        @click="changeRoute(breadcrumb, idx)"
        :class="{'clickable': idx < breadcrumbs.length - 1}"
      >
        {{ breadcrumb.nameToDisplay }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data () {
    return {
      breadcrumbs: []
    }
  },
  watch: { 
    '$route'() {
      if (this.$route.meta.breadcrumb) {
        const lastIndex = this.breadcrumbs.length - 1;
        const currentIndex = this.breadcrumbs.findIndex(breadcrumb => breadcrumb.name === this.$route.name);
        const hasSameNameAsLast = this.breadcrumbs[lastIndex].name === this.$route.name;
        const isHomePage = this.$route.path === '/';
        const isPageAdded = currentIndex > 0 && currentIndex <= lastIndex;
        
        if (!isPageAdded && !isHomePage) {
          this.addBreadcrumb();
        } else if (isPageAdded && hasSameNameAsLast) {
          this.replaceLastBreadcrumb();
        } else {
          this.deleteNextBreadcrumbs(currentIndex + 1);
        }
        
      } else {
        this.initialiseBreadcrumbs();
      }
    }
  },
  mounted () { 
    this.initialiseBreadcrumbs();
  },
  methods: {
    changeRoute (breadcrumb, idx) {
      this.$router.push({ 
        name: breadcrumb.name,
        params: breadcrumb.params,
        query: breadcrumb.query
      });
      this.deleteNextBreadcrumbs(idx + 1);
    },
    addBreadcrumb () {
      const currentRoute = {
        name: this.$route.name,
        params: this.$route.params,
        query: this.$route.query,
        nameToDisplay: this.$route.meta.breadcrumb
      };
      this.breadcrumbs.push(currentRoute);
    },
    deleteNextBreadcrumbs(idx) {
      this.breadcrumbs.splice(idx);
    },
    replaceLastBreadcrumb() {
      this.breadcrumbs.pop();
      this.addBreadcrumb();
    },
    initialiseBreadcrumbs() {
      if (this.breadcrumbs.length > 0) {
        this.deleteNextBreadcrumbs(1);
      } else {
        this.breadcrumbs.push({ name: 'HomeView', nameToDisplay: 'Главная' });
      }
    }
  }
}
</script>

<style scoped>
  .breadcrumbs {
    margin-top: 20px;
  }
  ul {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    list-style-type: none;
    margin: 0;
  }
  ul > li {
    display: flex;
    float: left;
    width: auto;
    font-weight: bold;
    font-size: .8em;
    line-height: 1.3em;
    cursor: default;
    align-items: center;
  }
  ul > li:not(:last-child)::after {
    content: '/';
    float: right;
    font-size: .8em;
    margin: 0 .5em;
    cursor: default;
  }
  .clickable {
    cursor: pointer;
    font-size: 1em;
    font-weight: normal;
  }
</style>
