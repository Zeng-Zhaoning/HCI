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

<!--      <edit-bar-block style="height: 1000px"></edit-bar-block>-->

    <!--///////////////////////////////////此处为搜索相关代码段///////////////////////////////////////-->
      <edit-bar-block block-name="图谱搜索">
        <el-input
            class="el-input"
            clearable
            :rows="1"
            placeholder="请输入搜索内容"
            v-model="search_text">
        </el-input>
        <el-select v-model="search_type" clearable placeholder="请选择类型">
          <el-option
              v-for="type in types"
              :key="type.value"
              :label="type.label"
              :value="type.value">
          </el-option>
        </el-select>
        <el-input
            class="el-input"
            clearable
            :rows="1"
            placeholder="请输入搜索属性"
            v-model="select_value">
        </el-input>
        <div class="analyse-btn-box">
          <el-button @click="search">搜索</el-button>
          <el-button v-show="showEnabled" @click="desearch">取消</el-button>
        </div>
      </edit-bar-block>
    <!--/////////////////////////////////////////////////////////////////////////////////////////-->

    <!--/////////////////////////////////////此处为过滤相关////////////////////////////////////////-->
      <edit-bar-block block-name="节点过滤">
        <el-checkbox v-model="filter_node_checked">节点</el-checkbox>
        <el-checkbox-group v-model="filter_node_checkList" :disabled="node_checkList_disabled">
          <el-checkbox label="individual">个体</el-checkbox>
          <el-checkbox label="organization">团体</el-checkbox>
          <el-checkbox label="thing">事务</el-checkbox>
          <el-checkbox label="default">未知</el-checkbox>
        </el-checkbox-group>
        <el-checkbox v-model="filter_edge_checked">关系</el-checkbox>
        <el-checkbox-group v-model="filter_edge_checkList" :disabled="edge_checkList_disabled">
          <el-checkbox label="connection">关联</el-checkbox>
          <el-checkbox label="inheritance">继承</el-checkbox>
          <el-checkbox label="default">未知</el-checkbox>
        </el-checkbox-group>
        <div class="analyse-btn-box">
          <el-button @click="filter">过滤</el-button>
          <el-button @click="defilter" v-show="filterShowEnabled">撤销</el-button>
        </div>
      </edit-bar-block>
    <!--////////////////////////////////////////////////////////////////////////////////////////-->

      <!--///////////////////////////////////////展示效果调节////////////////////////////////////-->

      <!--////////////////////////////////////////////////////////////////////////////////////-->
  </div>
  </div>
</template>


<script src="./EditBar.js"></script>

<style lang="less" src="./EditBar.less"></style>
