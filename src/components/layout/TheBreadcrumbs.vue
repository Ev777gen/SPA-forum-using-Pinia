<template>
  <div class="breadcrumbs">
    <ul v-if="!isHomePage">
      <li
        v-for="(breadcrumb, idx) in breadcrumbs"
        :key="breadcrumb.name"
        @click="changeRoute(breadcrumb)"
        :class="{'clickable': idx < breadcrumbs.length - 1}"
      >
        {{ breadcrumb.nameToDisplay }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useBreadcrumbsStore } from '@/stores/BreadcrumbsStore';
import { useRoute } from 'vue-router';

const route = useRoute();

const { breadcrumbs } = storeToRefs(useBreadcrumbsStore());
const { changeRoute, initialiseBreadcrumbs, updateBreadcrumbs } = useBreadcrumbsStore();

const isHomePage = computed(() => {
  return route.path === '/';
});

watch(route, (newValue) => {
  updateBreadcrumbs(newValue);
});

watch(breadcrumbs, () => {
  if (breadcrumbs.length === 0) {
    initialiseBreadcrumbs(); 
  }
});
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
