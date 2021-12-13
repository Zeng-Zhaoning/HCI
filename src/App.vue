<template>
  <router-view />
</template>

<script>
export default {
  created() {
    this.$router.beforeEach((to, from, next) => {
      console.log(to);
      next();
    });
  },
};
</script>