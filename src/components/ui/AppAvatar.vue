<template>
  <img :src="src || 'https://icons.iconarchive.com/icons/papirus-team/papirus-apps/128/system-users-icon.png'" class="avatar">
</template>
<script>
export default {
  props: {
    src: { type: String }
  }
}
</script>
<style scoped>
.avatar {
  background-color: white;
  object-fit: cover;
}
</style>
