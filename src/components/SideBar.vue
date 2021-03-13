<template>
  <div class="container">
<!--    <div class="header">个人信息</div>-->
    <div class="user-info">
      <div>
        你好，
        <span class="user-name">"用户名"</span>
      </div>
      <div class="prompt">新建或打开已有项目以开始操作</div>
    </div>

    <div class="projects">
      <div class="header">
        <span>我的项目</span>
        <el-button class="addbtn" icon="el-icon-plus"></el-button>
      </div>
      <el-menu
          class="menu"
          >
        <el-menu-item index="1">项目1</el-menu-item>
        <el-menu-item index="2">项目2</el-menu-item>
        <el-menu-item index="3">项目3</el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script>
export default {
  name: "SideBar",
  methods:{

  }
}
</script>

<style scoped lang="less">
@import "../assets/css/colors.less";
@pad : 15px;
@project_item_height : 50px;
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
.el-menu-item{
  height: @project_item_height;
  line-height: @project_item_height;
}
</style>