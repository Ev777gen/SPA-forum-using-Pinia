<template>
  <div class="form_narrow">

    <VeeForm @submit="signIn">
      <h1 class="form__title title">Войти</h1>

      <AppFormField label="e-mail" name="email" type="email" v-model="form.email" rules="required|email" />
      <AppFormField label="Пароль" name="password" type="password" v-model="form.password" rules="required" />
      
      <div class="form__btn-group">
        <div>
          <span>Еще не зарегистрированы? </span>
          <router-link :to="{name: 'RegisterForm'}">Создайте аккаунт</router-link>
        </div>
        <button type="submit" class="btn btn_blue" :disabled="!(form.email && form.password)">Войти</button>
      </div>
    </VeeForm>
    
  </div>
</template>
<script>
export default {
  data () {
    return {
      form: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    async signIn () {
      try {
        await this.$store.dispatch('signInWithEmailAndPassword', { ...this.form });
        this.successRedirect();
      } catch (error) {
        alert(error.message);
      }
    },
    successRedirect () {
      const redirectTo = this.$route.query.redirectTo || { name: 'HomeView' };
      this.$router.push(redirectTo);
    }
  }
}
</script>
<style lang="scss" scoped>
.form__btn-group {
  justify-content: space-between;
  align-items: center;
}
</style>