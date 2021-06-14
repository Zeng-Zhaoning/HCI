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
<!--        <i class="el-icon-plus createbtn" @click="create_pro"></i>-->
      </div>
      <div class="menu">
<!--        <project-item v-for="(pro,i) of all_projects"-->
<!--                      :pname="pro.project_name"-->
<!--                      :pid="pro.pid"-->
<!--                      :key="i"-->
<!--                      @click="select(pro.pid)">-->
<!--        </project-item>-->
        <project-item pname="项目1" :pid="1" :key="0"></project-item>
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
        "user_name"//, "all_projects", "workspace_text"
    ]),
    // ...mapGetters(['current_project'])
  },
  methods:{
    // ...mapMutations(['setCurrentProject','setWorkspaceText']),
    // create_pro(){
    //   alert("创建新项目")
    // },
    // select(pid){
    //   this.setCurrentProject(pid);
    //   this.setWorkspaceText(this.current_project.text);
    // }
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
.createbtn{
  text-align: center;
  height: 50px;
  width: 40px;
  line-height: 40px;
}
.createbtn:hover{
  cursor: pointer;
}
.menu{
  width: 220px;
  border-right: 1px solid white;
}
</style>