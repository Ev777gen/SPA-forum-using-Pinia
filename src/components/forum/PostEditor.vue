<template>
  <VeeForm @submit="save" :key="formKey" class="form">
    <AppFormField as="textarea" name="text" v-model="postCopy.text" rows="10" cols="30" rules="required" />
    <div class="form__btn-group">
      <button v-if="isDirty" @click.prevent="cancel" class="form__button btn btn_ghost">Отмена</button>
      <button class="form__button btn btn_blue">{{post.id ? 'Сохранить изменения' : 'Опубликовать'}}</button>
    </div>
  </VeeForm>
</template>

<script>
export default {
  props: {
    post: { 
      type: Object,
      default: () => ({ text: null })
    }
  },
  data () {
    return {
      postCopy: { ...this.post },
      isDirty: !!this.post.text,
      formKey: Math.random()
    }
  },
  methods: {
    save() {
      this.$emit('save', { post: this.postCopy });
      this.postCopy.text = '';
      this.formKey = Math.random();
    },
    cancel() {
      this.$emit('cancel');
    }
  }
}
</script>

<style lang="scss" scoped>
.form__btn-group {
  margin-top: 0px;
}
</style>