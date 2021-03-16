<template class="container">
  <div class="edit-bar-container" :class="{ hideEditBarAni: !showEditBar, ShowEditBarAni: showEditBar }">
    <span class="control-edit-bar" @click="changeEditBarState">
      <i :class="{'el-icon-arrow-right': showEditBar, 'el-icon-arrow-left': !showEditBar}"></i>
    </span>
    <div class="edit-block">
      <div class="title">
        待解析文本
      </div>
      <el-input
          disabled
          class="el-input"
          type="textarea"
          :rows="6"
          placeholder="请输入待解析文本"
          v-model="text">
      </el-input>
      <div class="analyse-btn-box">
        <el-button disabled type="primary" :loading="false" @click="analyse">保存并解析</el-button>
      </div>
    </div>

    <div class="edit-block">
      <div class="title">
        操作
      </div>
      <div class="operations">
        <div>
          <div class="op" @click="export_img">
            <div><img src="../assets/icons/export.svg"></div>
            <div>导出</div>
          </div>
        </div>
<!--        <el-upload-->
<!--                :auto-upload="false"-->
<!--                :on-change="elInFile"-->
<!--                multiple-->
<!--                accept="audio/*">-->
<!--          <el-button size="mini" icon="el-icon-upload2" round></el-button>-->
<!--        </el-upload>-->
      </div>
    </div>

    <div class="edit-block graph-area">
      <div class="title">
        知识结构
      </div>
      <el-tree :data="tree"
               :props="defaultProps">
      </el-tree>

    </div>
  </div>
</template>

<script>
import { mapState,mapMutations,mapActions } from 'vuex';
export default {
  name: "EditBar",
  data(){
    return{
      showEditBar: true,
      tree: [{
        label: '一级 1',
        children: [{
          label: '二级 1-1',
          children: [{
            label: '三级 1-1-1'
          }]
        }]
      }],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  computed: {
    ...mapState(['workspace_text', 'current_pid', 'workspace_text']),
    text: {
      get(){
        return this.workspace_text;
      },
      set(value){
        this.setWorkspaceText(value);
      }
    }
  },
  methods:{
    ...mapMutations(['setWorkspaceText','setProjectGraph']),
    ...mapActions(['postText']),
    analyse(){
      let data = {
        pid: this.current_pid,
        text: this.workspace_text
      }
      this.postText(data);
    },
    export_img(evt){
      alert("导出图片\n\n敬请期待~");
    },
    changeEditBarState(){
      this.showEditBar = !this.showEditBar;
    }
  },
  created() {
    //TODO: 将三元关系组转化成树
  }
}
</script>

<style lang="less">
@import "../assets/css/colors.less";
@len1 : 10px;
@len2 : 12px;
.edit-bar-container{
  position: fixed;
  top: 1%;
  right: 5px;
  height: 97.5%;
  display: flex;
  flex-direction: column;
  width: 350px;
  background: none;
}
.hideEditBarAni{
  animation-name: editBarAni;
  animation-duration: 0.3s;
  animation-timing-function: cubic-bezier(0.6, 0, 1.00, 1.0);
  animation-fill-mode: forwards;
}
@keyframes editBarAni {
  0%{ right: 5px; }
  100%{ right: -340px; }
}
.ShowEditBarAni{
  animation-name: editBarAni-reverse;
  animation-duration: 0.3s;
  animation-timing-function: cubic-bezier(0,0,0.8,1.0);
  animation-fill-mode: forwards;
}
@keyframes editBarAni-reverse {
  0%{ right: -340px; }
  100%{ right: 5px; }
}

.control-edit-bar{
  background: white;
  border-radius: 4px 0 0 4px;
  width: 20px;
  height: 60px;
  line-height: 60px;
  padding-left: 2px;
  position: absolute;
  top: 0;
  left: -20px;
  box-shadow:-40px 0 40px #e6e6e6;
  border-left: 3px solid @theme;
}
.control-edit-bar:hover{
  cursor: pointer;
}
.title{
  color: @theme;
  font-weight: bold;
  font-size: 15px;
  font-family: 微软雅黑;
  margin-bottom: @len1;
}
.edit-block{
  padding: @len2 @len2 18px @len2;
  margin-bottom: 5px;
  border-radius: 4px;
  background-color: white;
  box-shadow: -5px 0 10px #e6e6e6;
}
.analyse-btn-box{
  display: flex;
  flex-direction: row-reverse;
  .el-button{
    padding: @len1 2*@len1 @len1 2*@len1;
    font-size: 13px;
    min-height: 20px;
    width: 110px;
    margin: @len1 0 -@len1 0;
  }
}
.operations{
  display: flex;
  flex-wrap: wrap;
}
.op{
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border: none;
  font-family: 幼圆;
  color: #909399;
  font-weight: bold;
  font-size: 13px;
  padding: @len2;
  margin: 0 ;
  img{
    height: 25px;
    width: 25px;
  }
}
.op:hover{
  cursor: pointer;
  color: @orange;
}
.graph-area{
  flex-grow: 1;
}
</style>
