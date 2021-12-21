<template>
  <el-container id="home">
    <el-aside width="300px">
      <side-bar class="side-bar"></side-bar>
    </el-aside>
    <el-main>
      <work-space></work-space>
    </el-main>
    <edit-guide v-if="isEditGuideShow"/>
  </el-container>
</template>

<script>
import SideBar from "../components/SideBar";
import WorkSpace from "../components/WorkSpace";
import EditGuide from "../components/Guides/EditGuide.vue";
import { mapState, mapActions, mapMutations } from "vuex";

export default {
  name: 'Home',
  components: {
    WorkSpace,
    SideBar,
    EditGuide,
  },
  computed: {
    ...mapState({
      pid: state => state.pid,
      project: state => state.project,
      project_name: state => state.project_name,
      isEditGuideShow: state => state.isEditGuideShow,
    }),
  },
  methods: {
    ...mapActions(['loadProject']),
    ...mapMutations(['setPid', 'setProjectName', 'setUserInfo']),
  },
  mounted(){
    !this.pid && this.setPid(window.localStorage.getItem("pid"));
    !this.project && this.loadProject();
    !this.project_name && this.setProjectName(window.localStorage.getItem("project_name"));
    const uidCached = parseInt(window.localStorage.getItem("uid"));
    const umailCached = window.localStorage.getItem("umail");
    !this.uid && !this.umail && this.setUserInfo(uidCached, umailCached, undefined);
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
  &::-webkit-scrollbar {
    display: none;
  }
}

</style>
