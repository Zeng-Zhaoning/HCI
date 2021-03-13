<template>
  <el-container id="home">
    <el-aside width="220px">
      <side-bar></side-bar>
    </el-aside>
    <el-main>
      <work-space></work-space>
    </el-main>
  </el-container>
</template>

<script>
import SideBar from "../components/SideBar";
import WorkSpace from "../components/WorkSpace";

export default {
  name: 'Home',
  components: {
    WorkSpace,
    SideBar
  }
}
</script>

<style scoped>
#home {
  height: 100%;
}

</style>