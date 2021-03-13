<template>
    <div class='knowledge-graph-cy'>
        <div id="graph"></div>
        <div id="navigator"></div>
        <!--<div id="panzoom"></div>-->
    </div>
</template>

<script>
    //界面位置待调整
    //无force，滚轮可zoom
    import axios from 'axios'
    import $ from 'jquery'
    import cytoscape from 'cytoscape'
    import panzoom from 'cytoscape-panzoom'
    import navigator from 'cytoscape-navigator'
    import spread from 'cytoscape-spread'
    import regCose from 'cytoscape-cose-bilkent'
    import dagre from 'cytoscape-dagre'

    window.jQuery = window.$ = $

    panzoom(cytoscape)
    navigator(cytoscape)
    spread(cytoscape)
    regCose(cytoscape)
    dagre(cytoscape)

    export default {
        name: 'cy_ref1',
        data () {
            return {
                defaultStyle: [
                    {
                        selector: 'node',
                        css: {
                            'color': 'white',
                            'font-size': "25px",
                            'content': 'data(text)',
                            'text-valign': 'center',
                            'text-halign': 'center',
                            'padding': '25px',
                            "background-color": "#65b3fc",
                        }
                    },
                    {
                        selector: '$node > node',
                        css: {
                            'padding': '10px',
                            'text-valign': 'top',
                            'text-halign': 'center',
                            'background-color': '#bbb'
                        }
                    },
                    {
                        "selector": ".autorotate",
                        "style": {
                            "font-size": "14px",
                            "color": "black",
                            "text-opacity": 1,
                            "text-valign": "center",
                            "text-halign": "center",
                            "text-border-color": "#65b3fc",
                            "text-border-opacity": "1",
                            "text-border-width": "1px",
                            "text-background-color": "#fff",
                            "text-background-shape": "roundrectangle",
                            "text-background-padding": "5px",
                            "text-background-opacity": "1",
                        }
                    },
                    {
                        selector: 'edge',
                        css: {
                            'color': '#197edd',
                            'background-color': "#65b3fc",
                            'line-color': "#65b3fc",
                            'font-size': "15px",
                            'content': 'data(label)',
                            'curve-style': 'bezier',
                            "edge-text-rotation": "autorotate",
                            'width': 3,
                            'target-arrow-shape': 'triangle',
                            'target-arrow-color': '#ffcb67',
                            'arrow-scale': 2
                        }
                    },
                    {
                        selector: ':selected',
                        css: {
                            'background-color': 'black',
                            'line-color': 'black'
                        }
                    }
                ],
                data: []
            }
        },
        mounted () {
            // 禁用右键菜单
            document.oncontextmenu = () => {
                event.returnValue = false;
            }
            this.getData()
        },
        methods: {
            getData () {
                axios.get('/static_ref1/data/data.json')
                    .then(res => {
                        this.dataHandle(res.data)
                    })
                    .catch(err => {
                        console.error(err)
                    })
            },
            dataHandle (data) {
                this.data = JSON.parse(JSON.stringify(data))
                data.edges.forEach((val)=>{
                    val.classes = 'autorotate'
                })
                let styleArr = [...this.defaultStyle]
                data.nodes.forEach((val, i) => {
                    val.data.text = this.fontShow(val.data.content)
                    const style = this.fontStyle(val.data.content.length)
                    styleArr.push(style)
                    val.classes = style.name
                })
                this.graph(data, styleArr)
            },
            fontShow (text){
                if (text && text.length > 5) {
                    return text.substring(0, 5) + "..."
                }
                return text
            },
            fontStyle (length) {
                let fontSize = 30 - (length - 2) * 6
                if(!fontSize || fontSize < 12) {
                    fontSize = 12
                }
                return {
                    "name": "fontSize_" + fontSize,
                    "selector": ".fontSize_" + fontSize,
                    "style": {
                        "font-size": fontSize + "px"
                    }
                }
            },

            graph (elements, style) {
                const cy  = cytoscape({
                    // container: document.getElementById('graph'),
                    container: $('#graph'),
                    boxSelectionEnabled: false,
                    autounselectify: true,
                    style,
                    elements,
                    hideLabelsOnViewPort: false,
                    minZoom: 0.15,
                    maxZoom: 8,
                    wheelSensitivity: 0.1,
                    layout: {
                        name: 'breadthfirst',
                        minDist: 40,
                        fit: true,
                        padding: 30,
                        boundingBox: undefined,
                        animate: false,
                        animationDuration: 500,
                        animationEasing: undefined,
                        animateFilter: function ( node, i ){ return true; },
                        ready: undefined,
                        stop: undefined,
                        transform: (node, position) => {
                            return position
                        }
                    }
                });
                const navigator = cy_ref2.navigator({
                    container: "#navigator",
                    viewLiveFramerate: 0,
                    thumbnailEventFramerate: 30,
                    thumbnailLiveFramerate: false,
                    dblClickDelay: 200,
                    removeCustomContainer: true,
                    rerenderDelay: 100
                })
                /*
                const panzoom = cy.panzoom({
                    zoomFactor: 0.05,
                    zoomDelay: 45,
                    minZoom: 0.1,
                    maxZoom: 10,
                    fitPadding: 50,
                    panSpeed: 10,
                    panDistance: 10,
                    panDragAreaSize: 75,
                    panMinPercentSpeed: 0.25,
                    panInactiveArea: 8,
                    panIndicatorMinOpacity: 0.5,
                    zoomOnly: false,
                    fitSelector: undefined,
                    animateOnFit: () => {
                        return false
                    },
                    fitAnimationDuration: 1000,
                    // icon class names
                    sliderHandleIcon: 'fa fa-minus',
                    zoomInIcon: 'fa fa-plus',
                    zoomOutIcon: 'fa fa-minus',
                    resetIcon: 'fa fa-expand'
                })*/

                // 绑定事件
                cy_ref2.on('tap', event => {
                    const node = event.target;
                    if( node === cy_ref2 ){
                        return
                    }
                    const group = node.group()
                    const data = node.data()
                    const name = group === 'nodes' ? 'text' : 'label'
                    const text = data[name]
                    let value = prompt("请输入需要修改的名称", text)
                    if (value !== null && value !== "") {
                        data[name] = value
                        node.json({data})
                        updateData(group, data, value, this)
                        this.submit()
                    }
                });

                function updateData (group, data, value, that) {
                    const initData = that.data[group]
                    const len = initData.length
                    if (group === 'nodes') {
                        for (let i = 0; i < len; i++) {
                            if (initData[i].data.id === parseInt(data.id)) {
                                initData[i].data.content = value
                                break
                            }
                        }
                    } else if (group === 'edges') {
                        for (let i = 0; i < len; i++) {
                            if (initData[i].data.source === parseInt(data.source) && initData[i].data.target === parseInt(data.target)) {
                                initData[i].data.label = value
                                break
                            }
                        }
                    }
                }
            },

            submit () {
                console.log(JSON.parse(JSON.stringify(this.data)))
            }
        }
    }
