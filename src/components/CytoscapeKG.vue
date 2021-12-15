<template>
    <div class='knowledge-graph-cy'>
        <div id="graph">
          <el-dialog title="信息完善" v-model="addFormVisible" :before-close="handleClose" :append-to-body="true"><!--:append-to-body保证了弹窗时周围背景不能触发事件-->
                <el-form :model="form" :rules="rules" ref="ruleForm" :label-width="formLabelWidth" class="demo-ruleForm"><!-- class="demo-ruleForm"意义何在？-->
                    <el-form-item label="名称" prop="name" required>
                        <el-input v-model="form.name" autocomplete="off" style="width:90%"></el-input>
                    </el-form-item>
                    <el-form-item label="类型" prop="type">
                        <el-select v-model="form.type" placeholder="请选择类型" style="width:90%">
                            <el-option v-for="item in givenType" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="属性" prop="property" v-if="node0Edge1===0">
                        <el-select
                                v-model="form.property"
                                style="width:90%"
                                multiple
                                filterable
                                allow-create
                                default-first-option
                                no-data-text="输入已存在的属性会取消勾选哦"
                                placeholder="在这里可以输入属性哦">
                        </el-select>
                    </el-form-item>

                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="addCancel">取 消</el-button>
                        <el-button type="primary" @click="addConfirm">确 定</el-button>
                    </span>
                </template>
            </el-dialog>
        </div>

    </div>
</template>

