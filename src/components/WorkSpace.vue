<template>
  <div class="container">
    <kg-template></kg-template>
    <edit-bar class="edit-bar"></edit-bar>
  </div>
</template>

<script>
import EditBar from "./EditBar";
import { mapState } from "vuex";
import kgTemplate from "./cy_ref1"

export default {
  name: "WorkSpace",
  components: {EditBar,kgTemplate},
  computed: {
    ...mapState(['current_pid']),
  }
}
</script>

<style scoped lang="less">

</style>