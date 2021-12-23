<template>
  <div class="work-space-container" id="work-space">

    <component :is="current_graph_component"></component>

    <keep-alive>
      <component :is="current_edit_component"></component>
    </keep-alive>

    <div class="view-ops">
      <el-tooltip effect="light" content="返回初始位置" placement="right" :enterable="false">
        <div class="view-op" @click="back2Init" v-show="isEditMode">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icondingwei"></use>
          </svg>
        </div>
      </el-tooltip>
      <div class="view-op" @mouseover="showChangeMode" @mouseout="showChangeMode">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconqiehuan1"></use>
        </svg>
        <div class="choose-mode-box" :class="{'collapsed':!ifShowChangeMode, 'expanded':ifShowChangeMode}">
          <div @click="changeMode('edit')" class="mode-op" :class="{'mode-chosen':isEditMode}">
            <svg class="icon dot" aria-hidden="true">
              <use xlink:href="#icondian"></use>
            </svg>
            编辑
          </div>
          <div class="separator"></div>
          <div @click="changeMode('typeset')" class="mode-op" :class="{'mode-chosen':isTypesetMode}">
            <svg class="icon dot" aria-hidden="true">
              <use xlink:href="#icondian"></use>
            </svg>
            排版
          </div>
        </div>
      </div>
    </div>
    <q-a-panel class="qa-panel" v-show="showQAPanel"></q-a-panel>
  </div>
</template>

<script>
import {mapState} from "vuex";
import axios from "axios";
import EditBar from "./EditBar/EditBar.vue";
import kgTemplate from "./CytoscapeKG";
import TypesetGraph from "@/components/TypesetGraph";
import QAPanel from "@/components/QAPanel";

export default {
  name: "WorkSpace",
  components: {QAPanel, EditBar,kgTemplate,TypesetGraph},
  data(){
    return {
      ifShowChangeMode: false,
      mode: 'edit', //'typeset'
      initZoom: 0,
      initPan: {},
    }
  },
  computed: {
    ...mapState({
      cy: state => state.workspace.cy,
      showQAPanel: state => state.workspace.showQAPanel,
    }),
    isEditMode(){return this.mode === 'edit';},
    isTypesetMode(){return this.mode === 'typeset';},
    current_graph_component(){
      if (this.mode === 'typeset'){return 'typeset-graph';}
      else if(this.mode === 'edit'){return 'kg-template'}
    },
    current_edit_component(){
      if (this.mode === 'typeset'){return 'typeset-edit-panel';}
      else if(this.mode === 'edit'){return 'edit-bar'}
    }
  },
  mounted() {
    let qaPanel = document.getElementsByClassName('qa-panel')[0];
    let qaPanelTitle = qaPanel.getElementsByClassName('title-box')[0];
    let x = 0;
    let y = 0;
    let l = 0;
    let t = 0;
    let isDown = false;
    //鼠标按下事件
    qaPanelTitle.onmousedown = function(e) {
      //获取x坐标和y坐标
      x = e.clientX;
      y = e.clientY;

      //获取左部和顶部的偏移量
      l = qaPanel.offsetLeft;
      t = qaPanel.offsetTop;
      //开关打开
      isDown = true;
      //设置样式
      qaPanelTitle.style.cursor = 'move';
    }
    //鼠标移动
    window.onmousemove = function(e) {
      if (isDown == false) {
        return;
      }
      //获取x和y
      let nx = e.clientX;
      let ny = e.clientY;
      //计算移动后的左偏移量和顶部的偏移量
      let nl = nx - (x - l);
      let nt = ny - (y - t);

      qaPanel.style.left = nl + 'px';
      qaPanel.style.top = nt + 'px';
    }
    //鼠标抬起事件
    qaPanel.onmouseup = function() {
      //开关关闭
      isDown = false;
      qaPanel.style.cursor = 'default';
    }
  },
  watch: {
    json_src_path(now, old) {
      axios.get(now)
          .then(res => {
            this.dataHandle(res.data)
          })
          .catch(err => {})
    },
    cy(newValue, oldValue){
      this.initZoom = newValue._private.zoom;
      let p_pan = this.cy._private.pan
      this.initPan = {x: p_pan.x, y: p_pan.y};
    }
  },
  methods: {
    back2Init(){
      this.cy.viewport({
        zoom: this.initZoom,
        pan: this.initPan,
      })
    },

    showChangeMode(e){
      this.ifShowChangeMode = ! this.ifShowChangeMode;
    },
    changeMode(mode){
      let dom = document.getElementsByClassName('choose-mode-box')[0];
      dom.classList.remove('expanded');
      dom.classList.add('hide');
      this.mode = mode;
    }
  }
}
</script>

<style scoped lang="less">
@import "../assets/css/colors.less";
.work-space-container{
  height: 100%;
  position: relative;
  overflow: hidden;
}
.view-ops{
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 20px 15px;
}
.view-op{
  position: relative;
  height: 40px;
  width: 40px;
  border: 1px solid #e6e6e6;
  background-color: rgba(255,255,255,0.8);
  border-radius: 4px;
  box-shadow: 0 0 10px #e6e6e6;
  margin-top: 5px;
}
.view-op > svg{
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  width: 70%;
  height: 70%;
}
.view-op:hover{
  cursor: pointer;
  background-color: rgba(255,255,255,1);
}

@len3: 40px;
.choose-mode-box{
  background-color: white;
  transform: translate3d(0,0,0);  //硬件加速
  height: @len3;
  width: (@len3+20px) * 2;
  border: 1px solid @separator;
  border-radius: 4px;
  border-left: none;
  position: absolute;
  left: @len3 + 3px;
  display: flex;
  flex-direction: row;
  align-items: center;
  z-index: 1;
  overflow: hidden;
}
.mode-op{
  background-color: white;
  height: @len3;
  flex-grow: 1;
  line-height: @len3;
  //width: @len3+20px;
  text-align: center;
  color: @prompt;
  font-size: 13px;
}
.mode-op:hover{
  background-color: #f0f7ff;
  color: @theme;
}
.collapsed {
  transition: max-width 0.35s cubic-bezier(0, 1, 0, 1);
  max-width: 0;
  border: none;
}
.expanded {
  max-width: 999px;
  transition: max-width 0.35s cubic-bezier(0.75, 0, 0.9, 0);
}
.hide{
  max-width: 0;
  border-right: none;
}
.separator{
  height: 20px;
  width: 1px;
  background-color: @separator;
}
.dot{
  height: 5px;
  width: 5px;
  margin: 2px 0;
  display: none;
}
.mode-chosen{
  color: @theme;
  .dot{
    display: inline;
  }
}

.qa-panel{
  position: absolute;
  top: 50%;
  right: 320px;
  transform: translateY(-50%);
  background-color: white;
}


</style>
