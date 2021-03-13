<template>
  <div class="container">
    <div class="graph-area">
      知识图谱展示区
    </div>
    <edit-bar class="edit-bar"></edit-bar>
  </div>
</template>

<script>
import EditBar from "./EditBar";

export default {
  name: "WorkSpace",
  components: {EditBar}
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