<template>
    <div class='knowledge-graph-cy'>
        <div id="graph">
<!--            <el-button type="text" @click="addFormVisible = true">打开嵌套表单的 Dialog</el-button>-->

            <el-dialog title="添加元素" v-model="addFormVisible" :before-close="handleClose" :append-to-body="true"><!--:append-to-body保证了弹窗时周围背景不能触发事件-->
                <el-form :model="form" :rules="rules" ref="ruleForm" :label-width="formLabelWidth" class="demo-ruleForm"><!-- class="demo-ruleForm"意义何在？-->
                    <el-form-item label="名称" prop="name" required>
                        <el-input v-model="form.name" autocomplete="off" style="width:90%"></el-input>
                    </el-form-item>
                    <el-form-item label="类型" prop="type">
                        <el-select v-model="form.type" placeholder="请选择类型" style="width:90%">
                            <el-option v-for="item in givenType" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="属性" prop="properties" v-if="node0Edge1===0">
                        <el-select
                                v-model="form.properties"
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
    import axios from 'axios'
    import $ from 'jquery'
    import cytoscape from 'cytoscape'
    import { mapState,mapMutations,mapGetters } from 'vuex';

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
            let propLenCheck = (rule,value,callback) => {
                console.log('propLenCheck');
                let len = 0;
                const limit = 255;
                let invalid = false;
                let errorReg = /\s/;
                for(let i = 0;i < value.length;i++){
                    if(errorReg.test(value[i])){
                        invalid = true;
                        break;
                    }
                    len += value[i]+1;
                }
                len-=1;
                if(invalid){
                    callback(new Error("属性中不能含有空哟~"));
                }else if(len>limit){
                    callback(new Error("属性值数据量太大啦，麻烦去掉长度过长的属性哟~"));
                }else{
                    callback();
                }
            };
            return {
                node0Edge1: 0,
                // editMode: false,
                addFormVisible : false,
                givenType: [],
                form: {
                    name: '',
                    type: '',
                    properties: [],
                    edgeCondition:{source:'',target:''},
                    //以下为借用form的reset来自动清空的属性
                    nameNow: '',
                    formCallback: ()=>{console.log("this.form.formCallback被意外调用")}
                },//此处的值会作为初始值存在，在this.$refs['ruleForm'].resetFields()后会恢复成初始值
                rules:{
                    name:[
                        {validator:nameCheck, trigger:'blur'}
                    ],
                    type:[//由于设置了初始值，这里似乎没被用到
                        {required:true,message:'请选择类型',trigger:'change'}
                    ],
                    properties:[
                        {validator:propLenCheck,trigger:'change'}
                    ]
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
                json_src_path: state => state.workspace.json_src_path,
            }),
            ...mapGetters(['current_project']),
        },
        watch: {
            json_src_path(now, old){
                this.getData(now);
            },
            current_project(now, old){
                let data = {
                    edges: this.current_project.edges,
                    nodes: this.current_project.nodes,
                };
                this.dataHandle(data);
            }
        },
        //方便调试而添加，最后删掉
        created() {
            this.getData("/static_ref1/data/data.json");
        },
        mounted () {
            //禁用右键菜单（应该防止浏览器菜单行为干扰cy的菜单行为）
            // document.oncontextmenu = () => {
            //     event.returnValue = false;
            // }
        },
        methods: {
            ...mapMutations(['setCy','trigger_statistic_data_change']),

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
                // this.data = JSON.parse(JSON.stringify(data))
                data.edges.forEach((val) => {
                    val.classes = 'autorotate';
                    val.data.nameShowed = val.data.relation; //需要先分配nameShowed字段是因为defaultStyle里有使用label(nameShowed)
                    val.data.type = val.data.type || 'default';
                })
                data.nodes.forEach((val) => {
                    val.data.nameShowed = val.data.name;  //需要先分配nameShowed字段是因为defaultStyle里有使用label(nameShowed)
                    val.data.type = val.data.type || 'default';
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
                    return text.substring(0, 5) + "..."
                }
                return text
            },

            //根据内容设置字体大小，使之不会超出节点（未验证）
            fontStyle(length) {
                let fontSize = 30 - (length - 2) * 6
                if (!fontSize || fontSize < 12) {
                    fontSize = 12
                }
                return {
                    "font-size": fontSize + "px"
                };
            },

            //帮助node合适地展示text
            rendNode(target, that) {
                let data = target.data();
                const text = that.fontShow(data.name);
                target.data({nameShowed: text});
                let style = that.fontStyle(text.length);
                style.shape = this.shapeType[data.type];
                target.style(style);
            },

            rendEdge(target,that){
                let data = target.data();
                const text = that.fontShow(data.relation);
                target.data({nameShowed: text});
                target.style({'line-style':this.lineStyleType[data.type]});
                // const style = that.fontStyle(text.length);
                // target.style(style);
                // target.addClass('autorotate');
            },

            //作图有关的设置
            graph(that, data) {
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
                  layout: {
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
                  }
                });
                this.setCy(cy);

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
                    target.data({nameShowed: target.data("name")});
                    target.style({fontSize: 48,'z-index':9999});//fontSize仅仅需要比rendNode最大nameShowed的36更大即可
                    if(!target.scratch('tip')){
                        target.scratch('tip',that.makeTippy(target,target.data("type")));
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
                        target.data({nameShowed: target.data("relation")});
                        //如果要改旋转，是"edge-text-rotation": "none"和"edge-text-rotation": "autorotate"
                        target.style({fontSize: 36, width: 6, color: '#bc5f6a','z-index':9999});//此数无意义，仅仅需要比rendNode最大nameShowed的36更大即可
                        if(!target.scratch('tip')){
                            target.scratch('tip',that.makeTippy(target,target.data("type")));
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


                let removed = [];  //为了撤销删除而使用的缓存，以后可以改成数组等等，恢复多次

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
                                if(group==='nodes'){
                                    that.node0Edge1 = 0;
                                    that.givenType = that.nodeType;
                                    that.form.properties = data.properties;
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
                                    if(group==='nodes'){
                                        obj.properties = addForm.properties;
                                    }
                                    target.data(obj);
                                    //由于vue的响应式，以下代码其实是不必要的，但是响应式自动修改会有延迟
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
                              target.style('background-color', '#e89d96');
                            },
                          },
                          {
                            id: 'color-yellow',
                            content: '黄',
                            onClickFunction: function (event) {
                              let target = event.target || event.cyTarget;
                              target.style('background-color', '#ebc57c');
                            },
                          },
                          {
                            id: 'color-light-blue',
                            content: '浅蓝',
                            onClickFunction: function (event) {
                              let target = event.target || event.cyTarget;
                              target.style('background-color', 'lightblue');
                            },
                          },
                          {
                              id: 'color-blue-slate',
                              content: '靛青',
                              onClickFunction: function (event) {
                                let target = event.target || event.cyTarget;
                                target.style('background-color', '#6a85ce');
                              }
                          },
                          {
                            id: 'color-brown',
                            content: '棕',
                            onClickFunction: function (event) {
                              let target = event.target || event.cyTarget;
                              target.style('background-color', '#9c8f96');
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
                                    newObj.data = {
                                        name:addForm.name,
                                        type:addForm.type,
                                        properties:addForm.properties,
                                        nameShowed: '未渲染'
                                    };
                                    that.batch(cy,()=>{
                                        let collection = cy.add(newObj);
                                        that.rendNode(collection[0], that);
                                    });
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
                                starget.style({
                                    //"border-width": 4,
                                    //"border-color": "#847072",
                                    "background-color": '#dcc1b0',
                                    //'text-outline-color': "#847072",
                                    //'text-outline-width': 4,
                                });
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
                                                type: addForm.type,
                                                nameShowed: '未渲染'
                                            };
                                            that.batch(cy,()=>{
                                                let collection = cy.add(newEdge);
                                                that.rendEdge(collection[0], that);
                                            });
                                            that.trigger_statistic_data_change();
                                        };
                                    }
                                    starget.style({'background-color': color_before});
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
            handleClose(done) {
                let that = this;
                this.$confirm('确认关闭？')
                    .then(_ => {
                        done();
                        that.$refs['ruleForm'].resetFields();
                    })
                    .catch(_ => {});
            },

            //addForm组件
            addCancel(){
                this.addFormVisible = false;
                this.$refs['ruleForm'].resetFields();
            },
            addConfirm(){
                this.$refs['ruleForm'].validate((valid) => {
                    if (valid) {
                        this.addFormVisible = false;
                        let addForm = JSON.parse(JSON.stringify(this.form));//深拷贝后传参，不破坏原来的值//可能没必要
                        addForm.name = addForm.name.trim();//名称和校验时一样前后无空格
                        this.form.formCallback(addForm);
                        this.$refs['ruleForm'].resetFields();
                    } else {
                        alert('好像哪里有问题，添加失败了呢……');
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

            getGraphJsonObject() {
                let eles = JSON.parse(JSON.stringify(this.cy.json().elements));
                console.log("eles_json", eles);
                console.log("eles_layout", this.cy.layout({
                    name: 'preset'
                }));
                return eles;
                //布局和layout有关，读入时用cy.layout( options );则可读入上次的布局
                //保存布局是怎么保存呢？eles.layout(options)又是什么？
            },

            getCyJsonObject() {
                let cy = JSON.parse(JSON.stringify(this.cy.json()));
                console.log("cy_object", this.cy)
                console.log("cy_json", cy);
                return cy;
            }
        }
    }
</script>

<style lang="less">
@import "../assets/css/colors";
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
