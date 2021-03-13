<template class="container">
  <div class="container">
    <div class="edit-text">
      <div class="title">
        文本
      </div>
      <el-input
          type="textarea"
          :rows="4"
          placeholder="请输入待解析文本"
          v-model="textarea">
      </el-input>
    </div>

    <div class="show-operations">
      <div class="title">
        操作
      </div>
      <div class="operations">
        <div class="op">
          <img src="../assets/icons/export.svg" alt="导出">
          <div class="op-name">导出</div>
        </div>
      </div>
    </div>

    <div class="show-structure">
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
  }
}
</script>

<style scoped>
.container{
  display: flex;
  flex-direction: column;
  width: 350px;
  border: 2px solid blue;
}
</style>