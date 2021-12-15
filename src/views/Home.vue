<template>
  <el-container id="home">
    <el-aside width="300px">
      <side-bar class="side-bar"></side-bar>
    </el-aside>
    <el-main>
      <work-space></work-space>
    </el-main>
  </el-container>
</template>

<script>
import SideBar from "../components/SideBar";
import WorkSpace from "../components/WorkSpace";
import { mapActions,mapState,mapMutations,mapGetters } from "vuex";

export default {
  name: 'Home',
  components: {
    WorkSpace,
    SideBar,
  },
  computed: {
    project: state => state.project,
  },
  methods: {
    ...mapActions(['loadProject']),
  },
  mounted(){
    this.loadProject();
  },
  created(){
    this.loadProject();
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
