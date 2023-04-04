<template>
  <div v-if="isAsyncDataLoaded" >
    <h1 class="title">
      Редактирование темы <i>{{ thread.title }}</i>
    </h1>

    <ThreadEditor
      :title="thread.title"
      :text="text"
      @save="save"
      @cancel="cancel"
      @dirty="formIsDirty = true"
      @clean="formIsDirty = false"
    />
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
  id: { type: String, required: true }
});

const router = useRouter();

const formIsDirty = ref(false);

const { threads, posts, isAsyncDataLoaded } = storeToRefs(useForumStore());
const { 
  fetchThread, 
  updateThread, 
  fetchPost, 
  startLoadingIndicator, 
  stopLoadingIndicator 
} = useForumStore();

const thread = computed(() => {
  return findItemById(threads.value, props.id);
});

const text = computed(() => {
  if (thread.value.postIds) {
    const post = findItemById(posts.value, thread.value.postIds[0]);
    return post ? post.text : '';
  } else {
    return '';
  }
});

fetchAsyncData();

async function fetchAsyncData() {
  startLoadingIndicator();
  const thread = await fetchThread({ id: props.id });
  await fetchPost({ id: thread.postIds[0] });
  stopLoadingIndicator();
}

async function save ({ title, text }) {
  const thread = await updateThread({
    id: props.id,
    title,
    text
  });
  router.push({ name: 'ThreadView', params: { id: thread.id } });
}

function cancel () {
  router.push({ name: 'ThreadView', params: { id: thread.value.id } });
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