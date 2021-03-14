<template>
  <div class="container">
    <div class="user-info">
      <div>
        你好，
        <span class="user-name">{{ user_name }}</span>
      </div>
      <div class="prompt">新建或打开已有项目以开始操作</div>
    </div>

    <div class="projects">
      <div class="header">
        <span>我的项目</span>
        <el-button class="addbtn" icon="el-icon-plus" @click="create_pro"></el-button>
      </div>
      <div class="menu">
        <project-item v-for="(pro,i) of all_projects"
                      :pname="pro.project_name"
                      :pid="pro.pid"
                      :key="i"
                      @click="select(pro.pid)">
        </project-item>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState, mapMutations, mapGetters} from "vuex";
import ProjectItem from "./ProjectItem"
export default {
  name: "SideBar",
  components:{ProjectItem},
  computed:{
    ...mapState([
        "user_name", "all_projects"
    ])
  },
  methods:{
    ...mapMutations(['setCurrentProject']),
    create_pro(){
      alert("创建新项目")
    },
    select(pid){
      this.setCurrentProject(pid);
    }
  }
}
</script>

<style scoped lang="less">
@import "../../assets/css/colors.less";
@pad : 15px;

.container{
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.user-info{
  padding: @pad;
  font-size: 13px;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border-top: 2px solid @theme;
  width: 220px - 2 * @pad;
}
.user-name{
  color: @theme;
  font-size: 16px;
  font-weight: bold;
}
.prompt{
  color: @prompt;
}
.projects{
  flex-grow: 1;
}
.header{
  background: @theme;
  padding: @pad;
  height: 40px;
  width: 220px - 2 * @pad;
  font-size: 16px;
  font-weight: bold;
  color: white;
  line-height: 40px;
  display: flex;
  justify-content: space-between;
}
.addbtn{
  border: none;
  background: none;
  color: white;
  width: 30px;
  height: 10px;
  padding: 0px;
}
.menu{
  width: 220px;
  border-right: 1px solid white;
}
</style>