<script>
    //注意！！！
    //所有对property的处理都标注了注释：property处理

    //日后修改：
    //颜色改变增加调色板选项
    //颜色的存储可以放在data（大小同理），读取时在渲染函数中访问data中相应字段来渲染，但是在其他样式与颜色解耦之前无意义（例：会把选中状态之类的颜色存进去）
    //边的添加和修改增加source和target的可修改功能
    //eles.hasClass()和.addClass()帮助edge把class属性的添加移动到rendEdge里
    //ele.isNode()帮助add等方法优化group==='nodes'的逻辑
    //node0Edge1这个属性换成字符串
    // 宽高修改逻辑暂时在EditBar，考虑这个样式的职责要不要放在本KG组件的updataAllNodeFontSize（到时候再改个方法名表示同时修改节点大小和字体大小）
    //考虑引入https://github.com/kaluginserg/cytoscape-node-html-label
    //cola布局挺好的感觉，有空加一下
    import axios from 'axios'
    import $ from 'jquery'
    import cytoscape from 'cytoscape'
    import { mapState,mapMutations,mapGetters } from 'vuex';

    import d3Force from 'cytoscape-d3-force';
    cytoscape.use( d3Force );

    import contextMenus from 'cytoscape-context-menus';
    cytoscape.use(contextMenus);

    import popper from 'cytoscape-popper';
    cytoscape.use( popper );
    import tippy,{sticky} from 'tippy.js';
    import 'tippy.js/dist/tippy.css';

    window.jQuery = window.$ = $

    export default {
        name: 'CytoscapeKG',
        data() {
              let nameCheck = (rule,value,callback) => {
                  console.log('nameCheck');
                  let validName = value.trim();
                  if(this.form.nameNow&&this.form.nameNow===validName){
                      return callback();
                  }
                  let nameValid = /\S/;
                  if(!nameValid.test(validName)){//可添加正则表达式等逻辑
                      return callback(new Error('名称不能为空哟'));
                  }
                  if(this.node0Edge1===0){
                      if(this.isUnique(this.cy.nodes(),val=>val.data("name"),validName)){
                          callback();
                      }else {
                          callback(new Error('该实体已存在哦，换一个名字吧，亲~'));
                      }
                  }else{
                      let {source,target} = this.form.edgeCondition;
                      let dupEdges = this.cy.edges().filter(val=>val.data("source")===source).filter(val=>val.data("target")===target);
                      if(dupEdges.length===0||this.isUnique(dupEdges,val=>val.data("relation"),validName)){
                          callback();
                      }else{
                          callback(new Error('该关系已存在哦，换一个名字吧，亲~'));
                      }
                  }

            };
            //property处理
            // let propLenCheck = (rule,value,callback) => {
            //     console.log('propLenCheck');
            //     let len = 0;
            //     const limit = 255;
            //     let invalid = false;
            //     let errorReg = /\s/;
            //     for(let i = 0;i < value.length;i++){
            //         if(errorReg.test(value[i])){
            //             invalid = true;
            //             break;
            //         }
            //         len += value[i]+1;
            //     }
            //     len-=1;
            //     if(invalid){
            //         callback(new Error("属性中不能含有空哟~"));
            //     }else if(len>limit){
            //         callback(new Error("属性值数据量太大啦，麻烦去掉长度过长的属性哟~"));
            //     }else{
            //         callback();
            //     }
            // };
            return {
                node0Edge1: 0,
                // editMode: false,
                addFormVisible : false,
                givenType: [],
                form: {
                    name: '',
                    type: '',
                    property: [],
                    edgeCondition:{source:'',target:''},
                    //以下为借用form的reset来自动清空的属性
                    nameNow: '',
                    formCallback: ()=>{console.log("this.form.formCallback被意外调用")}
                },//此处的值会作为初始值存在，在this.$refs['ruleForm'].resetFields()后会恢复成初始值
                rules:{
                    name:[
                        {validator:nameCheck, trigger:'blur'}
                    ],
                    type:[//如果设置了初始值，这里就不会被用到
                        {required:true,message:'请选择类型',trigger:'change'}
                    ],
                    //property处理
                    // property:[
                    //     {validator:propLenCheck,trigger:'change'}
                    // ]
                },
                formLabelWidth: '12%'
                // 自定义校验 callback 必须被调用。 更多高级用法可参考 async-validator
                // https://github.com/yiminghe/async-validator
            };
        },

        computed: {
            ...mapState({
                defaultStyle: state => state.workspace.defaultStyle,
                shapeType: state => state.workspace.shapeType,
                lineStyleType: state => state.workspace.lineStyleType,
                nodeType: state => state.workspace.nodeType,
                edgeType: state => state.workspace.edgeType,
                cy: state => state.workspace.cy,
                nodeRadius: state => state.workspace.nodeRadius,
                nodeFontSize: state => state.workspace.nodeFontSize,
                json_src_path: state => state.workspace.json_src_path,
                project: state => state.project,
            }),
        },
        watch: {
            json_src_path(now, old){
                this.getData(now);
            },
            project(now, old){
              let data = {
                edges: JSON.parse(JSON.stringify(this.project.edges)),
                nodes: JSON.parse(JSON.stringify(this.project.nodes)),
              };
              this.dataHandle(data);
            },
            nodeFontSize(now,old){//监听节点大小变化，如果刚变为未设定就需要修改节点字体大小
                console.log("nodeFontSize watched")
                if(this.nodeFontSize===''){
                    this.updateAllNodeFontSize();
                }
            },
            nodeRadius(now,old){//监听节点大小来改变文字大小，但是字体大小如果处于被设定状态就不能改
                console.log("nodeRadius watched")
                if(this.nodeFontSize===''){
                    this.updateAllNodeFontSize();
                }
            }
        },
        mounted () {
            //禁用右键菜单（应该防止浏览器菜单行为干扰cy的菜单行为）
            // document.oncontextmenu = () => {
            //     event.returnValue = false;
            // }
            console.log("mounted cytoscapeKG.vue");
            if (this.project !== undefined && this.project !== null){
              let data = {
                edges: this.project.edges,
                nodes: this.project.nodes,
              };
              this.dataHandle(data);
            }
        },
        methods: {
            ...mapMutations(['setCy','setElements','trigger_statistic_data_change', 'setProject']),

            //读数据，然后交给dataHandle
            getData(url) {
                axios.get(url)
                    .then(res => {
                        this.dataHandle(res.data);
                        this.setProject(res.data);
                    })
                    .catch(err => {
                        console.error(err);
                        this.$message.error('文件数据格式不正确');
                    })
            },

            //在data中存数据，并进行数据展示的预处理
            dataHandle(data) {
                // this.data = JSON.parse(JSON.stringify(data))
                data.edges.forEach((val) => {
                    val.classes = 'autorotate';
                    val.data.type = val.data.type || 'default';
                })
                let default_color = "#9c8f96";//和add-node方法中初始化颜色耦合，必须同时修改
                data.nodes.forEach((val) => {
                    val.data.type = val.data.type || 'default';
                    val.data.color = val.data.color || default_color;//将颜色绑定在数据里，在workspace中修改为background-color:data(color),实现颜色持久化
                    val.data.typeset = val.data.typeset || {x: -1, y: -1, parent: ''};
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

            updateAllNodeFontSize(){
                //宽高修改逻辑暂时在EditBar，感觉这个样式的职责应该放在KG组件
                //由于宽高修改在EditBar，此处默认NodeRadius如果已设定那就已经更新到全部节点了，例外情况已在rendNode中考虑
                //此处为了防止多做操作就没有调用rendNode，结果是逻辑一部分和rendNode重复，形成重复耦合
                let that = this;
                let cy = that.cy;
                that.batch(cy,()=>{
                    cy.nodes().forEach(val => {
                        let widthNow = that.getNodeWidth(val);//默认NodeRadius如果被设置则节点属性已经更新到和它一样
                        let nameShown = val.style("label");
                        let style = that.fontStyle(nameShown.length,widthNow);
                        val.style(style);
                    });
                });
            },

            rendEdge(target,that){
                let data = target.data();
                const text = that.fontShow(data.relation);
                target.style({label:text,'line-style':this.lineStyleType[data.type]});
                // const style = that.fontStyle(text.length);
                // target.style(style);
                // target.addClass('autorotate');
            },

            //作图有关的设置
            graph(that, data) {
                let bfLayout = {
                    name: 'breadthfirst',
                        minDist: 40,
                        fit: true,
                        padding: 30,
                        boundingBox: undefined,
                        animate: false,
                        animationDuration: 500,
                        animationEasing: undefined,
                        animateFilter: function (node, i) {
                        return true;
                    },
                    ready: undefined,
                        stop: undefined,
                        transform: (node, position) => {
                        return position
                    }
                };
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
                let cy = cytoscape({
                    container: $('#graph'),
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
                this.setCy(cy);
                //为了恢复打开时的布局而存的elements，目前用到的只有elements中nodes的id和position映射关系
                //虽然完全可以只存这个map<id,position>，但为了可扩展性考虑暂时先存elements(扩展时可能也用不到hhh)
                let elements = JSON.parse(JSON.stringify(this.cy.json().elements));//存入运行时的cy，确保都有id
                this.setElements(elements);

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
                        let text = "类型: "+data.type+'<br/>'+"属性: " +'<br/>' + this.property2String(data.property)
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
                    })

                // 绑定右键单击的事件
                const barHandler = event => {
                    if (allSelected('node')) {
                        contextMenu.hideMenuItem('select-all-nodes');
                        contextMenu.showMenuItem('unselect-all-nodes');
                    } else {
                        contextMenu.hideMenuItem('unselect-all-nodes');
                        contextMenu.showMenuItem('select-all-nodes');
                    }
                    if (allSelected('edge')) {
                        contextMenu.hideMenuItem('select-all-edges');
                        contextMenu.showMenuItem('unselect-all-edges');
                    } else {
                        contextMenu.hideMenuItem('unselect-all-edges');
                        contextMenu.showMenuItem('select-all-edges');
                    }

                };
                cy.on('cxttap', barHandler);  //cxttap为右键单击

                const allSelected = function (type) {
                    if (type === 'node') {
                        return cy.nodes().length === cy.nodes(':selected').length;
                    } else if (type === 'edge') {
                        return cy.edges().length === cy.edges(':selected').length;
                    }
                    return false;
                };
                const selectAllOfTheSameType = function (type) {
                    if (type === 'node') {
                        cy.nodes().select();
                    } else if (type === 'edge') {
                        cy.edges().select();
                    }
                };
                const unselectAllOfTheSameType = function (type) {
                    if (type === 'node') {
                        cy.nodes().unselect();
                    } else if (type === 'edge') {
                        cy.edges().unselect();
                    }
                };


                let removed = [];  //为了撤销删除而使用的缓存，以后可以改成恢复多次

                let contextMenu = cy.contextMenus({
                    menuItems: [
                        {
                            id: 'edit',
                            content: '编辑',
                            selector: 'node, edge',
                            hasTrailingDivider: false,
                            onClickFunction: function (event) {
                                let target = event.target || event.cyTarget;
                                const group = target.group()
                                const data = target.data()

                                const name = group === 'nodes' ? 'name' : 'relation'
                                if(group==='nodes'){//property处理
                                    that.node0Edge1 = 0;
                                    that.givenType = that.nodeType;
                                    that.form.property = that.propertyToArray(data.property);
                                }else{
                                    that.node0Edge1 = 1;
                                    that.givenType = that.edgeType;
                                }
                                that.form.nameNow = that.form.name = data[name];
                                that.form.type = data.type;
                                that.addFormVisible = true;
                                that.form.formCallback = addForm => {
                                    console.log("before edit: target", target);
                                    let obj = {
                                        [name]: addForm.name,
                                        type: addForm.type,
                                    };
                                    if(group==='nodes'){//property处理
                                        obj.property = that.arrayToProperty(addForm.property);
                                    }
                                    target.data(obj);
                                    let conflict = false;
                                    if (group==='nodes') {
                                        that.rendNode(target, that);
                                        for(let i=0;i<removed.length;i++){
                                            let val = removed[i];
                                            if(val.group()==='nodes'&&val.data(name)===addForm.name){
                                                conflict = true;
                                                break;
                                            }
                                        }
                                    }else{
                                        that.rendEdge(target,that);
                                        for(let i=0;i<removed.length;i++){
                                            let val = removed[i];
                                            let valData = val.data();
                                            if(val.group()==='edges'
                                                &&valData.source===data.source
                                                &&valData.target===data.target
                                                &&valData[name]===addForm.name){
                                                conflict = true;
                                                break;
                                            }
                                        }
                                    }
                                    if(conflict){
                                        console.log("conflict in removed, delete it all");
                                        contextMenu.hideMenuItem('undo-last-remove');
                                        removed = [];
                                    }
                                    console.log("after edit: target", target);
                                };
                            }
                        },
                        {
                          id: 'color',
                          content: '颜色',
                          selector: 'node',
                          hasTrailingDivider: true,
                          submenu: [
                            {
                              id: 'color-red',
                              content: '红',
                              onClickFunction: function (event) {
                                let target = event.target || event.cyTarget;
                                target.data('color', '#e89d96');//颜色持久化
                              },
                            },
                            {
                              id: 'color-yellow',
                              content: '黄',
                              onClickFunction: function (event) {
                                let target = event.target || event.cyTarget;
                                target.data('color', '#ebc57c');//颜色持久化
                              },
                            },
                            {
                              id: 'color-light-blue',
                              content: '浅蓝',
                              onClickFunction: function (event) {
                                let target = event.target || event.cyTarget;
                                target.data('color', 'lightblue');//颜色持久化
                              },
                            },
                            {
                                id: 'color-blue-slate',
                                content: '靛青',
                                onClickFunction: function (event) {
                                  let target = event.target || event.cyTarget;
                                  target.data('color', '#6a85ce');//颜色持久化
                                }
                            },
                            {
                              id: 'color-brown',
                              content: '棕',
                              onClickFunction: function (event) {
                                let target = event.target || event.cyTarget;
                                target.data('color', '#9c8f96');//颜色持久化
                              },
                            },
                          ]
                        },
                        {
                            id: 'undo-last-remove',
                            content: '撤销最近一次删除',
                            selector: 'node, edge',
                            show: false,
                            coreAsWell: true,
                            onClickFunction: function (event) {
                                if (removed) {
                                    console.log("before undoing remove: nodeCount", cy.nodes().length);
                                    console.log("before undoing remove: edgeCount", cy.edges().length);
                                    removed.restore();
                                    removed = [];
                                    console.log("after undoing remove: nodeCount", cy.nodes().length);
                                    console.log("after undoing remove: edgeCount", cy.edges().length);
                                }

                                that.trigger_statistic_data_change();
                                contextMenu.hideMenuItem('undo-last-remove');
                            }
                        },
                        {
                            id: 'add-node',
                            content: '实体',
                            image: {src: "/icons/add.svg", x: 7, y: 8}, // menu icon
                            coreAsWell: true,
                            hasTrailingDivider: true,
                            onClickFunction: function (event) {
                                that.node0Edge1 = 0;
                                that.givenType = that.nodeType;
                                that.addFormVisible = true;
                                let pos = event.position || event.cyPosition;
                                let newObj = {
                                    group: 'nodes',
                                    position: {
                                        x: pos.x,
                                        y: pos.y
                                    }
                                };
                                that.form.formCallback = addForm => {
                                    let default_color = "#9c8f96";
                                    newObj.data = {
                                        name:addForm.name,
                                        type:addForm.type,
                                        color:default_color,//和初始化时的颜色耦合，必须是相同的default_color
                                        property:that.arrayToProperty(addForm.property)//property处理
                                    };
                                    let collection = cy.add(newObj);
                                    that.rendNode(collection[0], that);
                                    that.trigger_statistic_data_change();
                                };
                            }
                        },
                        {
                            id: 'add-edge',
                            content: '关系',
                            selector: 'node',
                            image: {src: "/icons/add.svg", x: 7, y: 8}, // menu icon
                            onClickFunction: function (event) {
                                let starget = event.target || event.cyTarget;
                                let color_before = starget.style('background-color');
                                // starget.style({
                                //     //"border-width": 4,
                                //     //"border-color": "#847072",
                                //     "background-color": '#dcc1b0',
                                //     //'text-outline-color': "#847072",
                                //     //'text-outline-width': 4,
                                // });
                                starget.data("color",'#dcc1b0');//颜色持久化
                                let sid = starget.data("id");
                                cy.once('tap', event => {
                                    console.log("start adding an edge");
                                    let ttarget = event.target || event.cyTarget;
                                    if (ttarget !== cy && ttarget.group() === 'nodes') {
                                        let tid = ttarget.data("id");
                                        that.node0Edge1 = 1;
                                        that.givenType = that.edgeType;
                                        that.form.edgeCondition = {source:sid,target:tid};
                                        that.addFormVisible = true;
                                        let newEdge = {
                                            group: 'edges',
                                            classes: 'autorotate'
                                        };
                                        that.form.formCallback = addForm => {
                                            newEdge.data = {
                                                relation: addForm.name,
                                                source: addForm.edgeCondition.source,
                                                target: addForm.edgeCondition.target,
                                                type: addForm.type
                                            };
                                            let collection = cy.add(newEdge);
                                            that.rendEdge(collection[0], that);
                                            that.trigger_statistic_data_change();
                                        };
                                    }
                                    starget.data({'color': color_before});//颜色持久化
                                });
                            }
                        },
                        {
                            id: 'remove',
                            content: '删除',
                            hasTrailingDivider: true,
                            image: {src: "/icons/remove.svg", x: 7, y: 8}, // menu icon
                            selector: 'node, edge',
                            onClickFunction: function (event) {
                                let target = event.target || event.cyTarget;
                                console.log("before remove: nodeCount", cy.nodes().length);
                                console.log("before remove: edgeCount", cy.edges().length);
                                removed = target.remove();
                                console.log("after remove: nodeCount", cy.nodes().length);
                                console.log("after remove: edgeCount", cy.edges().length);

                                that.trigger_statistic_data_change();
                                contextMenu.showMenuItem('undo-last-remove');
                            }
                        },
                        {
                            id: 'select-all-nodes',
                            content: '全选实体',
                            selector: 'node',
                            coreAsWell: true,
                            show: true,
                            onClickFunction: function (event) {
                                selectAllOfTheSameType('node');

                                contextMenu.hideMenuItem('select-all-nodes');
                                contextMenu.showMenuItem('unselect-all-nodes');
                            }
                        },
                        {
                            id: 'unselect-all-nodes',
                            content: '取消全选实体',
                            selector: 'node',
                            coreAsWell: true,
                            show: false,
                            onClickFunction: function (event) {
                                unselectAllOfTheSameType('node');

                                contextMenu.showMenuItem('select-all-nodes');
                                contextMenu.hideMenuItem('unselect-all-nodes');
                            }
                        },
                        {
                            id: 'select-all-edges',
                            content: '全选关系',
                            selector: 'edge',
                            coreAsWell: true,
                            show: true,
                            onClickFunction: function (event) {
                                selectAllOfTheSameType('edge');

                                contextMenu.hideMenuItem('select-all-edges');
                                contextMenu.showMenuItem('unselect-all-edges');
                            }
                        },
                        {
                            id: 'unselect-all-edges',
                            content: '取消全选关系',
                            selector: 'edge',
                            coreAsWell: true,
                            show: false,
                            hasTrailingDivider: true,
                            onClickFunction: function (event) {
                                unselectAllOfTheSameType('edge');

                                contextMenu.showMenuItem('select-all-edges');
                                contextMenu.hideMenuItem('unselect-all-edges');
                            }
                        },
                    ],
                    // css classes that menu items will have
                    menuItemClasses: [
                        // add class names to this list, like: 'custom-menu-item'
                    ],
                    // css classes that context menu will have
                    contextMenuClasses: [],
                    // Indicates that the menu item has a submenu. If not provided default one will be used
                    submenuIndicator: {src: '/icons/submenu-indicator-default.svg', width: 12, height: 12}
                });
            },

            isUnique(arrays,propFunc,name){
                for(let i=0;i<arrays.length;i++){
                    if(propFunc(arrays[i])===name){
                        return false
                    }
                }
                return true
            },

            //dialog组件
            resetForm(){
                this.$refs['ruleForm'].resetFields();
                //本来只需要上面这一行
                //由于上一行的作用是恢复至初始值，而由于编辑和添加dialog共用，如果先使用编辑，则编辑的值成为初始值
                //为简单解决这一问题，附加一个手动清空form的操作如下
                this.form = {
                    name: '',
                    type: '',
                    property: [],
                    edgeCondition:{source:'',target:''},
                    nameNow: '',
                    formCallback: ()=>{console.log("this.form.formCallback被意外调用")}
                };
            },

            handleClose(done) {
                let that = this;
                this.$confirm('所作的编辑将不会保存')
                    .then(_ => {
                        done();
                        that.resetForm();
                    })
                    .catch(_ => {});
            },

            //addForm组件
            addCancel(){
                this.addFormVisible = false;
                this.resetForm();

            },
            addConfirm(){
                this.$refs['ruleForm'].validate((valid) => {
                    if (valid) {
                        this.addFormVisible = false;
                        let addForm = JSON.parse(JSON.stringify(this.form));//深拷贝后传参，不破坏原来的值//可能没必要
                        addForm.name = addForm.name.trim();//名称和校验时一样前后无空格
                        this.form.formCallback(addForm);
                        this.resetForm();
                        // this.trigger_statistic_data_change();//因为在各个callback函数中已经写了，由于背后机制是布尔值取反，所以重复操作会导致无法监听到布尔值变化
                    } else {
                        alert('好像哪里有问题，操作失败了呢……');
                    }
                });
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

            // **Allow for manipulation of elements without triggering multiple style calculations or multiple redraws.**
            batch(cy,func){
                cy.startBatch();
                func();
                cy.endBatch();
            },
            // A batch should correspond to a single visual operation. Usually a batch should contain calls only to the following functions:
            // Modifying state: eles.data(), eles.scratch(), eles.addClass(), eles.removeClass(), etc.
            // Building collections: eles.union(), eles.difference(), eles.intersection(), etc.
            // Comparison: eles.same(), eles.some(), etc.
            // Iteration: eles.forEach(), eles.empty(), etc.
            // Traversal: node.outgoers(), eles.bfs(), etc.
            // Algorithms: eles.dijkstra(), eles.degreeCentrality(), etc.

            // 把对象转化为字符串
            property2String(props){
                let result = '';
                for(let key in props){
                    let val = props[key];
                    if(val instanceof Array){
                        result += '· ' + key + '-' + val.join(',') + '</br>';
                    }else{
                        result += '· ' + key + '-' + val + '</br>';
                    }

                }
                return result;
            },

            propertyToArray(props){
                let result = [];
                for(let key in props){
                    let val = props[key];
                    if(val instanceof Array){
                        result.push(key + ':' + val.join(','));
                    }else{
                        result.push(key + ':' + val);
                    }

                }
                return result;
            },

            arrayToProperty(array){
                let result = {};
                let defaultItem = [];
                if(!array) return result;
                for(let item of array){
                    let index = item.search(/[:：]/);
                    let key='',content='';
                    if(index>=0 && index<item.length-1){
                        key = item.slice(0,index);
                        content = item.slice(index+1);
                    } else{
                        content = item;
                    }

                    let pauseWord = /[;,.；，。]/;
                    if(content.search(pauseWord)===-1){
                        let errorReg = /\s/;
                        if(key&&!errorReg.test(key)){
                            result[key] = content;
                        }else{
                            defaultItem.push(item);
                        }
                    }else{
                        content = content.split(pauseWord);
                        if(content.length>0){
                            // let errorReg = /\s/;
                            let validIndex = []
                            for(let i = 0;i < content.length;i++){
                                content[i] = content[i].trim();
                                if(content[i]){
                                    validIndex.push(i)
                                }
                            }
                            if(validIndex.length>0){
                                let validItem = []
                                for(let i of validIndex){
                                    validItem.push(content[i]);
                                }
                                let errorReg = /\s/;
                                if(key&&!errorReg.test(key)){
                                    result[key] = validItem;
                                }else{
                                    defaultItem += validItem;
                                }
                            }
                        }
                    }
                }
                if(defaultItem.length>0){
                    let defaultKey = "未命名";
                    if(result.hasOwnProperty(defaultKey)){
                        if(result[defaultKey] instanceof Array){
                            result[defaultKey] += defaultItem;
                        }else {
                            result[defaultKey] = [result[defaultKey]] + defaultItem;
                        }
                    }else{
                        result[defaultKey] = defaultItem;
                    }
                }
                return result;
            }
        }
    }
</script>

<style lang="less">
@import "../assets/css/colors";
    .knowledge-graph-cy{
      height: 100%;
    }
    #graph {
        width: 100%;
        height: 100%;
        min-height: 500px;
        cursor: move;
    }

    //菜单
    .cy-context-menus-cxt-menu {
        display: none;
        z-index: 1001;
        position:absolute;
        border:1px solid @separator;
        border-radius: 3px;
        background-color: white;
    }

    //菜单条目
    .cy-context-menus-cxt-menuitem {
        border-radius: 3px;
        display:block;
        width: 100%;
        padding: 7px 30px;
        position:relative;
        background-color: white;
        font-size: 13px;
        white-space:nowrap;
        color: @myblack;
        border: 0;
        text-align: left;
        img{
            width: 15px;
            height: 15px;
        }
    }

    //菜单条目：enabled
    .cy-context-menus-cxt-menuitem:enabled {}

    //菜单条目：focus
    .cy-context-menus-ctx-operation:focus {
        //outline: none;
    }

    //菜单条目：hover
    .cy-context-menus-cxt-menuitem:hover {
        color: @theme;
        text-decoration: none;
        background-color: @hover;
        background-image: none;
        cursor: pointer;
        border-radius: 0;
    }

    //？？
    .cy-context-menus-cxt-menuitem[content]:before {
        content:attr(content);
    }

    .cy-context-menus-divider {
        border-bottom:1px solid @separator;
    }

    .cy-context-menus-submenu-indicator {
        position: absolute;
        right: 2px;
        top: 50%;
        transform: translateY(-50%);
    }
</style>
