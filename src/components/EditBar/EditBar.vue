<template>
  <div class="edit-bar-container" :class="{ hideEditBarAni: !showEditBar, ShowEditBarAni: showEditBar }">
    <div class="control-edit-bar" @click="changeEditBarState">
      <i :class="{'el-icon-arrow-right': showEditBar, 'el-icon-arrow-left': !showEditBar}"></i>
    </div>

    <div class="helper-edit-bar-container">
      <edit-bar-block block-name="操作">
        <el-popover
            placement="bottom"
            title="操作说明"
            :width="180"
            trigger="hover"
            :content="opInfo">
          <template #reference>
            <i class="el-icon-info op-info"></i>
          </template>
        </el-popover>
        <div class="operations">
          <op-item op-name="打开" icon="#iconfile-open" @click="open">
            <input type="file" class="choose-file" style="display: none" @change="getFilePath">
          </op-item>
          <op-item op-name="保存" icon="#iconsave" @click="save"></op-item>
          <op-item op-name="导出" icon="#iconshare" @click="changeExportState">
            <div class="choose-format-box" :class="{collapsed:!showExportOps, expanded:showExportOps}">
              <div @click="exportPng" class="export-op">图片</div>
              <div class="separator"></div>
              <div @click="exportJson" class="export-op">json</div>
            </div>
          </op-item>
        </div>
      </edit-bar-block>

      <edit-bar-block block-name="待解析文本">
        <el-input
            disabled
            class="el-input"
            type="textarea"
            :rows="6"
            placeholder="请输入待解析文本"
            v-model="text">
        </el-input>
        <div class="analyse-btn-box">
          <el-button disabled :loading="false" @click="saveAndAnalyse">保存并解析</el-button>
        </div>
      </edit-bar-block>

      <edit-bar-block block-name="统计">
        <div class="table_name">| 实体</div>
        <el-table
            :data="entities_data"
            size="mini">
          <el-table-column prop="individual" label="个体" min-width="1"></el-table-column>
          <el-table-column prop="organization" label="团体" min-width="1"></el-table-column>
          <el-table-column prop="thing" label="事物" min-width="1"></el-table-column>
          <el-table-column prop="default" label="未知" min-width="1"></el-table-column>
          <el-table-column prop="total" label="合计" min-width="1"></el-table-column>
        </el-table>
        <div class="table_name">| 关系</div>
        <el-table
            :data="relations_data"
            size="mini"
        >
          <el-table-column prop="connection" label="关联" min-width="1"></el-table-column>
          <el-table-column prop="inheritance" label="继承" min-width="1"></el-table-column>
          <el-table-column prop="default" label="未知" min-width="1"></el-table-column>
          <el-table-column prop="total" label="合计" min-width="1"></el-table-column>
        </el-table>
      </edit-bar-block>

      <edit-bar-block style="height: 1000px"></edit-bar-block>
    </div>

  </div>
</template>


<script src="./EditBar.js"></script>

<style lang="less" src="./EditBar.less"></style>
