<template>
  <div class="container">
    <div class="graph-area">
      知识图谱展示区
      当前项目：{{ current_pid }}
    </div>
    <edit-bar class="edit-bar"></edit-bar>
  </div>
</template>

<script>
import EditBar from "./EditBar";
import { mapState } from "vuex";

export default {
  name: "WorkSpace",
  components: {EditBar},
  computed: {
    ...mapState(['current_pid']),
  }
}
</script>

<style scoped lang="less">
.edit-bar{

}
.graph-area{
  position: absolute;
  top: 48%;
  left: 43%;
}
</style>