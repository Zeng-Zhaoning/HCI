<template>
  <el-container id="home">
    <el-aside width="220px">
      <side-bar class="side-bar"></side-bar>
    </el-aside>
    <el-main>
      <work-space></work-space>
    </el-main>
  </el-container>
</template>

<script>
import SideBar from "../components/SideBar/SideBar";
import WorkSpace from "../components/WorkSpace";
import { mapActions,mapState,mapMutations,mapGetters } from "vuex";

export default {
  name: 'Home',
  components: {
    WorkSpace,
    SideBar
  },
  computed: {
    ...mapState(['uid']),
    ...mapGetters(['current_project']),
  },
  methods: {
    ...mapActions(['loadAllProjects']),
    ...mapMutations(['setWorkspaceText']),
  },
  created(){
    this.loadAllProjects(this.uid)
        .then(() => {
          this.setWorkspaceText(this.current_project.text)
        })
  }
}
</script>

<style scoped lang="less">
@import "../assets/css/colors.less";
#home {
  height: 100%;
  width: 100%;
}
.el-main{
  padding: 0;
  background-color: @background;
  height: 100%;
}

</style>