</script>

<style>
    #graph {
        width: 100%;
        height: 800px;
        border: 1px solid pink;
        cursor: move;
    }

    #navigator {
        width: 200px;
        height: 150px;
        position: absolute;
        right: 10px;
        bottom: 10px;
        overflow: hidden;
        background: rgba(239,246,249,.5);
        border-radius: 10px;
    }
    #navigator .cytoscape-navigatorView {
        background: rgba(0,0,0,.8);
        border-radius: 10%;
    }

    .cy-panzoom {z-index:3;}

    .cytoscape-navigator{
        position: fixed;
        border: 1px solid #000;
        background: #fff;
        z-index: 99999;
        width: 400px;
        height: 400px;
        bottom: 0;
        right: 0;
        overflow: hidden;
    }
    .cytoscape-navigator > img{
        max-width: 100%;
        max-height: 100%;
    }
    .cytoscape-navigator > canvas{
        position: absolute;
        top: 0;
        left: 0;
        z-index: 101;
    }
    .cytoscape-navigatorView{
        position: absolute;
        top: 0;
        left: 0;
        cursor: move;
        background: #B7E1ED;
        -moz-opacity: 0.50;
        opacity: 0.50;
        -ms-filter:"progid:DXImageTransform.Microsoft.Alpha"(Opacity=50);
        z-index: 102;
    }
    .cytoscape-navigatorOverlay{
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 103;
    }
</style>
