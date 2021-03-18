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
        <div class="op" @click="save">
          <div><img src="../../assets/icons/save.svg"></div>
          <div class="text-box">保存</div>
        </div>
        <div class="op" @click="changeExportState">
          <div class="img-box"><img src="../../assets/icons/export.svg"></div>
          <div class="text-box">导出</div>
          <div class="choose-format-box" :class="{collapsed:!showExportOps, expanded:showExportOps}">
            <div @click="exportPng" class="export-op">图片</div>
            <div class="separator"></div>
            <div @click="exportJson" class="export-op">json</div>
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



<script src="./EditBar.js"></script>

<style lang="less" src="./EditBar.less"></style>