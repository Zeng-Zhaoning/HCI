<template>
  <transition name="el-fade-in-linear">
    <div v-if="show_export_panel" class="cover-layer">我是遮罩层</div>
  </transition>
  <div class="export-panel-box">
    <i class="el-icon-close close" @click=""></i>
    <div>导出设置</div>
    <div class="fromat">格式</div>
    <div class="watermark">水印</div>
    <el-button type="primary" size="small">导出</el-button>
  </div>
</template>

<script>

import { mapState,mapMutations } from 'vuex';

export default {
  name: "ExportPanel",
  computed:{
    ...mapState({
      show_export_panel: state => state.workspace.show_export_panel,
    }),
  },
  methods: {

  }
}
</script>

<style scoped lang="less">
@import "../../assets/css/colors";
@pad: 20px;
.export-panel-box{
  width: 500px;
  height: 400px;
  background: white;
  padding: @pad;
  border-radius: 4px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 5001;
}
.cover-layer{
  width:100%;
  height:100%;
  background-color:#000;
  position:fixed;
  top:0;
  left:0;
  z-index:5000;
  opacity:0.2;
  /*兼容IE8及以下版本浏览器*/
  filter: alpha(opacity=30);
}
.close{
  color: @prompt;
  position: absolute;
  right: @pad;
  top: @pad;
}
.close:hover{
  cursor: pointer;
  color: @theme;
}
</style>