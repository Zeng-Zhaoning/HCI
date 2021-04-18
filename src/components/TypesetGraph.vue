<template>
  <edit-bar-block block-name="操作" class="typeset-edit-panel-box">
    <div class="operations">
      <op-item op-name="保存" icon="#iconsave" @click="typeset_save"></op-item>
      <op-item op-name="导出" icon="#iconshare" @click="exportPng(typeset_cy)"></op-item>
    </div>
  </edit-bar-block>
  <div id="typeset-graph"></div>
</template>

<script>
import cytoscape from 'cytoscape';
import compoundDragAndDrop from 'cytoscape-compound-drag-and-drop';
import {mapGetters, mapMutations, mapState} from "vuex";
import $ from "jquery";
import axios from "axios";
import tippy, {sticky} from "tippy.js";
import {setGraphAPI} from "@/api/basicAPI";
import EditBarBlock from "@/components/EditBar/EditBarBlock";
import OpItem from "@/components/EditBar/OpItem";

cytoscape.use(compoundDragAndDrop);

export default {
  name: "TypesetGraph",
  components:{EditBarBlock,OpItem},
  data(){
    return{
      cdnd: null, //拖拽工具句柄
      typeset_cy: null,
    }
  },
  computed:{
    ...mapState({
      cy: state => state.workspace.cy,
      nodeFontSize: state => state.workspace.nodeFontSize,
      nodeRadius: state => state.workspace.nodeRadius,
      defaultStyle: state => state.workspace.defaultStyle,
      shapeType: state => state.workspace.shapeType,
      lineStyleType: state => state.workspace.lineStyleType,
      current_pid: state => state.current_pid,
      current_project_info_change: state => state.current_project_change,
    }),
    ...mapGetters(['current_project']),
  },
  mounted() {
    let data = {
      edges: JSON.parse(JSON.stringify(this.current_project.edges)),
      nodes: JSON.parse(JSON.stringify(this.current_project.nodes)),
    };
    this.dataHandle(data);
  },
  watch:{
    current_project(now, old){
      console.log("current_project改动")
      let data = {
        edges: JSON.parse(JSON.stringify(this.current_project.edges)),
        nodes: JSON.parse(JSON.stringify(this.current_project.nodes)),
      };
      this.dataHandle(data);
    },
    current_project_change(now, old){
      console.log("current_project改动")
      let data = {
        edges: JSON.parse(JSON.stringify(this.current_project.edges)),
        nodes: JSON.parse(JSON.stringify(this.current_project.nodes)),
      };
      this.dataHandle(data);
    }
  },
  methods: {
    ...mapMutations(['updateProjectInfo']),
    getDataJsonObject(cy) {
      let eles = JSON.parse(JSON.stringify(cy.json().elements));//其实深拷贝可能没啥意义，只是单纯直觉上想用一用(*╹▽╹*)
      let obj = {"edges": [], "nodes": []};
      if (JSON.stringify(eles) !== '{}') {
        if (eles.edges !== undefined && eles.edges.length > 0) {
          eles.edges.forEach(val => {
            obj.edges.push({
              data: val.data
            });
          });
        }
        if (eles.nodes !== undefined && eles.nodes.length > 0) {
          eles.nodes.forEach(val => {
            obj.nodes.push({
              data: val.data,
              position: val.position
            });
          });
        }
      }
      return obj;
    },

    typeset_save(){
      let data = {
        ...this.current_project,
      }

      for (let node of data.nodes){
          let temp = this.typeset_cy.filter(function(element, i){
            return element.isNode() && element.data('id') === node.data.id;
          })[0];
          node.data.typeset.x = temp.position('x');
          node.data.typeset.y = temp.position('y');
          node.data.typeset.parent = temp.data('parent');
      }

      const loading = this.$loading({
        lock: true,
        text: '...保存中...',
        spinner: 'el-icon-loading',
        background: 'rgba(255, 255,255, 0.8)'
      });
      setGraphAPI(data).then(res => {
        if(res.success){
          this.updateProjectInfo(data);
          this.$message.success('保存成功');
        }else{
          this.$message.error( '保存失败')
        }
      }).catch( err => {
        this.$message.error('网络错误或服务器错误')
      }).finally(() => {
        loading.close();
      })
    },

    //最后去掉
    //读数据，然后交给dataHandle
    getData(url) {
      axios.get(url)
          .then(res => {
            this.dataHandle(res.data);
          })
          .catch(err => {
            console.error(err);
            this.$message.error('文件数据格式不正确');
          })
    },

    //在data中存数据，并进行数据展示的预处理
    dataHandle(data) {
      data.edges.forEach((val) => {
        val.classes = 'autorotate';
        val.data.type = val.data.type || 'default';
      })
      let default_color = "#9c8f96";//和add-node方法中初始化颜色耦合，必须同时修改
      data.nodes.forEach((val) => {
        val.data.type = val.data.type || 'default';
        val.data.color = val.data.color || default_color;//将颜色绑定在数据里，在workspace中修改为background-color:data(color),实现颜色持久化
        val.position.x = val.data.typeset.x === -1? val.position.x : val.data.typeset.x;
        val.position.y = val.data.typeset.y === -1? val.position.y : val.data.typeset.y;
      })
      let that = this;
      const loading = this.$loading({
        lock: true,
        text: '...加载中...',
        spinner: 'el-icon-loading',
        background: 'rgba(255, 255,255, 0.8)'
      });
      try{
        this.graph(that, data);
      }finally{
        this.$nextTick(() => {
          loading.close();
        });
      }
    },

    //让过长的内容作为展示的标题时省略
    fontShow(text) {
      if (text && text.length > 5) {
        return text.substring(0, 3) + "..."
      }
      return text
    },

    //根据内容设置字体大小，使之不会超出节点（未验证）
    //最好改成根据实体大小设置字体大小
    fontStyle(length,width) {
      if(this.nodeFontSize!==''){
        return {
          "font-size": this.nodeFontSize + "px"
        };
      }
      let defaultWidth = 30;
      let minWidth = 12;
      let fontSize = defaultWidth - (length - 2) * 6;//这个计算字体大小的算式可能有点拉胯，
      //根据节点大小调整文字大小
      let nodeWidth = width?width:defaultWidth;
      fontSize = fontSize*nodeWidth/defaultWidth;
      if (!fontSize || fontSize < minWidth) {//"!fontSize"有效吗，不懂诶
        fontSize = minWidth;
      }
      return {
        "font-size": fontSize + "px"
      };
    },

    //帮助node合适地展示text
    rendNode(target, that) {
      let data = target.data();
      const text = that.fontShow(data.name)

      //如果没有设定大小，就按照节点本身大小（节点大小不是时刻是设定大小吗？按现在的写法，我觉得新增的节点没有初始化到渲染到设定大小）
      let widthNow = this.nodeRadius===''?this.getNodeWidth(target):this.nodeRadius;

      widthNow = parseInt(widthNow+'');//确保是数字类型
      //获取节点宽度的数字值来调节字体大小
      let style = that.fontStyle(text.length,widthNow);

      style.shape = this.shapeType[data.type];
      style.label = text;
      if(this.nodeRadius!==''){//和EditBar中nodeRadius监听方法逻辑耦合，必须同时修改
        style.width = widthNow+'px';
        style.height = widthNow+'px';
      }
      target.style(style);
    },

    getNodeWidth(target){//返回值为数字类型
      let widthProp = target.style("width");
      let defaultWidth = 30;
      if(widthProp){
        return parseInt(widthProp.match(/(\S*)px/)[1]);//随便搜的，不知道有没有更好写法
      }else{
        return defaultWidth;
      }
    },

    rendEdge(target,that){
      let data = target.data();
      const text = that.fontShow(data.relation);
      target.style({label:text,'line-style':this.lineStyleType[data.type]});
    },

    graph(that, data) {
      let presetLayout = {
        name: 'preset',

        positions: undefined, // map of (node id) => (position obj); or function(node){ return somPos; }
        zoom: undefined, // the zoom level to set (prob want fit = false if set)
        pan: undefined, // the pan level to set (prob want fit = false if set)
        fit: true, // whether to fit to viewport
        padding: 30, // padding on fit
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled
        animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop
        transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
      };
      //console.log(data)
      let cy = cytoscape({
        container: $('#typeset-graph'),
        boxSelectionEnabled: false,
        autounselectify: false,
        style: this.defaultStyle,
        elements: data,
        hideLabelsOnViewPort: false,
        minZoom: 0.15,
        maxZoom: 8,
        wheelSensitivity: 0.1,   //warning
        layout: presetLayout
      });
      that.typeset_cy = cy;

      const options = {
        newParentNode: (grabbedNode, dropSibling) => ({}), // specifies element json for parent nodes added by dropping an orphan node on another orphan (a drop sibling)
        overThreshold: 20, // make dragging over a drop target easier by expanding the hit area by this amount on all sides
        outThreshold: 30 // make dragging out of a drop target a bit harder by expanding the hit area by this amount on all sides
      };
      that.cdnd = cy.compoundDragAndDrop(options);

      // //为了恢复打开时的布局而存的elements，目前用到的只有elements中nodes的id和position映射关系
      // //虽然完全可以只存这个map<id,position>，但为了可扩展性考虑暂时先存elements(扩展时可能也用不到hhh)
      // let elements = JSON.parse(JSON.stringify(this.cy.json().elements));//存入运行时的cy，确保都有id
      // this.setElements(elements);

      this.batch(cy,()=>{
        cy.nodes().forEach(val => {
          that.rendNode(val, that);
        });

        cy.edges().forEach(val => {
          that.rendEdge(val, that);
        });
      });


      cy.on('mouseover', 'node', event => {
        let target = event.target || event.cyTarget;
        // console.log("mouseover node: ",target);
        let data = target.data();
        const minSize = 48;//看起来可以的试验值，无特殊意义
        let fontSize = parseInt(target.style("font-size").match(/(\S*)px/)[1])*1.2;
        fontSize = fontSize<minSize?minSize:fontSize;
        target.style({label:data.name,fontSize: fontSize,'z-index':9999});
        if(!target.scratch('tip')){
          let text = "类型: "+data.type+'<br/>'+"属性: "+data.property.join(',');
          target.scratch('tip',that.makeTippy(target,text));
        }
        target.scratch('tip').show();
      })
          .on('mouseout', 'node', event => {
            let target = event.target || event.cyTarget;
            that.rendNode(target, that);
            if(target.scratch('tip')){
              target.scratch('tip').destroy();
              target.removeScratch('tip');
              // console.log(target.scratch());
            }
            target.style({'z-index':0});
          })
          //edge不能改变边的颜色，否则和选中机制冲突（那处也会改变颜色）
          .on('mouseover', 'edge', event => {
            let target = event.target || event.cyTarget;
            // console.log("mouseover edge: ",target);
            let data = target.data();
            //如果要改旋转，是"edge-text-rotation": "none"和"edge-text-rotation": "autorotate"
            target.style({label:data.relation,fontSize: 36, width: 6, color: '#bc5f6a','z-index':9999});//此数无意义，仅仅需要比rendNode最大label的36更大即可
            if(!target.scratch('tip')){
              let text = "类型: "+data.type;
              target.scratch('tip',that.makeTippy(target,text));
            }
            target.scratch('tip').show();
          })
          .on('mouseout', 'edge', event => {
            let target = event.target || event.cyTarget;
            that.rendEdge(target,that);
            target.style({fontSize: 24, width: 3, color: '#e3a6a1','z-index':0});//与上文edge的初始配置保持一致
            if(target.scratch('tip')){
              target.scratch('tip').destroy();
              target.removeScratch('tip');
              // console.log(target.scratch());
            }
          });


      let contextMenu = cy.contextMenus({
        menuItems: [
          {
            id: 'color-red',
            content: '红',
            selector: 'node',
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.data('color', '#e89d96');//颜色持久化
            },
          },
          {
            id: 'color-yellow',
            content: '黄',
            selector: 'node',
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.data('color', '#ebc57c');//颜色持久化
            },
          },
          {
            id: 'color-light-blue',
            content: '浅蓝',
            selector: 'node',
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.data('color', 'lightblue');//颜色持久化
            },
          },
          {
            id: 'color-blue-slate',
            content: '靛青',
            selector: 'node',
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.data('color', '#6a85ce');//颜色持久化
            }
          },
          {
            id: 'color-brown',
            content: '棕',
            selector: 'node',
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.data('color', '#9c8f96');//颜色持久化
            },
          },
        ],
      });
    },

    // **Allow for manipulation of elements without triggering multiple style calculations or multiple redraws.**
    batch(cy,func){
      cy.startBatch();
      func();
      cy.endBatch();
    },

    makeTippy(ele, text){//ele需传入cy的ele
      var ref = ele.popperRef();

      // Since tippy constructor requires DOM element/elements, create a placeholder
      var dummyDomEle = document.createElement('div');

      var tip = tippy( dummyDomEle, {
        getReferenceClientRect: ref.getBoundingClientRect,
        trigger: 'manual', // mandatory
        // dom element inside the tippy:
        content: function(){ // function can be better for performance
          var div = document.createElement('div');

          div.innerHTML = text;

          return div;
        },
        // your own preferences:
        arrow: true,
        placement: 'bottom',
        offset: [20, 30],
        hideOnClick: false,
        // enable it
        // sticky: true,
        // only check the "reference" rect for changes
        sticky: 'reference',
        // only check the "popper" rect for changes
        // sticky: 'popper',
        plugins: [sticky],
        zIndex: 10,//默认9999，修改小些避免遮住弹窗


        // if interactive:
        interactive: true,
        appendTo: document.body // or append dummyDomEle to document.body
      } );

      return tip;
    },


    exportPng(cy){
      this.$message.success("正在导出图片...");
      let blob = cy.png({
        output: 'blob-promise', bg: 'white',
        full: true, scale: 4
      });
      blob.then(res => {
        //创建下载链接
        let aLink = document.createElement('a');
        aLink.download = this.generateFileName() + '.png';
        let url = window.URL.createObjectURL(res);
        aLink.href = url;

        //创建、分配并触发点击事件
        let evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, true);
        aLink.dispatchEvent(evt);

        // 释放掉blob对象
        window.URL.revokeObjectURL(url);
      }).catch(err => {
        console.log("Error occured: ", err);
        if (cy.elements().length === 0) {
          this.$message.error("知识图谱已经空啦，导不出东西的呀");
        }
      });
    },

    generateFileName(){
      let name = "";
      try{
        name = this.current_project.project_name;
      }catch (e) {
        console.log("Error occurs:"+e);
        console.log("可能未连接到Server");
        name = new Date().getTime();
      }
      return name + '-排版';
    },
  }
}
</script>

<style scoped>
#typeset-graph{
  width: 100%;
  height: 100%;
}
.typeset-edit-panel-box{
  position: fixed;
  right: 5px;
  top: 1%;
  z-index: 100;
}
</style>