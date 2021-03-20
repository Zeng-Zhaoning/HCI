<template>
    <div class='knowledge-graph-cy'>
        <div id="graph"></div>
    </div>
</template>

<script>
    import axios from 'axios'
    import $ from 'jquery'
    import cytoscape from 'cytoscape'
    import { mapState,mapMutations,mapGetters } from 'vuex';

    import contextMenus from 'cytoscape-context-menus';

    cytoscape.use(contextMenus);

    window.jQuery = window.$ = $

    export default {
        name: 'CytoscapeKG',
        computed: {
            ...mapState({
                defaultStyle: state => state.workspace.defaultStyle,
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
        mounted () {
            //禁用右键菜单（应该防止浏览器菜单行为干扰cy的菜单行为）
            document.oncontextmenu = () => {
                event.returnValue = false;
            }
        },
        methods: {
            ...mapMutations(['setCy']),

            //读数据，然后交给dataHandle
            getData(url) {
                axios.get(url)
                    .then(res => {
                        this.dataHandle(res.data)
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
                    val.data.nameShowed = val.data.relation;
                })
                data.nodes.forEach((val) => {
                    val.data.nameShowed = val.data.name;
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
                let name = target.data().name;
                const text = that.fontShow(name);
                target.data({nameShowed: text});
                const style = that.fontStyle(text.length);
                target.style(style);
            },

            rendEdge(target,that){
                let name = target.data().relation;
                const text = that.fontShow(name);
                target.data({nameShowed: text});
                // const style = that.fontStyle(text.length);
                // target.style(style);
                // target.addClass('autorotate');
            },

            //作图有关的设置
            graph(that, data) {
                let cy = cytoscape({
                  container: $('#graph'),
                  boxSelectionEnabled: false,
                  autounselectify: true,
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

                cy.nodes().forEach(val => {
                    that.rendNode(val, that);
                });

                cy.edges().forEach(val => {
                    that.rendEdge(val, that);
                });

                // //为节点与边的数量计数，以便于分配id，暂时不用
                // cy.data({nodeCount:cy.nodes().length,edgeCount:cy.edges().length});
                // console.log("cy.data(): ",cy.data());

                console.log("before: cy.autounselectify()", cy.autounselectify());
                cy.autounselectify(false);
                console.log("after: cy.autounselectify()", cy.autounselectify());
                cy.on('mouseover', 'node', event => {
                    let target = event.target || event.cyTarget;
                    let name = target.data().name;
                    target.data({nameShowed: name});
                    target.style({fontSize: 48});//此数无意义，仅仅需要比rendNode最大nameShowed的36更大即可
                })
                    .on('mouseout', 'node', event => {
                        let target = event.target || event.cyTarget;
                        that.rendNode(target, that);
                    })
                    //edge不能改变边的颜色，否则和选中机制冲突（那处也会改变颜色）
                    .on('mouseover', 'edge', event => {
                        let target = event.target || event.cyTarget;
                        let name = target.data().relation;
                        target.data({nameShowed: name});
                        //如果要改旋转，是"edge-text-rotation": "none"和"edge-text-rotation": "autorotate"
                        target.style({fontSize: 36, width: 6, color: '#bc5f6a'});//此数无意义，仅仅需要比rendNode最大nameShowed的36更大即可
                    })
                    .on('mouseout', 'edge', event => {
                        let target = event.target || event.cyTarget;
                        that.rendEdge(target,that);
                        target.style({fontSize: 24, width: 3, color: '#e3a6a1'});//与上文edge的初始配置保持一致
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
                            content: '命名',
                            selector: 'node, edge',
                            hasTrailingDivider: false,
                            onClickFunction: function (event) {
                                let target = event.target || event.cyTarget;
                                const group = target.group()
                                const data = target.data()
                                const name = group === 'nodes' ? 'name' : 'relation'
                                const nameShowed = data[name]
                                let value = "";
                                let propFunc = (val,key)=>val.data(key);
                                let getNameFunc = ()=>prompt("请输入需要修改的名称", nameShowed);

                                //以下取名函数必须保证返回值不是''
                                if(group==='nodes'){
                                    value = that.getUniqueNode(cy.nodes(),propFunc,getNameFunc);
                                }else{
                                    value = that.getUniqueEdge(data,cy.edges(),propFunc,getNameFunc);
                                }
                                if (value !== null) {//取消返回null，空值返回''，其中空值必须以在函数中处理
                                    console.log("before edit: target", target);
                                    let obj = {};
                                    obj[name] = value;
                                    target.data(obj);
                                    //由于vue的响应式，以下代码其实是不必要的，但是响应式自动修改会有延迟
                                    let conflict = false;
                                    if (group==='nodes') {
                                        that.rendNode(target, that);
                                        for(let i=0;i<removed.length;i++){
                                            let val = removed[i];
                                            if(val.group()==='nodes'&&val.data()[name]===value){
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
                                                &&valData[name]===value){
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
                                    // updateData(group, data, value, that)
                                    // that.submit()
                                }
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
                                let timestamp = new Date().getTime();

                                let data = {
                                    name: '未定义'+timestamp,
                                    // type: 'undefined',
                                    nameShowed: '未定义'+timestamp
                                };

                                let pos = event.position || event.cyPosition;
                                let newObj = {
                                    group: 'nodes',
                                    data: data,
                                    position: {
                                        x: pos.x,
                                        y: pos.y
                                    }
                                };
                                console.log("before adding node: nodeCount", cy.nodes().length);
                                console.log("before adding node: lastItem", cy.nodes()[cy.nodes().length - 1]);
                                cy.add(newObj);
                                console.log("after adding node: nodeCount", cy.nodes().length);
                                console.log("before adding node: lastItem", cy.nodes()[cy.nodes().length - 1]);
                                that.rendNode(cy.nodes()[cy.nodes().length - 1], that);
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
                                let sid = starget.data().id;
                                cy.once('tap', event => {
                                    console.log("start adding an edge");
                                    let ttarget = event.target || event.cyTarget;
                                    if (ttarget !== cy && ttarget.group() === 'nodes') {
                                        console.log("before adding edge: edgeCount", cy.edges().length);
                                        console.log("before adding edge: lastEdge:", cy.edges()[cy.edges().length - 1]);
                                        let tid = ttarget.data().id;
                                        let timestamp = new Date().getTime();
                                        let newEdge = {
                                            group: 'edges',
                                            data: {
                                                relation: '未定义'+timestamp,
                                                source: sid,
                                                // type: 'undefined',
                                                target: tid,
                                                nameShowed: '未定义'+timestamp
                                            },
                                            classes: 'autorotate'
                                        };
                                        cy.add(newEdge);
                                        console.log("after adding edge: edgeCount", cy.edges().length);
                                        console.log("after adding edge: lastEdge:", cy.edges()[cy.edges().length - 1]);
                                        that.rendEdge(cy.edges()[cy.edges().length - 1], that);
                                    }
                                    starget.style({'background-color': color_before});
                                    console.log("finish adding an edge");
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

            getUniqueNode(nodes,nodePropFunc,getNameFunc){
                let name = "";
                let count = 0;
                let propFunc = val=>nodePropFunc(val,"name");
                while (1){
                    name = getNameFunc();
                    if(name===''){//可扩展为实体名相关的正则表达式
                        alert("名称无效哦，换一个名字吧，亲~");
                    } else if(name===null||this.isUnique(nodes,propFunc,name)){//null代表取消
                        return name;
                    }else if(count>100){
                        alert("系统繁忙，请检查输入是否正确，或稍后再试哦");
                        return null;
                    }else{
                        alert("该实体已存在哦，换一个名字吧，亲~");
                    }
                    count++;
                }
            },

            getUniqueEdge({source,target},edges,edgePropFunc,getNameFunc){
                let name = "";
                let dupEdges = [];
                let count = 0;
                while (1){
                    name = getNameFunc();
                    if(name===null) return name;//null代表取消
                    if(name===''){//可扩展为关系名相关的正则表达式
                        alert("名称无效哦，换一个名字吧，亲~");
                    }else if(count>100){
                        alert("系统繁忙，请检查输入是否正确，或稍后再试哦");
                        return null;
                    }else{
                        dupEdges = edges.filter(val=>edgePropFunc(val,"source")===source).filter(val=>edgePropFunc(val,"target")===target);
                        if(dupEdges.length===0) return name;
                        if(this.isUnique(dupEdges,val=>edgePropFunc(val,"relation"),name)) return name;
                        alert("该边已存在哦，换一个名字吧，亲~");
                    }
                    count++;
                }
            },

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
