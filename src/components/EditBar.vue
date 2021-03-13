<template class="container">
  <div class="container">
    <div class="edit-block">
      <div class="title">
        待解析文本
      </div>
      <el-input
          class="el-input"
          type="textarea"
          :rows="6"
          placeholder="请输入待解析文本"
          v-model="textarea">
      </el-input>
    </div>

    <div class="edit-block">
      <div class="title">
        操作
      </div>
      <div class="operations">
        <div class="op" @click="export_img">
          <div>
            <img src="../assets/icons/export.svg" alt="导出">
          </div>
          <div class="op-name">导出</div>
        </div>
      </div>
    </div>

    <div class="edit-block graph-area">
      <div class="title">
        知识结构
      </div>
      <el-tree :data="data"
               :props="defaultProps">
      </el-tree>

    </div>
  </div>
</template>

<script>
export default {
  data(){
    return{
      data: [{
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
  name: "EditBar",
  methods:{
    export_img(){
      alert("导出图片");
    }
  }
}
</script>

<style scoped lang="less">
@import "../assets/css/colors.less";
@len1 : 10px;
@len2 : 12px;
.container{
  position: fixed;
  top: 1%;
  right: 5px;
  height: 97.5%;
  display: flex;
  flex-direction: column;
  width: 350px;
  background: none;
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
  box-shadow: 0 0 10px #e6e6e6;
}
.operations{
  display: flex;
  flex-wrap: wrap;
  padding: 5px @len1 0 10px;
}
.op{
  width: 40px;
  text-align: center;
  img{
    height: 25px;
    width: 25px;
  }
  .op-name{
    font-size: 13px;
    text-align: center;
    color: #909399;
    font-family: 幼圆;
    font-weight: bold;
  }
  :hover{
    cursor:pointer;
  }
}

.graph-area{
  flex-grow: 1;
}
</style>