<template>
  <el-container id="home">
    <el-aside width="220px">
      <side-bar></side-bar>
    </el-aside>
    <el-main>
      <work-space class="work-space"></work-space>
    </el-main>
  </el-container>
</template>

<script>
import SideBar from "../components/SideBar/SideBar";
import WorkSpace from "../components/WorkSpace";
import { mapActions,mapState } from "vuex";

export default {
  name: 'Home',
  components: {
    WorkSpace,
    SideBar
  },
  computed: {
    ...mapState(['uid']),
  },
  methods: {
    ...mapActions(['loadAllProjects']),
  },
  created() {
    this.loadAllProjects(this.uid);
  }
}
</script>

<style scoped lang="less">
@import "../assets/css/colors.less";
#home {
  height: 100%;
}
.el-main{
  padding: 0;
  background-color: @background;
}
.work-space{
  height: 100%;
}
</style>