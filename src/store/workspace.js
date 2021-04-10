import {setTextAPI} from "@/api/basicAPI"


export const workspace = {
    state: {
        workspace_text: "",  //注意这个是当前工作区的文本，不是当前项目的文本（可能是编辑中未保存的暂时文本）
        json_src_path:  '',
        defaultStyle: [
            {
                selector: 'node',
                css: {
                    //目前仍然搞不懂label和content区别，姑且先用label
                    'label': 'data(nameShowed)',
                    // 'content': 'data(nameShowed)',//这里的content用来显示节点的内容
                    'color': 'white',
                    'font-weight': 400,
                    'font-size': "25px",
                    'text-outline-width': 2,
                    'text-outline-color': '#888',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'padding': '25px',
                    "background-color": "#9c8f96",
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
                    "text-border-color": "#eea39d",
                    "text-border-opacity": "1",
                    "text-border-width": "2px",
                    "text-background-color": "#f1f1f5",
                    "text-background-shape": "roundrectangle",
                    "text-background-padding": "5px",
                    "text-background-opacity": "1",
                }
            },
            {
                selector: 'edge',
                css: {
                    //目前仍然搞不懂label和content区别，姑且先用label
                    'label': 'data(nameShowed)',
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
                    'arrow-scale': 2
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
                    "color": 'white',
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
                    //'text-outline-color': "rgb(255,251,0)",
                    //'text-outline-width': 4,
                }
            },
        ],
        cy: null, //注：cy在组件方法中通过函数cytoscape()创建，属性均为private。因此无法直接用赋值修改其属性。

        //下面两表均附有标准中文译名,CytoscapeKG.vue中dataHandle(data)有引用此处"default"
        shapeType: {
        "individual": "ellipse",//个体
        "organization": "barrel",//团体
        "thing": "round-diamond",//事物
        "default": "triangle"//未知
        },
        lineStyleType:{
            "connection": "solid",//关联
            "inheritance": "dashed",//继承
            "default": "dotted"//未知
        }
    },

    getters: {

    },

    mutations: {
        setWorkspaceText(state, text) {
            state.workspace_text = text;
        },
        setCy(state, cy){
            state.cy = cy;
        },
        setJsonSrcPath(state, path){
            state.json_src_path = path;
        },
    },

    actions: {
        postText({commit}, data) {
            let pid = data.pid;
            let text = data.text;
            return new Promise((resolve,reject) => {
                setTextAPI(pid, text).then(res => {
                    if (res.success) {
                        commit('setProjectGraph', {pid: res.pid, edges: res.edges, nodes: res.nodes});
                    } else {
                        console.log(res.message);
                    }
                    resolve(res)
                }).catch(err => {
                    console.log(err);
                    reject(err)
                })
            })
        },
    }
}
