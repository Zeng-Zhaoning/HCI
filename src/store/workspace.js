
export const workspace = {
    state: {
        json_src_path:  '',
        statistic_data_change: false,  //flag
        defaultStyle: [
            {
                selector: 'node',
                css: {
                    //目前仍然搞不懂label和content区别，姑且先用label,并且是动态添加而不是在这里设定
                    // 'label': 'data(nameShowed)',
                    // 'content': 'data(nameShowed)',//这里的content用来显示节点的内容
                    'color': 'white',
                    'font-weight': 400,
                    'font-size': "25px",
                    'text-outline-width': 2,
                    'text-outline-color': '#888',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'padding': '30px',
                    "background-color": 'data(color)',//颜色持久化
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
                    //"color": "black",
                    "text-opacity": 1,
                    "text-valign": "center",
                    "text-halign": "center",
                    // "text-border-color": "#eea39d",
                    // "text-border-opacity": "1",
                    // "text-border-width": "2px",
                    "text-background-color": "#f1f1f5",
                    "text-background-shape": "roundrectangle",
                    "text-background-padding": "5px",
                    "text-background-opacity": "1",
                }
            },
            {
                selector: '.removed',
                css: {
                    'display': 'none'
                }
            },
            {
                selector: '.label_hidden',
                css: {
                    "text-opacity": 0,
                }
            },
            {
                selector: '.hidden',
                css: {
                    'visibility': 'hidden'
                }
            },
            {
                selector: '.searchedNode',
                css: {
                    color: 'red'
                }
            },
            {
                selector: '.searchedEdge',
                css: {
                    'text-outline-color': "rgb(255,251,0)",
                    'text-outline-width': 4,
                }
            },
            // {
            //     selector: '.labelHidden',
            //     css: {
            //         'text_opacity': 0
            //     }
            // },
            {
                selector: 'edge',
                css: {
                    //目前仍然搞不懂label和content区别，姑且先用label，并且是动态添加而不是在这里设定
                    // 'label': 'data(nameShowed)',
                    // 'content': 'data(nameShowed)',//这里的content用来显示边的内容
                    'color': '#eea39d',
                    //'background-color': "#65b3fc",
                    'line-color': "#a6c2ce",
                    'font-size': "24px",
                    'curve-style': 'bezier',//错开不同的边
                    'control-point-step-size': 100, //从源到目标的垂直线，这个值指定连续的贝塞尔边缘之间的距离
                    "edge-text-rotation": "autorotate",
                    'width': 3,
                    'target-arrow-shape': 'triangle-backcurve',
                    'target-arrow-color': '#eea39d',
                    'arrow-scale': 2,
                }
                // Bezier edges
                // 适用于自动捆绑贝塞尔边缘(curve-style: bezier):
                // control-point-step-size : 从源到目标的垂直线，这个值指定连续的贝塞尔边缘之间的距离。
                // control-point-distance : 用手动值重写control-point-step-size的单个值.因为它覆盖了步长，所以具有相同值的贝塞尔边缘将重叠。因此，如果需要的话，最好将它用作特定边的一次性值。
                // control-point-weight : 一个单独的值，它控制从源头到目标的控制点。该值通常在[0，1]的范围内，其中0指向源节点，1指向目标节点——但是也可以使用更大或更小的值。
                // edge-distances : With value intersection (default), the line from source to target for control-point-weight is from the outside of the source node’s shape to the outside of the target node’s shape. With value node-position, the line is from the source position to the target position. The node-position option makes calculating edge points easier — but it should be used carefully because you can create invalid points that intersection would have automatically corrected.
            },
            {
                //“选中”的样式要避免和“变色”、“强调”和“源节点”的样式冲突
                //据说'overlay-color'属性专门用于:active状态，然而我好像没成功，写个注释表示自己努力过了
                selector: 'node:selected',
                css: {
                    // "color": 'white',
                    'text-outline-color': "#847072",
                    'text-outline-width': 4,
                    //"background-color": '#dcc1b0',
                    "border-width": '6px',
                    "border-color": '#847072'
                }
            },
            {
                //“强调”时动了这些属性：{fontSize: 24, width: 3, color: '#197edd'}
                //所以在这里不能动
                selector: 'edge:selected',
                css: {
                    'line-color': "#ca884b",
                    "text-border-color": "#bc5f6a",
                    "text-border-width": "5px",
                    // "text-background-padding": "6px",
                    // 'text-outline-color': "rgb(255,251,0)",
                    //'text-outline-width': 4,
                }
            },
            {
                selector: 'node:parent',
                css: {
                    'border-width': '2px',
                    'border-color': '#9c8f96',
                    'background-color': '#9c8f96',
                    'background-opacity': 0.2,
                    'border-style': 'dashed',
                    'shape': 'round-rectangle',
                }
            }
        ],
        cy: null, //注：cy在组件方法中通过函数cytoscape()创建，属性均为private。因此无法直接用赋值修改其属性。
        elements : {}, //用以恢复初始数据，将来可拓展或削减这个备份的量
        nodeRadius: '',
        nodeFontSize: '',

        //下面两表均附有标准中文译名,CytoscapeKG.vue中dataHandle(data)有引用此处"default"
        shapeType: {
            "individual": "ellipse",//个体
            "organization": "barrel",//团体
            "thing": "round-diamond",//事物
            "default": "pentagon"//未知
        },
        lineStyleType:{
            "connection": "solid",//关联
            "inheritance": "dashed",//继承
            "default": "dotted"//未知
        },
        nodeType:[
            {label:"个体",value:"individual"},
            {label:"团体",value:"organization"},
            {label:"事物",value:"thing"},
            {label:"其他",value:"default"}
        ],
        edgeType:[
            {label:"关联",value:"connection"},
            {label:"继承",value:"inheritance"},
            {label:"其他",value:"default"}
        ],
        layoutType: [
            {label: '预设', value: 'preset'},
            {label:'力导图',value:'d3-force'},
            {label: '层级', value: 'breadthfirst'},
            {label: '圆环', value: 'circle'},
            {label: '网格', value: 'grid'},
            {label: '自适应', value: 'cose'}
        ],
        showQAPanel: false,
    },

    getters: {
        get_statistic_data_change(state){
            return state.statistic_data_change;
        }
    },

    mutations: {
        setCy(state, cy){
            state.cy = cy;
        },
        setElements(state, data){
            state.elements = data;
        },
        setNodeRadius(state, val){
            state.nodeRadius = val;
        },
        setNodeFontSize(state,val){
            state.nodeFontSize = val;
        },
        setJsonSrcPath(state, path){
            state.json_src_path = path;
        },
        trigger_statistic_data_change(state){
            state.statistic_data_change = ! state.statistic_data_change;
        },
        changeShowQAPanel(state){
            state.showQAPanel = !state.showQAPanel;
        }
    },

}
