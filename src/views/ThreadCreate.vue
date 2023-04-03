<template>
  <div v-if="isAsyncDataLoaded">
    <h1 class="title">
      Создать новую тему в форуме <i>{{ forum.name }}</i>
    </h1>

    <ThreadEditor @save="save" @cancel="cancel" @dirty="formIsDirty = true" @clean="formIsDirty = false"/>
  </div>
</template>

<script setup>
import ThreadEditor from '@/components/forum/ThreadEditor';
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useForumStore } from '@/stores/ForumStore';
import { useRouter } from 'vue-router';
import { onBeforeRouteLeave } from 'vue-router';
import { findItemById } from '@/helpers';

const props = defineProps({
  forumId: { 
    type: String, 
    required: true 
  }
});

const router = useRouter();

const formIsDirty = ref(false);

const { forums, isAsyncDataLoaded } = storeToRefs(useForumStore());
const { fetchForum, createThread, startLoadingIndicator, stopLoadingIndicator } = useForumStore();

const forum = computed(() => {
  return findItemById(forums.value, props.forumId);
});

fetchAsyncData();

async function fetchAsyncData() {
  startLoadingIndicator();
  await fetchForum({ id: props.forumId });
  stopLoadingIndicator();
}

async function save ({ title, text }) {
  const thread = await createThread({
    title,
    text,
    forumId: forum.value.id
  });
  router.push({ name: 'ThreadView', params: { id: thread.id } });
}

function cancel() {
  router.push({ name: 'ForumView', params: { id: forum.value.id } });
}

onBeforeRouteLeave(() => {
  if (formIsDirty.value) {
    const isConfirmed = window.confirm('Вы уверены, что хотите покунуть страницу? Все несохраненные изменения будут потеряны.');
    if (!isConfirmed) return false;
  }
});
</script>

<style scoped>
.title {
  margin: 35px 0;
}
</style>