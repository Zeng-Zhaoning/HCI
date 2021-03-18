<template>
    <div class='knowledge-graph-cy'>
        <div id="graph"></div>
    </div>
</template>

<script>
    import axios from 'axios'
    import $ from 'jquery'
    import cytoscape from 'cytoscape'
    import { mapState,mapMutations } from 'vuex';

    import contextMenus from 'cytoscape-context-menus';

    // register extension
    cytoscape.use(contextMenus);

    window.jQuery = window.$ = $

    export default {
        name: 'CytoscapeKG',
        data(){
            return{
                fileURL : '/static_ref1/data/temp2.json',
            }
        },
        computed: {
            ...mapState({
                defaultStyle: state => state.workspace.defaultStyle,
                cy: state => state.workspace.cy
            })
        },
        mounted () {
            //禁用右键菜单（应该防止浏览器菜单行为干扰cy的菜单行为）
            document.oncontextmenu = () => {
                event.returnValue = false;
            }
            this.getData(this.fileURL);
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
                        console.error(err)
                    })
            },

            //在data中存数据，并进行数据展示的预处理，并同步到仓库。
            dataHandle(data) {
                // this.data = JSON.parse(JSON.stringify(data))
                data.edges.forEach((val) => {
                    val.classes = 'autorotate'
                })
                data.nodes.forEach((val) => {
                    val.data.text = val.data.content;
                })
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
                let that = this;
                this.graph(that);
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
                let content = target.data().content;
                const text = that.fontShow(content);
                target.data({text: text});
                const style = that.fontStyle(text.length);
                target.style(style);
            },

            //作图有关的设置
            graph(that) {
                let cy = that.cy;

                cy.nodes().forEach(val => {
                    that.rendNode(val, that);
                });

                // //为节点与边的数量计数，以便于分配id，暂时不用
                // cy.data({nodeCount:cy.nodes().length,edgeCount:cy.edges().length});
                // console.log("cy.data(): ",cy.data());

                console.log("before: cy.autounselectify()", cy.autounselectify());
                cy.autounselectify(false);
                console.log("after: cy.autounselectify()", cy.autounselectify());
                cy.on('mouseover', 'node', event => {
                    let target = event.target || event.cyTarget;
                    let content = target.data().content;
                    target.data({text: content});
                    target.style({fontSize: 48});//此数无意义，仅仅需要比rendNode最大text的36更大即可
                })
                    .on('mouseout', 'node', event => {
                        let target = event.target || event.cyTarget;
                        that.rendNode(target, that);
                    })
                    //edge不能改变边的颜色，否则和选中机制冲突（那处也会改变颜色）
                    .on('mouseover', 'edge', event => {
                        let target = event.target || event.cyTarget;
                        target.style({fontSize: 48, width: 6, color: "#1346c6"});//此数无意义，仅仅需要比rendNode最大text的36更大即可
                    })
                    .on('mouseout', 'edge', event => {
                        let target = event.target || event.cyTarget;
                        target.style({fontSize: 24, width: 3, color: '#197edd'});//与上文edge的初始配置保持一致
                    })

                // 绑定点击的事件
                var barHandler = event => {
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
                cy.on('cxttap', barHandler);//cxttap为右键单击

                // function updateData (group, data, value, that) {
                //     const initData = that.data[group]
                //     const len = initData.length
                //     if (group === 'nodes') {
                //         for (let i = 0; i < len; i++) {
                //             if (initData[i].data.id === parseInt(data.id)) {
                //                 initData[i].data.content = value
                //                 break
                //             }
                //         }
                //     } else if (group === 'edges') {
                //         for (let i = 0; i < len; i++) {
                //             if (initData[i].data.source === parseInt(data.source) && initData[i].data.target === parseInt(data.target)) {
                //                 initData[i].data.label = value
                //                 break
                //             }
                //         }
                //     }
                // }

                var allSelected = function (type) {
                    if (type === 'node') {
                        return cy.nodes().length === cy.nodes(':selected').length;
                    } else if (type === 'edge') {
                        return cy.edges().length === cy.edges(':selected').length;
                    }
                    return false;
                }

                var selectAllOfTheSameType = function (type) {
                    if (type === 'node') {
                        cy.nodes().select();
                    } else if (type === 'edge') {
                        cy.edges().select();
                    }
                };
                var unselectAllOfTheSameType = function (type) {
                    if (type === 'node') {
                        cy.nodes().unselect();
                    } else if (type === 'edge') {
                        cy.edges().unselect();
                    }
                };


                var removed;//为了撤销删除而使用的缓存，以后可以改成数组等等，恢复多次
                // demo your core ext
                var contextMenu = cy.contextMenus({
                    menuItems: [
                        {
                            id: 'undo-last-remove',
                            content: 'undo last remove',
                            selector: 'node, edge',
                            show: false,
                            coreAsWell: true,
                            onClickFunction: function (event) {
                                if (removed) {
                                    console.log("before undoing remove: nodeCount", cy.nodes().length);
                                    console.log("before undoing remove: edgeCount", cy.edges().length);
                                    removed.restore();
                                    console.log("after undoing remove: nodeCount", cy.nodes().length);
                                    console.log("after undoing remove: edgeCount", cy.edges().length);
                                }
                                contextMenu.hideMenuItem('undo-last-remove');
                            }
                        },
                        {
                            id: 'remove',
                            content: 'remove',
                            tooltipText: 'remove',
                            image: {src: "/icons/remove.svg", width: 12, height: 12, x: 6, y: 4}, // menu icon
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
                            id: 'add-node',
                            content: 'add node',
                            tooltipText: 'add node',
                            image: {src: "/icons/add.svg", width: 12, height: 12, x: 6, y: 4}, // menu icon
                            coreAsWell: true,
                            hasTrailingDivider: true,
                            onClickFunction: function (event) {
                                // let id = new Date().getTime()+""//不给这个，cy自己也会生成id

                                let data = {
                                    content: '未定义',
                                    type: 'undefined',
                                    text: '未定义'
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
                            content: 'add edge',
                            tooltipText: 'add edge',
                            selector: 'node',
                            image: {src: "/icons/add.svg", width: 12, height: 12, x: 6, y: 4}, // menu icon
                            onClickFunction: function (event) {
                                let starget = event.target || event.cyTarget;
                                starget.style({
                                    "border-width": 6,
                                    "border-color": "rgb(20,248,123)"
                                });
                                let sid = starget.data().id;
                                cy.once('tap', event => {
                                    console.log("start adding an edge");
                                    let dtarget = event.target || event.cyTarget;
                                    if (dtarget !== cy && dtarget.group() === 'nodes') {
                                        console.log("before adding edge: edgeCount", cy.edges().length);
                                        console.log("before adding edge: lastEdge:", cy.edges()[cy.edges().length - 1]);
                                        let did = dtarget.data().id;
                                        let newEdge = {
                                            group: 'edges',
                                            data: {
                                                source: sid,
                                                target: did,
                                                label: 'undefined'
                                            },
                                            classes: 'autorotate'
                                        };
                                        cy.add(newEdge);
                                        console.log("after adding edge: edgeCount", cy.edges().length);
                                        console.log("after adding edge: lastEdge:", cy.edges()[cy.edges().length - 1]);
                                    }
                                    starget.style({
                                        "border-width": 0,
                                        "border-color": starget.style()['background-color']
                                    });
                                    console.log("finish adding an edge");
                                });
                            }
                        },
                        {
                            id: 'edit',
                            content: 'edit',
                            tooltipText: 'edit',
                            selector: 'node, edge',
                            hasTrailingDivider: true,
                            onClickFunction: function (event) {
                                let target = event.target || event.cyTarget;
                                const group = target.group()
                                const data = target.data()
                                const name = group === 'nodes' ? 'content' : 'label'
                                const text = data[name]
                                let value = prompt("请输入需要修改的名称", text)
                                if (value !== null && value !== "") {
                                    console.log("before edit: target", target);
                                    let obj = {};
                                    obj[name] = value;
                                    target.data(obj);
                                    if (name === 'content') {
                                        that.rendNode(target, that);
                                    }
                                    console.log("after edit: target", target);

                                    // updateData(group, data, value, that)
                                    // that.submit()
                                } else if(value!==null) {//取消返回null，空值返回''
                                    alert("名称无效哦!");
                                }
                            }
                        },
                        {
                            id: 'color',
                            content: 'change color',
                            tooltipText: 'change color',
                            selector: 'node',
                            hasTrailingDivider: true,
                            submenu: [
                                {
                                    id: 'color-blue',
                                    content: 'blue',
                                    tooltipText: 'blue',
                                    submenu: [
                                        {
                                            id: 'color-normal-blue',
                                            content: 'normal blue',
                                            tooltipText: 'normal blue',
                                            onClickFunction: function (event) {
                                                let target = event.target || event.cyTarget;
                                                target.style('background-color', "#65b3fc");
                                            },
                                        },
                                        {
                                            id: 'color-light-blue',
                                            content: 'light blue',
                                            tooltipText: 'light blue',
                                            onClickFunction: function (event) {
                                                let target = event.target || event.cyTarget;
                                                target.style('background-color', 'lightblue');
                                            },
                                        },
                                        {
                                            id: 'color-dark-blue',
                                            content: 'dark blue',
                                            tooltipText: 'dark blue',
                                            onClickFunction: function (event) {
                                                let target = event.target || event.cyTarget;
                                                target.style('background-color', 'darkblue');
                                            },
                                        },
                                    ],
                                },
                                {
                                    id: 'color-green',
                                    content: 'green',
                                    tooltipText: 'green',
                                    onClickFunction: function (event) {
                                        let target = event.target || event.cyTarget;
                                        target.style('background-color', 'green');
                                    },
                                },
                                {
                                    id: 'color-red',
                                    content: 'red',
                                    tooltipText: 'red',
                                    onClickFunction: function (event) {
                                        let target = event.target || event.cyTarget;
                                        target.style('background-color', 'red');
                                    },
                                },
                            ]
                        },
                        {
                            id: 'select-all-nodes',
                            content: 'select all nodes',
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
                            content: 'unselect all nodes',
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
                            content: 'select all edges',
                            selector: 'edge',
                            coreAsWell: true,
                            show: true,
                            hasTrailingDivider: true,
                            onClickFunction: function (event) {
                                selectAllOfTheSameType('edge');

                                contextMenu.hideMenuItem('select-all-edges');
                                contextMenu.showMenuItem('unselect-all-edges');
                            }
                        },
                        {
                            id: 'unselect-all-edges',
                            content: 'unselect all edges',
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
                        {
                            id: 'exportJSON',
                            content: 'exportJSON',
                            tooltipText: 'exportJSON',
                            selector: 'edge, node',
                            coreAsWell: true,
                            onClickFunction: function (event) {
                                that.exportJSON();
                            }
                        }
                    ],
                    // css classes that menu items will have
                    menuItemClasses: [
                        'custom-menu-item'
                        // add class names to this list
                    ],
                    // css classes that context menu will have
                    contextMenuClasses: [
                        'custom-context-menu'
                        // add class names to this list
                    ],
                    // Indicates that the menu item has a submenu. If not provided default one will be used
                    submenuIndicator: {src: '/icons/submenu-indicator-default.svg', width: 12, height: 12}
                });

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

<style>
    #graph {
        width: 100%;
        height: 800px;
        /*border: 1px solid pink;*/
        cursor: move;
    }

    .cy-context-menus-cxt-menu {
        display:none;
        z-index: 1000;
        position:absolute;
        border:1px solid #A0A0A0;
        padding: 0;
        margin: 0;
        width:auto;
    }

    .cy-context-menus-cxt-menuitem {
        display:block;
        width: 100%;
        padding: 3px 20px;
        position:relative;
        margin:0;
        background-color:#f8f8f8;
        font-weight:normal;
        font-size: 12px;
        white-space:nowrap;
        border: 0;
        text-align: left;
    }

    .cy-context-menus-cxt-menuitem:enabled {
        color: #000000;
    }

    .cy-context-menus-ctx-operation:focus {
        outline: none;
    }

    .cy-context-menus-cxt-menuitem:hover {
        color: #ffffff;
        text-decoration: none;
        background-color: #0B9BCD;
        background-image: none;
        cursor: pointer;
    }

    .cy-context-menus-cxt-menuitem[content]:before {
        content:attr(content);
    }

    .cy-context-menus-divider {
        border-bottom:1px solid #A0A0A0;
    }

    .cy-context-menus-submenu-indicator {
        position: absolute;
        right: 2px;
        top: 50%;
        transform: translateY(-50%);
    }

    .custom-menu-item {
        border-color: white !important;
        /*  border-top-left-radius: 5px !important;
         border-top-right-radius: 5px !important;
         border-bottom-left-radius: 5px !important;
         border-bottom-right-radius: 5px !important; */
        color:white !important;
        background-color: purple;
        font-weight: bold !important;

    }

    .custom-context-menu {
        border-color: purple !important;

    }



</style>
