<template>
  <div class="edit-bar-container" :class="{ hideEditBarAni: !showEditBar, ShowEditBarAni: showEditBar }">
    <el-tooltip
        effect="dark"
        content="工具栏"
        placement="left"
        :disabled="showEditBar"
      >
      <div class="control-edit-bar" @click="changeEditBarState">
        <i :class="{'el-icon-arrow-right': showEditBar, 'el-icon-arrow-left': !showEditBar}"></i>
        <!-- <div class="control-edit-bar-label">工具</div> -->
      </div>
    </el-tooltip>

    <div class="helper-edit-bar-container">
      <edit-bar-block block-name="操作">
       <el-popover
           placement="bottom"
           title="注意"
           :width="180"
           trigger="hover"
           :content="opInfo">
         <template #reference>
           <i class="el-icon-info op-info"></i>
         </template>
       </el-popover>
        <div class="operations">
<!--          <op-item op-name="新建" icon="#iconfile-open" @click="open">-->
<!--            <input type="file" class="choose-file" style="display: none" @change="getFilePath">-->
<!--          </op-item>-->
          <op-item op-name="保存" icon="#iconsave" @click="save"></op-item>
          <op-item op-name="导出" icon="#iconshare" @click="changeExportState">
            <div class="choose-format-box" :class="{collapsed:!showExportOps, expanded:showExportOps}">
              <div @click="exportPng" class="export-op">图片</div>
              <div class="separator"></div>
              <div @click="exportJson" class="export-op">json</div>
            </div>
          </op-item>
          <op-item op-name="智能问答" icon="#iconcomment" @click="changeShowQAPanel"></op-item>
          <op-item op-name="新手引导" icon="#iconxinshouyindao" @click="showGuide"></op-item>
        </div>
      </edit-bar-block>

      <edit-bar-block block-name="统计">
        <div class="table_name">| 节点</div>
        <el-table
            :data="entities_data"
            size="mini">
          <el-table-column prop="individual" label="个体" min-width="1"></el-table-column>
          <el-table-column prop="organization" label="团体" min-width="1"></el-table-column>
          <el-table-column prop="thing" label="事物" min-width="1"></el-table-column>
          <el-table-column prop="default" label="其他" min-width="1"></el-table-column>
          <el-table-column prop="total" label="合计" min-width="1"></el-table-column>
        </el-table>
        <div class="table_name">| 关系</div>
        <el-table
            :data="relations_data"
            size="mini"
        >
          <el-table-column prop="connection" label="关联" min-width="1"></el-table-column>
          <el-table-column prop="inheritance" label="继承" min-width="1"></el-table-column>
          <el-table-column prop="default" label="其他" min-width="1"></el-table-column>
          <el-table-column prop="total" label="合计" min-width="1"></el-table-column>
        </el-table>
      </edit-bar-block>

     <edit-bar-block block-name="过滤">
       <div class="item_title">| 滤去节点</div>
       <el-select
       v-model="filter_node_checkList"
       @change="nodeFilter"
       collapse-tags
       multiple
       placeholder="选择要滤去的节点类型"
       style="width: 100%"
       >
         <el-option v-for="item in nodeType" :key="item.value" :label="item.label" :value="item.value"></el-option>
       </el-select>
       <div class="item_title">| 滤去关系</div>
       <el-select v-model="filter_edge_checkList" @change="edgeFilter" collapse-tags multiple placeholder="选择要滤去的关系类型" style="width: 100%">
         <el-option v-for="item in edgeType" :key="item.value" :label="item.label" :value="item.value"></el-option>
       </el-select>
       <div class="btn-box2">
         <el-col :span="11">
           <my-button class="my-button" @click="edgeDefilter">还原关系</my-button>
         </el-col>
         <el-col :span="11">
           <my-button class="my-button" @click="nodeDefilter">还原节点</my-button>
         </el-col>
       </div>
     </edit-bar-block>
     <edit-bar-block block-name="视图调整">
       <div class="item_title">| 布局</div>
       <el-select v-model="layoutTypeNow" placeholder="请选择布局类型">
         <el-option
             v-for="type in layoutType"
             :key="type.value"
             :label="type.label"
             :value="type.value">
         </el-option>
       </el-select>
       <div class="item_title">| 关系显示</div>
       <el-radio-group v-model="relation_label_enabled">
         <el-radio :label="true">是</el-radio>
         <el-radio :label="false">否</el-radio>
       </el-radio-group>
       <div class="item_title">| 节点字体大小</div>
       <div>
         <el-slider :min="10" :max="100" v-model="font_size"></el-slider>
       </div>
       <div class="item_title">| 节点半径</div>
       <div>
         <el-slider :min="10" :max="100" v-model="node_radius"></el-slider>
       </div>
     </edit-bar-block>

    </div>
  </div>
</template>


<script src="./EditBar.js"></script>

<style lang="less" src="./EditBar.less"></style>
