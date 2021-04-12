<template>
  <div class="container">
    <kg-template class="kg-template"></kg-template>
    <edit-bar></edit-bar>
  </div>
</template>

<script>
import EditBar from "./EditBar/EditBar.vue";
import { mapState } from "vuex";
import kgTemplate from "./CytoscapeKG"
import axios from "axios";

export default {
  name: "WorkSpace",
  components: {EditBar,kgTemplate},
  computed: {
    ...mapState(['current_pid']),
  },
  watch: {
    json_src_path(now, old) {
      axios.get(now)
          .then(res => {
            this.dataHandle(res.data)
          })
          .catch(err => {})
    },
  }
}
</script>

<style scoped lang="less">
.container{
  height: 100%;
}
.kg-template{
  height: 100%;
}
</style>
