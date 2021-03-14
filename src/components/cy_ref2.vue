<template>
    <div style="width: 100%;height: 100%;">
        <div id="MainCy" style="width: 100%;height: 50em;"></div>
        <div id="MainD3" scale="1" class="no-padding tp-container">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"> </svg>
        </div>
    </div>
</template>

<script>
    //界面位置待调整
    //无force，滚轮可zoom
    import cytoscape from 'cytoscape'
    import * as d3 from 'd3'
    import $ from 'jquery'

    export default {
        name: 'cy_ref2',
        mounted() {
            /** 网页当前状态判断 (解决没布局完就切换页面造成点聚集在一起)*/
            var hidden, state, visibilityChange;
            if (typeof document.hidden !== "undefined") {
                hidden = "hidden";
                visibilityChange = "visibilitychange";
                state = "visibilityState";
            } else if (typeof document.mozHidden !== "undefined") {
                hidden = "mozHidden";
                visibilityChange = "mozvisibilitychange";
                state = "mozVisibilityState";
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
                state = "msVisibilityState";
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
                state = "webkitVisibilityState";
            }
            // 声明变量
            var cy;
            var id;
            var activeNode;
            var graphDatas;     //接口返回的原始数据
            var _rootData,_rootNode;  //原始数据转换成的graph数据,根节点数据

            var _COLOR = {
                node :   {person: '#FD485E',company:'#4ea2f0',current:'#ff9e00'},
                border : {person: '#FD485E',company:'#128BED',current:'#EF941B'},
                line:    {invest:'#fd485e',employ:'#4ea2f0',legal:'#4ea2f0'}
            };
            var _currentKeyNo,_companyRadius = 35,_personRadius = 15,_circleMargin = 10,_circleBorder = 3,
                _layoutNode = {}, _isFocus = false;
            var _maxChildrenLength = 0;
            /** 解决浏览器标签切换排列问题 */
            var _isNeedReload = false;
            var _isGraphLoaded = false;
            document.addEventListener(visibilityChange, function() {
                // console.log(document[state]);
                if(document[state] == 'visible'){
                    if(_isNeedReload){
                        $("#MainCy").html('');
                        $('#TrTxt').removeClass('active');
                        _currentKeyNo = "e6b98b6db9ac8bbee4906e92fc01e4c9";
                        getData(_currentKeyNo);
                    }
                    document.title = 'hidden-not-loaded'
                } else {
                    if(!_isGraphLoaded){
                        _isNeedReload = true;
                    }
                }
            }, false);
            /** end 解决浏览器标签切换排列问题 */
            $(document).ready(function () {
                // 获取数据
                _currentKeyNo = "e6b98b6db9ac8bbee4906e92fc01e4c9";
                getData(_currentKeyNo);

                // 监听容器的滚动事件
                document.getElementById("MainCy").addEventListener("wheel", function(e){
                    // console.log(e.wheelDelta);
                    var type = 1;
                    if(e.wheelDelta > 0){
                        type = 1;
                    }else {
                        type = 2;
                    }
                    maoScale(type);
                });

            });
            function getData(_currentKeyNo){
                // 模拟数据
                graphDatas = [{
                    graph: {
                        nodes:[
                            {
                                id:"75351209",
                                labels:["Company"],
                                properties:{
                                    econKind:"有限责任公司(法人独资)1",
                                    hasImage:false,
                                    keyNo:"e6b98b6db9ac8bbee4906e92fc01e4c9",
                                    name:"北京兰贝斯科技有限公司1",
                                    registCapi:"1000.000",
                                    status:"在业",
                                }
                            },
                            {
                                id:"36341010",
                                labels:["Person"],
                                properties:{
                                    keyNo:"ea5e4e0a1ddfaf97ffa6720af99e54ea",
                                    name:"张三",
                                    registCapi:"1000.000",
                                    role:"监事",
                                }
                            },
                            {
                                id:"363410102",
                                labels:["Company"],
                                properties:{
                                    keyNo:"ea5e4e0a1ddfaf97ffa6720af99e54ea1",
                                    name:"张三1",
                                    registCapi:"1000.000",
                                    role:"监事1",
                                }
                            },
                            {
                                id:"363410103",
                                labels:["Person"],
                                properties:{
                                    keyNo:"ea5e4e0a1ddfaf97ffa6720af99e54ea2",
                                    name:"张三2",
                                    registCapi:"1000.000",
                                    role:"监事2",
                                }
                            }
                        ],
                        relationships: [
                            {
                                id:"62566458",
                                startNode:"75351209",
                                endNode:"36341010",
                                type:"INVEST",
                                properties: {
                                    role:"自然人股东",
                                    shouldCapi:50,
                                    stockPercent:50
                                }
                            },
                            {
                                id:"363403",
                                startNode:"363410103",
                                endNode:"36341010",
                                type:"INVEST",
                                properties: {
                                    role:"自然人股东",
                                    shouldCapi:50,
                                    stockPercent:50
                                }
                            },
                            {
                                id:"3634031",
                                startNode:"363410103",
                                endNode:"363410102",
                                type:"INVEST",
                                properties: {
                                    role:"自然人股东",
                                    shouldCapi:111,
                                    stockPercent:500
                                }
                            }
                        ],
                    },
                }];
                _rootData = getRootData(graphDatas);
                domUpdate(_rootData);

            }

            // 图谱、筛选面板更新
            function domUpdate(graphData) {
                console.log(graphData);
                getD3Position(graphData);

                setTimeout(function () {
                    drawGraph(transformData(graphData));
                },500);

                selPanelUpdateList(graphData.nodes,graphData.links,true);
            }


            // ---------------------------- domUpdate 调用的方法 ---- Begin
            function getD3Position(graph) {
                getLayoutNode(graph);

                function filterLinks1(graph) {
                    // 筛选用于布局的links
                    var layoutLinks = [];
                    for(var i = 0; i < graph.links.length; i++){
                        var link = graph.links[i];
                        var sourceLevel = link.sourceNode.layout.level;
                        var targetLevel = link.targetNode.layout.level;
                        var sourceNode = link.sourceNode;
                        var targetNode = link.targetNode;
                        //            sourceNode.layout.isSetLink = false;
                        //            targetNode.layout.isSetLink = false;


                        //            if(!sourceNode.layout.isSetLink && !targetNode.layout.isSetLink){
                        if((sourceLevel == 1 && targetLevel == 2) || (sourceLevel == 2 && targetLevel == 1) ){
                            //                    sourceNode.layout.isSetLink = true;
                            //                    targetNode.layout.isSetLink = true;
                            layoutLinks.push(link);
                        }
                        if((sourceLevel == 2 && targetLevel == 3) || (sourceLevel == 3 && targetLevel == 2) ){
                            //                    sourceNode.layout.isSetLink = true;
                            //                    targetNode.layout.isSetLink = true;
                            layoutLinks.push(link);
                        }
                        //            }

                    }

                    layoutLinks.forEach(function (link,i) {

                        if(link.targetNode.layout.level == 3){
                            layoutLinks.forEach(function (alink,j) {
                                if(alink.linkId != link.linkId &&
                                    (alink.targetNode.nodeId == link.targetNode.nodeId || alink.sourceNode.nodeId == link.targetNode.nodeId)){
                                    layoutLinks.splice(j,1);
                                }
                            })
                        }

                        if(link.sourceNode.layout.level == 3){
                            layoutLinks.forEach(function (alink,j) {
                                if(alink.linkId != link.linkId &&
                                    (alink.targetNode.nodeId == link.sourceNode.nodeId || alink.sourceNode.nodeId == link.sourceNode.nodeId)){
                                    layoutLinks.splice(j,1);
                                }
                            })
                        }
                    })

                    return layoutLinks;
                }

                function filterLinks2(graph) {
                    // 筛选用于布局的links
                    var layoutLinks = [];
                    for(var i = 0; i < graph.links.length; i++){
                        var link = graph.links[i];
                        var sourceLevel = link.sourceNode.layout.level;
                        var targetLevel = link.targetNode.layout.level;
                        var sourceNode = link.sourceNode;
                        var targetNode = link.targetNode;


                        if((sourceLevel == 1 && targetLevel == 2) || (sourceLevel == 2 && targetLevel == 1) ){
                            layoutLinks.push(link);
                        }
                        if((sourceLevel == 2 && targetLevel == 3) || (sourceLevel == 3 && targetLevel == 2) ){
                            layoutLinks.push(link);
                        }

                    }

                    return layoutLinks;
                }

                function initD3Data(graph) { //
                    function getIndex(val,arr) {
                        var index = 0;
                        for(var i = 0; i < arr.length; i++){
                            var obj = arr[i];
                            if(val == obj.nodeId){
                                index = i;
                                break;
                            }
                        }
                        return index;
                    }

                    /*封装符合d3的数据*/
                    for(var i = 0; i < graph.nodes.length; i++){
                        var node = graph.nodes[i];
                        node.id = node.nodeId;
                    }

                    for(var i = 0; i < graph.links.length; i++){
                        var link = graph.links[i];
                        link.source = getIndex(link.sourceNode.nodeId, graph.nodes) ;
                        link.target = getIndex(link.targetNode.nodeId, graph.nodes) ;
                        link.index = i; //
                    }

                    graph.layoutLinks = filterLinks1(graph);

                    // 围绕节点最大数值
                    setSingleLinkNodes(graph.layoutLinks);
                    graph.nodes.forEach(function(node,i){
                        if(node.layout.singleLinkChildren.length && _maxChildrenLength < node.layout.singleLinkChildren.length){
                            _maxChildrenLength = node.layout.singleLinkChildren.length
                        }
                    })
                    //console.log('围绕节点最大数值:' + _maxChildrenLength);
                }

                initD3Data(graph); //

                var width = $("#MainD3 svg").width();
                var height = $("#MainD3 svg").height();

                var strength = -600,distanceMax = 330,theta = 0,distance = 130,colideRadius = 35,distanceMin = 400;
                // 根据节点数量调节
                if(graph.nodes.length < 50 ){
                    strength = -800;distanceMax = 400;
                } else if( graph.nodes.length > 50 && graph.nodes.length < 100 ){
                    strength = -800;distanceMax = 350;distance = 130;colideRadius = 35;
                } else if(graph.nodes.length > 100 && graph.nodes.length < 150){
                    strength = -900;distanceMax = 450;
                } else if (graph.nodes.length > 150 && graph.nodes.length < 200) {
                    strength = -1000; distanceMax = 500;
                } else if (graph.nodes.length > 200) {
                    strength = -1600; distanceMax = 500;theta = 0.6,distance = 100,colideRadius = 35;
                }
                // 根据围绕数量调节
                if(_maxChildrenLength > 50 && _maxChildrenLength < 100){
                    strength = -2000; distanceMax = 500;
                } else if(_maxChildrenLength > 1000 && _maxChildrenLength < 2000) {
                    strength = -4000; distanceMax = 1500;
                }

                d3.forceSimulation(graph.nodes)
                    .force('charge', d3.forceManyBody().strength(strength).distanceMax(distanceMax).theta(theta))
                    .force('link', d3.forceLink(graph.layoutLinks).distance(distance))
                    .force('center', d3.forceCenter(width / 2, height / 2))
                    .force('collide', d3.forceCollide().radius(function () { return colideRadius;}))
                //.on('tick',ticked);
            }
            //设置符合Layout的node
            function getLayoutNode(graphData) {
                var layoutNode = { current : _rootNode, level1 : [], level2 : [], level3 : [], level4 : [], level5 : [],other:[]};

                graphData.nodes.forEach(function (node,i) {
                    switch (node.layout.level) {
                        case 1: layoutNode.level1.push(node);break;
                        case 2: layoutNode.level2.push(node);break;
                        case 3: layoutNode.level3.push(node);break;
                        case 4: layoutNode.level4.push(node);break;
                        case 5: layoutNode.level5.push(node);break;
                        default:layoutNode.other.push(node);break;
                    }
                });

                _layoutNode = layoutNode;
                console.log(_layoutNode)
                return layoutNode;
            }

            // 数据处理：设置唯一孩子
            function setSingleLinkNodes(links){
                function isSingleLink (nodeId,links){
                    var hasLinks = 0;
                    var isSingle = true;
                    for(var i = 0; i < links.length; i++){
                        var link = links[i];
                        if(link.targetNode.nodeId == nodeId || link.sourceNode.nodeId == nodeId){
                            hasLinks++;
                        }
                        if(hasLinks > 1){
                            isSingle = false;
                            break;
                        }
                    }

                    return isSingle;
                } // isSingleLink

                links.forEach(function (link,i) {
                    if(isSingleLink(link.sourceNode.nodeId,links)){
                        link.targetNode.layout.singleLinkChildren.push(link.sourceNode);
                    }
                    if(isSingleLink(link.targetNode.nodeId,links)){
                        link.sourceNode.layout.singleLinkChildren.push(link.targetNode);
                    }
                });
            }
            // 绘制图谱
            function drawGraph(elements) {
                _currentKeyNo,_companyRadius = 35,_personRadius = 15,_circleMargin = 10,_circleBorder = 3;
                cy = cytoscape({
                    container: document.getElementById('MainCy'),
                    motionBlur: false,
                    textureOnViewport:false,
                    wheelSensitivity: 0,
                    elements:elements,
                    minZoom:0.4,
                    maxZoom:5,
                    zoomingEnabled: true,   //是否可缩放，改为false图谱的位置会靠左不居中
                    userZoomingEnabled: false,   //是否允许用户事件(例如鼠标轮、按下缩放)缩放图形.缩放的编程更改不受此选项的影响  -- 这里改为false,然后通过自定义事件来控制图谱的缩放
                    layout: {
                        name: 'preset',
                        componentSpacing: 40,
                        nestingFactor:12,
                        padding: 10,
                        edgeElasticity:800,
                        stop:function (e) {
                            //解决浏览器标签切换排列问题
                            if(document[state] == 'hidden'){
                                _isNeedReload = true;
                                //                        console.log('stop _isNeedReload=true');
                            } else {
                                _isNeedReload = false;
                            }
                            setTimeout(function () {
                                if(document[state] == 'hidden'){
                                    _isGraphLoaded = false;
                                    console.log('stop _isGraphLoaded=false');
                                } else {
                                    _isGraphLoaded = true;
                                }
                            },1000);
                        }
                    },
                    style: [
                        {
                            selector: 'node',
                            style: {
                                shape: 'ellipse',
                                width: function (ele) {
                                    //当前节点有图片
                                    if(ele.data("type") == 'Person' && _currentKeyNo == ele.data('keyNo') && ele.data('hasImage')){
                                        return 80;
                                    }
                                    //有图片
                                    if(ele.data('hasImage') && ele.data('type') == 'Person'){
                                        return 60;
                                    }
                                    //普通
                                    if(ele.data("type") == 'Company'){
                                        return 60;
                                    }
                                    return 45;
                                },
                                height: function (ele) {
                                    //当前节点有图片
                                    if(ele.data("type") == 'Person' && _currentKeyNo == ele.data('keyNo') && ele.data('hasImage')){
                                        return 80;
                                    }
                                    //有图片
                                    if(ele.data('hasImage') && ele.data('type') == 'Person'){
                                        return 60;
                                    }
                                    //普通
                                    if(ele.data("type") == 'Company'){
                                        return 60;
                                    }
                                    return 45;
                                },
                                'background-color': function (ele) {
                                    return ele.data('color');
                                },
                                'background-fit': 'cover',
                                'background-image': function (ele) {
                                    var hasImage = ele.data('hasImage');
                                    var keyNo = ele.data('keyNo');
                                    var type = ele.data('type');
                                    if(hasImage && type == 'Person'){
                                        return '/proxyimg_'+ keyNo+'.jeg';
                                    } else {
                                        return 'none';
                                    }
                                },
                                // 'background-image-crossorigin': 'use-credentials',
                                'border-color': function (ele) {
                                    return ele.data("borderColor");
                                },
                                'border-width': function (ele) {
                                    if(ele.data('hasImage') && ele.data('type') == 'Person'){
                                        return 3;
                                    } else {
                                        return 1;
                                    }
                                },
                                'border-opacity': 1,
                                label: function (ele) {
                                    var label = ele.data("name");
                                    var length = label.length;

                                    if(length <=5){ // 4 5 4排列
                                        return label;
                                    } else if(length >=5 && length <= 9) {
                                        return label.substring(0,length - 5) + '\n' + label.substring(length - 5,length);
                                    } else if(length >= 9 && length <= 13){
                                        return label.substring(0,4) + '\n' + label.substring(4,9) + '\n' + label.substring(9,13);
                                    } else {
                                        return label.substring(0,4) + '\n' + label.substring(4,9) + '\n' + label.substring(9,12) + '..';
                                    }
                                },
                                'z-index-compare':'manual',
                                'z-index':20,
                                color:"#fff",
                                //'padding-top':0,
                                'padding':function (ele) {
                                    if(ele.data("type") == 'Company'){
                                        return 3;
                                    }
                                    return 0;
                                },
                                'font-size':12,
                                //'min-height':'400px',
                                //'ghost':'yes',
                                //'ghost-offset-x':300,
                                //'font-weight':800,
                                //'min-zoomed-font-size':6,
                                'font-family':'microsoft yahei',
                                'text-wrap':'wrap',
                                'text-max-width':60,
                                'text-halign':'center',
                                'text-valign':'center',
                                'overlay-color':'#fff',
                                'overlay-opacity':0,
                                'background-opacity':1,
                                'text-background-color':'#000',
                                'text-background-shape':'roundrectangle',
                                'text-background-opacity':function (ele) {
                                    if(ele.data('hasImage') && ele.data('type') == 'Person'){
                                        return 0.3;
                                    } else {
                                        return 0
                                    }
                                },
                                'text-background-padding':0,
                                'text-margin-y': function (ele) {
                                    //当前节点有图片
                                    if(ele.data("type") == 'Person' && _currentKeyNo == ele.data('keyNo') && ele.data('hasImage')){
                                        return 23;
                                    }
                                    // 有图片
                                    if(ele.data('hasImage') && ele.data('type') == 'Person'){
                                        return 16;
                                    }
                                    //
                                    if(ele.data("type") == 'Company'){
                                        return 4;
                                    }
                                    return 2;
                                },
                            },
                        },
                        {
                            selector: 'edge',
                            style: {
                                'line-style':function (ele) {
                                    return 'solid';
                                    /*if(ele.data('data').obj.type == 'INVEST'){
                                        return 'solid';
                                    } else {
                                        return 'dashed'
                                    }*/
                                },
                                'curve-style': 'bezier',
                                'control-point-step-size':20,
                                'target-arrow-shape': 'triangle-backcurve',
                                'target-arrow-color': function (ele) {
                                    return ele.data("color");
                                },
                                'arrow-scale':0.5,
                                'line-color': function (ele) {
                                    //return '#aaaaaa';
                                    return ele.data("color");
                                },
                                label: function (ele) {
                                    return ele.data("label");
                                },
                                'text-opacity':0.8,
                                'font-size':12,
                                'background-color':function (ele) {
                                    return '#ccc';
                                    return ele.data("color");
                                },
                                'width': 0.3,
                                'overlay-color':'#fff',
                                'overlay-opacity':0,
                                'font-family':'microsoft yahei',
                            }
                        },
                        {
                            "selector": ".autorotate",
                            "style": {
                                "edge-text-rotation": "autorotate"
                            }
                        },
                        {
                            selector:'.nodeActive',
                            style:{
                                /*'background-color':function (ele) {
                                    if(ele.data("category")==1){
                                        return "#5c8ce4"
                                    }
                                    return "#d97a3a";
                                },*/
                                //'z-index':300,
                                'border-color': function (ele) {
                                    return ele.data("color");
                                },
                                'border-width': 10,
                                'border-opacity': 0.5
                            }
                        },
                        {
                            selector:'.edgeShow',
                            style:{
                                'color':'#999',
                                'text-opacity':1,
                                'font-weight':400,
                                label: function (ele) {
                                    return ele.data("label");
                                },
                                'font-size':10,
                            }
                        },
                        {
                            selector:'.edgeActive',
                            style:{
                                'arrow-scale':0.8,
                                'width': 1.5,
                                'color':'#330',
                                'text-opacity':1,
                                'font-size':12,
                                'text-background-color':'#fff',
                                'text-background-opacity':0.8,
                                'text-background-padding':0,
                                'source-text-margin-y':20,
                                'target-text-margin-y':20,
                                //'text-margin-y':3,
                                'z-index-compare':'manual',
                                'z-index':1,
                                'line-color': function (ele) {
                                    return ele.data("color");
                                },
                                'target-arrow-color': function (ele) {
                                    return ele.data("color");
                                },
                                label: function (ele) {

                                    /*if(ele.data('data').obj.type == 'INVEST'){
                                        return 'solid';
                                    } else {
                                        return 'dashed'
                                    }*/
                                    return ele.data("label");
                                }
                            }

                        },
                        {
                            selector:'.hidetext',
                            style:{
                                'text-opacity':0,
                                label: function (ele) {
                                    return '';
                                }
                            }
                        },
                        {
                            selector:'.dull',
                            style:{
                                'z-index':1,
                                opacity:0.2,
                            }
                        },
                        {
                            selector: '.nodeHover',
                            style: {
                                shape: 'ellipse',
                                'background-opacity':0.9,
                            }
                        },
                        {
                            selector: '.edgeLevel1',
                            style: {
                                label: function (ele) {
                                    return ele.data("label");
                                },
                            }
                        },
                        {
                            selector: '.edgeShowText',
                            style: {
                                label: function (ele) {
                                    return ele.data("label");
                                },
                            }
                        },
                        {
                            selector: '.lineFixed',// 加载完成后，加载该类，修复线有锯齿的问题
                            style: {
                                'overlay-opacity':0,
                            }
                        },
                    ],
                });
                /**
                 * 鼠标点击节点后触发
                 */
                cy.on('click', 'node', function(evt){
                    console.log(111111)
                    if(evt.target._private.style['z-index'].value == 20) { // 非暗淡状态
                        _isFocus = true;
                        var node = evt.target;

                        highLight([node._private.data.id],cy);

                        if(node.hasClass("nodeActive")){
                            activeNode = null;
                            $('#company-detail').hide();
                            node.removeClass("nodeActive");
                            cy.collection("edge").removeClass("edgeActive");
                        }else{
                            var nodeData = node._private.data;
                            if(nodeData.type == 'Company'){
                                showDetail2(nodeData.keyNo,'company_muhou3');
                                cy.collection("node").addClass('nodeDull');
                            } else {
                                showDetail2(nodeData.keyNo,'company_muhou3','person');
                                cy.collection("node").addClass('nodeDull');
                            }

                            activeNode = node;
                            cy.collection("node").removeClass("nodeActive");

                            cy.collection("edge").removeClass("edgeActive");
                            node.addClass("nodeActive");
                            node.neighborhood("edge").removeClass("opacity");
                            node.neighborhood("edge").addClass("edgeActive");
                            node.neighborhood("edge").connectedNodes().removeClass("opacity");
                        }
                        //_firstTab = false;
                    } else {
                        _isFocus = false;
                        activeNode = null;
                        cy.collection("node").removeClass("nodeActive");
                        $('.tp-detail').fadeOut();
                        cancelHighLight();
                    }
                });
                /**
                 * 鼠标按下时触发
                 */
                cy.on('vmousedown', 'node', function(evt){
                    var node = evt.target;
                    if(!_isFocus){
                        highLight([node._private.data.id],cy);
                    }
                });
                /**
                 * 鼠标抬起/触摸结束时触发
                 */
                cy.on('tapend', 'node', function(evt){
                    if(!_isFocus){
                        cancelHighLight();
                    }
                });
                var showTipsTime = null;
                /**
                 * 鼠标悬停在节点上
                 */
                cy.on('mouseover', 'node', function(evt){
                    if(evt.target._private.style['z-index'].value == 20){ // 非暗淡状态
                        //
                        $("#Main").css("cursor","pointer");

                        //
                        var node = evt.target;
                        node.addClass('nodeHover');
                        if(!_isFocus){
                            cy.collection("edge").removeClass("edgeShow");
                            cy.collection("edge").removeClass("edgeActive");
                            node.neighborhood("edge").addClass("edgeActive");
                        }

                        // 提示
                        clearTimeout(showTipsTime);
                        //if(node._private.data.name.length > 13 || (node._private.data.keyNo[0] == 'p' && node._private.data.name.length > 3) || node._private.data.layout.revel > 2){
                        if(node._private.data.name.length > 13 || (node._private.data.keyNo && node._private.data.keyNo[0] == 'p' && node._private.data.name.length > 3)){
                            showTipsTime = setTimeout(function () {
                                var name = node._private.data.name;

                                // 显示在节点位置
                                /*var tipWidth = name.length * 12 + 16;
                                var x = node._private.data.d3x + 655 - (tipWidth / 2);
                                var y = node._private.data.d3y + 598;
                                if(node._private.data.type == 'Person'){
                                    y = node._private.data.d3y + 590;
                                }*/

                                // 显示在鼠标位置
                                var event = evt.originalEvent ||window.event;
                                var x = event.clientX + 10;
                                var y = event.clientY + 10;

                                var html = "<div class='tips' style='font-size:12px;background:white;box-shadow:0px 0px 3px #999;border-radius:1px;opacity:1;padding:1px;padding-left:8px;padding-right:8px;display:none;position: absolute;left:"+ x +"px;top:"+ y +"px;'>"+ name +"</div>";
                                $('body').append($(html));
                                $('.tips').fadeIn();
                            },600);
                        }
                    }
                });
                /**
                 * 鼠标移开节点
                 */
                cy.on('mouseout', 'node', function(evt){
                    $("#Main").css("cursor","default");

                    // 提示
                    $('.tips').fadeOut(function () {
                        $('.tips').remove();
                    });

                    clearTimeout(showTipsTime);

                    //
                    var node = evt.target;
                    node.removeClass('nodeHover');
                    if(!_isFocus){
                        cy.collection("edge").removeClass("edgeActive");
                        /*if(moveTimeer){
                            clearTimeout(moveTimeer);
                        }*/
                        /*moveTimeer = setTimeout(function() {
                            cy.collection("edge").addClass("edgeActive");
                            //cy.collection("edge").addClass("edgeShow");
                        }, 300);
                        if(activeNode){
                            activeNode.neighborhood("edge").addClass("edgeActive");
                        }*/
                    }
                });
                /**
                 * 鼠标悬停在连线上
                 */
                cy.on('mouseover', 'edge', function(evt){
                    if(!_isFocus){
                        var edge = evt.target;
                        /*if(moveTimeer){
                            clearTimeout(moveTimeer);
                        }*/
                        cy.collection("edge").removeClass("edgeActive");
                        edge.addClass("edgeActive");
                        /*if(activeNode){
                            activeNode.neighborhood("edge").addClass("edgeActive");
                        }*/
                    }

                });
                /**
                 * 鼠标离开连线
                 */
                cy.on('mouseout', 'edge', function(evt){
                    if(!_isFocus){
                        var edge = evt.target;
                        edge.removeClass("edgeActive");
                        // moveTimeer = setTimeout(function() {
                        //     cy.collection("edge").addClass("edgeActive");
                        //     //cy.collection("edge").addClass("edgeShow");
                        // }, 400);
                        if(activeNode){
                            activeNode.neighborhood("edge").addClass("edgeActive");
                        }
                    }

                });
                /**
                 * 鼠标点击连线时触发
                 */
                cy.on('click', 'edge', function(evt){
                    _isFocus = false;
                    activeNode = null;
                    cy.collection("node").removeClass("nodeActive");
                    $('.tp-detail').fadeOut();
                    cancelHighLight();
                });
                /**
                 * 点击画布，节点全部恢复高亮
                 */
                cy.on('click', function(event){
                    var evtTarget = event.target;
                    if( evtTarget === cy ){
                        _isFocus = false;
                        activeNode = null;
                        cy.collection("node").removeClass("nodeActive");
                        $('.tp-detail').fadeOut();
                        cancelHighLight();
                        focusCancel();
                        filterReset();
                    }
                });
                /**
                 * 图谱缩放后触发
                 */
                cy.on('zoom',function(){
                    console.log(cy.zoom());
                    if(cy.zoom()<0.5){
                        cy.collection("node").addClass("hidetext");
                        cy.collection("edge").addClass("hidetext");
                    }else{
                        cy.collection("node").removeClass("hidetext");
                        cy.collection("edge").removeClass("hidetext");
                    }

                    // 加载完成后，加载该类，修复线有锯齿的问题
                    setTimeout(function () {
                        cy.collection("edge").removeClass("lineFixed");
                        cy.collection("edge").addClass("lineFixed");
                    },200);
                })
                /**
                 * 图谱被移动/拖拽后触发
                 */
                cy.on('pan',function () {
                    // 加载完成后，加载该类，修复线有锯齿的问题
                    setTimeout(function () {
                        cy.collection("edge").removeClass("lineFixed");
                        cy.collection("edge").addClass("lineFixed");
                    },200);
                });

                // 定位
                cy.nodes().positions(function( node, i ){
                    // 保持居中
                    if(node._private.data.keyNo == _currentKeyNo){
                        var position= cy.pan();
                        cy.pan({
                            x: position.x-node._private.data.d3x,
                            y: position.y-node._private.data.d3y
                        });
                    }

                    //
                    return {
                        x: node._private.data.d3x,
                        y: node._private.data.d3y
                    };
                });

                cy.ready(function () {


                    if(!$('#TrTxt').hasClass('active')){
                        $('#TrTxt').click();
                    }

                    cy.zoom({
                        level: 1, // the zoom level
                    });
                    $("#load_data").hide();
                    //cy.$('#'+id).emit('tap');
                    //cy.center(cy.$('#'+id));
                    //cy.collection("edge").addClass("edgeActive");

                    // 加载完成后，加载该类，修复线有锯齿的问题
                    setTimeout(function () {
                        cy.collection("edge").addClass("lineFixed");
                    },400);

                    // 首页的插入图谱默认高亮第一层
                    if(_rootData && _rootData.nodes.length > 30 && typeof _INSERT_URL != 'undefined' && _INSERT_URL){
                        highLight([_rootNode.nodeId],cy);
                    }
                });

                cy.nodes(function (node) {

                    /*
                    // 当前查询节点关系文字显示
                    if(node._private.data.nodeId == _rootNode.nodeId){
                        node.neighborhood("edge").addClass("edgeLevel1");
                    }*/
                });
            }
            /**
             * 图谱缩放
             * type == 1  放大
             * type == 2  缩小
             */
            function maoScale(type){
                var rate = 0.2;
                var scale = cy.zoom();
                if(type==1){
                    scale += rate;
                }else if(type==2){
                    scale -= rate;
                }

                cy.zoom({
                    level: scale, // the zoom level
                });
            }
            function highLight(nodeIds,cy) {
                cy.collection("node").removeClass("nodeActive");
                cy.collection("edge").removeClass("edgeActive");
                cy.collection("node").addClass('dull');
                cy.collection("edge").addClass('dull');

                for(var i = 0; i < nodeIds.length; i++){
                    var nodeId = nodeIds[i];
                    cy.nodes(function (node) {
                        var nodeData  = node._private.data;
                        if(nodeData.id == nodeId){
                            node.removeClass('dull');
                            //node.addClass('nodeActive');
                            node.neighborhood("edge").removeClass("dull");
                            node.neighborhood("edge").addClass("edgeActive");
                            node.neighborhood("edge").connectedNodes().removeClass("dull");
                            //node.neighborhood("edge").connectedNodes().addClass("nodeActive");
                        }
                    });
                }
            }
            function highLightFilter(nodeIds,cy) {
                function isInNodeIds(nodeId) {
                    for(var i = 0; i < nodeIds.length; i++){
                        if(nodeId == nodeIds[i]){
                            return true;
                            break;
                        }
                    }
                    return false;
                }

                cy.collection("node").removeClass("nodeActive");
                cy.collection("edge").removeClass("edgeActive");
                cy.collection("node").addClass('dull');
                cy.collection("edge").addClass('dull');


                for(var i = 0; i < nodeIds.length; i++){
                    var nodeId = nodeIds[i];
                    cy.nodes(function (node) {
                        var nodeData  = node._private.data;
                        if(nodeData.id == nodeId){
                            node.removeClass('dull');
                            //node.addClass('nodeActive');
                            /*node.neighborhood("edge").removeClass("dull");
                            node.neighborhood("edge").addClass("edgeActive");
                            node.neighborhood("edge").connectedNodes().removeClass("dull");*/
                            //node.neighborhood("edge").connectedNodes().addClass("nodeActive");
                        }
                    });
                }

                cy.edges(function (edge) {
                    var data = edge._private.data;
                    if(isInNodeIds(data.target) && isInNodeIds(data.source)){
                        edge.removeClass('dull');
                        edge.addClass('edgeActive');
                    }
                });
            }
            function cancelHighLight() {
                cy.collection("node").removeClass("nodeActive");
                cy.collection("edge").removeClass("edgeActive");
                cy.collection("node").removeClass('dull');
                cy.collection("edge").removeClass('dull');
            }
            //筛选面板：聚焦准备
            function focusReady(node) {
                filterReset();
                $('#FocusInput').val(node.data.obj.properties.name);
                $('#FocusInput').attr('node_id',node.nodeId);
                $('#FocusBt').text('聚焦');
                $('#FocusBt').removeClass('focusDisable');
                $('#ClearInput').show();
            }
            //筛选面板：取消聚焦
            function focusCancel() {
                $('#ClearInput').hide();
                $('#FocusBt').text('聚焦');
                $('#FocusBt').addClass('focusDisable');
                $('#FocusInput').val('');
                $('#FocusInput').attr('node_id','');
                selPanelUpdateList(_rootData.nodes,_rootData.links,true);
                cancelHighLight();
            }
            function filterReset(){
                $('#SelPanel').attr('param-level','2');
                $('#SelPanel').attr('param-status','');
                $('#SelPanel').attr('param-num','');
                $('#SelPanel').attr('param-invest','');

                $('#ShowLevel a').removeClass('active');
                $('#ShowLevel a').eq(1).addClass('active');
                $('#ShowStatus a').removeClass('active');
                $('#ShowStatus a').eq(0).addClass('active');
                $('#ShowInvest a').removeClass('active');
                $('#ShowInvest a').eq(0).addClass('active');
                $('#inputRange').val(0);
                $('#inputRange').css({'backgroundSize':'0% 100%'});
            }

            //将rootData转换成cy图谱框架所需要的数据结构
            function transformData(graphData) {
                function getLinkColor(type) {
                    if(type == 'INVEST'){
                        return _COLOR.line.invest;
                    } else if(type == 'EMPLOY') {
                        return _COLOR.line.employ;
                    } else if(type == 'LEGAL') {
                        return _COLOR.line.legal;
                    }
                }
                function getLinkLabel(link) {
                    var type = link.data.obj.type, role = link.data.obj.properties.role;
                    if(type == 'INVEST'){
                        return '投资';
                    } else if(type == 'EMPLOY') {
                        return (role ? role : '任职');
                    } else if(type == 'LEGAL') {
                        return '法定代表人';
                    }
                }
                //getLayoutNode(graphData);

                //
                id = graphData.nodes[0].nodeId;
                var els = {};
                els.nodes = [];
                els.edges = [];

                graphData.links.forEach(function (link,i) {
                    var color = getLinkColor(link.data.obj.type);
                    var label = getLinkLabel(link);

                    els.edges.push({
                        data:{
                            data:link.data,
                            color: color,
                            id:link.linkId,
                            label:label,
                            source:link.sourceNode.nodeId,
                            target:link.targetNode.nodeId
                        },
                        classes:'autorotate'
                    });
                });

                graphData.nodes.forEach(function (node) {
                    els.nodes.push({
                        data:{
                            nodeId:node.nodeId,
                            type:node.data.obj.labels[0],
                            keyNo:node.data.obj.properties.keyNo,
                            data:node.data,
                            id:node.nodeId,
                            name:node.data.obj.properties.name,
                            category:node.data.category,
                            color:node.data.color,
                            borderColor:node.data.strokeColor,
                            layout:node.layout,
                            d3x:node.x,
                            d3y:node.y,
                            hasImage:node.data.obj.properties.hasImage,
                            //labelLine:1 // 解决文字行距问题，第1行
                        }
                    });
                });

                return els;
            }
            //筛选面板：列表更新
            function selPanelUpdateList(nodes,links,isShowCheckbox) {
                $('.tp-list').html('');
                for(var i = 0; i < nodes.length; i++){
                    var node = nodes[i];
                    var index = i + 1;
                    var name = node.data.obj.properties.name;
                    var keyNo = node.data.obj.properties.keyNo;
                    var str = '';
                    if(isShowCheckbox){
                        str = '<div class="checkbox" node_id="'+ node.nodeId +'" keyno="'+ keyNo +'"> <input checked type="checkbox"><label> ' + index + '.' + name + '</label> </div>';
                        //            var str = '<div class="checkbox" node_id="'+ node.nodeId +'" keyno="'+ keyNo +'"> <label> ' + index + '.' + name + '</label> </div>';
                    } else {
                        str = '<div class="checkbox" node_id="'+ node.nodeId +'" keyno="'+ keyNo +'"><label> ' + index + '.' + name + '</label> </div>';
                    }

                    $('.tp-list').append(str);
                }

                $('.tp-list > div > label').click(function () {
                    var _parent = $(this).parent();
                    var nodeId = _parent.attr('node_id');

                    focusReady(getGraphNode(nodeId,nodes));
                });

                $('.tp-list > div > input').click(function () {
                    /*var _this = $(this);
                    var _parent = $(this).parent();
                    var nodeId = _parent.attr('node_id');
                    var checkedNodeIds = $('.tp-list').attr('node_ids');
                    if(checkedNodeIds){
                        checkedNodeIds = checkedNodeIds.split(',');
                    }*/

                    var checkedNodeIds = [];
                    $('.tp-list input:checked').each(function () {
                        var _parent = $(this).parent();
                        var nodeId = _parent.attr('node_id');
                        checkedNodeIds.push(nodeId);
                    });

                    /*if(_this.is(':checked')){
                        checkedNodeIds.push(nodeId);
                        nodes.splice(1,1);
                        console.log('checked');
                    } else {
                        console.log('un checked');
                        var sub_nodes = []
                        sub_nodes = nodes.splice(0,1);
                        console.log(nodes);
                        console.log(sub_nodes);
                        graphInit(nodes, links);
                    }*/
                    highLight(checkedNodeIds,cy);
                    /*// 需要隐藏的节点及子节点
                    var choosedNode = getGraphNode(nodeId,nodes);
                    var subNodes = getSubNodes(choosedNode,links);
                    subNodes.push(choosedNode);

                    // 剩下的节点
                    var lastNodes = [];
                    for(var i = 0; i < nodes.length; i++){
                        var node = nodes[i];
                        if(!getGraphNode(node.nodeId,subNodes)){
                            lastNodes.push(node);
                        }
                    }

                    // 剩下的连线
                    var lastLinks = filterLinksByNodes(lastNodes,links);

                    graphInit(lastNodes, lastLinks);
                    if(_this.is(':checked')){
                        nodes.splice(1,1);
                        console.log('checked');
                    } else {
                        console.log('un checked');
                        var sub_nodes = []
                        sub_nodes = nodes.splice(0,1);
                        console.log(nodes);
                        console.log(sub_nodes);
                        graphInit(nodes, links);
                    }
                    console.log(nodeId);*/
                });
            }
            function showDetail2(keyNo, tupuUrl, type){
                console.log(keyNo)
            }

            // ---------------------------- domUpdate 调用的方法 ---- End


            // 数据处理：将原始数据转换成graph数据
            function getRootData(list) {
                // console.log(list);
                var graph = {}
                graph.nodes = [];
                graph.links = [];

                //graph.nodes
                for(var i = 0; i < list.length; i++){
                    var nodes = list[i].graph.nodes;
                    for(var j = 0; j < nodes.length; j++){
                        var node = nodes[j];
                        var o = {};
                        o.nodeId = node.id;
                        o.data = {};
                        o.data.obj = node;
                        //o.data.showStatus = 'NORMAL'; // NORMAL HIGHLIGHT DULL
                        o.data.showStatus = null; // NORMAL HIGHLIGHT DULL
                        o.layout = {}
                        o.layout.level = null; // 1 当前查询节点
                        o.layout.singleLinkChildren = []; // 只连接自己的node
                        graph.nodes.push(o);

                        // 设置_rootNode
                        if (_currentKeyNo == o.data.obj.properties.keyNo){
                            _rootNode = o;
                        }
                    }
                }

                graph.nodes = uniqeByKeys(graph.nodes,['nodeId']);
                //graph.links
                for(var i = 0; i < list.length; i++){
                    var relationships = list[i].graph.relationships;

                    for(var k = 0; k < relationships.length; k++) {
                        var relationship = relationships[k];
                        var o = {}
                        o.data = {};
                        o.data.obj = relationship;
                        //o.data.showStatus = 'NORMAL'; // NORMAL HIGHLIGHT DULL
                        o.data.showStatus = null; // NORMAL HIGHLIGHT DULL
                        o.sourceNode = getGraphNode(relationship.startNode,graph.nodes);
                        o.targetNode = getGraphNode(relationship.endNode,graph.nodes);
                        o.linkId = relationship.id;
                        o.source = getNodesIndex(relationship.startNode,graph.nodes);
                        o.target = getNodesIndex(relationship.endNode,graph.nodes);
                        graph.links.push(o);
                    }
                }
                graph.links = uniqeByKeys(graph.links,['linkId']);

                // console.log(graph);
                //emplyRevert(graph.links);
                //mergeLinks(graph.links);
                setLevel(graph.nodes,graph.links);
                setCategoryColor(graph.nodes,graph.links);

                return graph;
            }
            //  --------------------------- getRootData()引用的函数 ----- Begin
            //去重操作,元素为对象
            function uniqeByKeys(array,keys){
                //将对象元素转换成字符串以作比较
                function obj2key(obj, keys){
                    var n = keys.length,
                        key = [];
                    while(n--){
                        key.push(obj[keys[n]]);
                    }
                    return key.join('|');
                }

                var arr = [];
                var hash = {};
                for (var i = 0, j = array.length; i < j; i++) {
                    var k = obj2key(array[i], keys);
                    if (!(k in hash)) {
                        hash[k] = true;
                        arr .push(array[i]);
                    }
                }
                return arr ;
            };
            // 数据处理：根据nodeId获取node
            function getGraphNode(nodeId,nodes) {
                var node = null;
                for(var i = 0; i < nodes.length; i++){
                    if(nodes[i].nodeId == nodeId) {
                        node = nodes[i];
                        break;
                    }
                }
                return node;
            }
            // 数据处理：根据nodeId获取node 索引
            function getNodesIndex(nodeId,nodes) {
                var index = 0;
                for(var i = 0; i < nodes.length; i++){
                    var node = nodes[i];
                    if(nodeId == node.nodeId){
                        index = i;
                        break;
                    }
                }
                return index;
            }
            // 数据处理：设置节点层级
            function setLevel(svg_nodes,svg_links) {
                function getNextNodes(nodeId,links,parentLevel){
                    var nextNodes = [];
                    for(var i = 0; i < links.length; i++){
                        var link = links[i];
                        if(nodeId == link.sourceNode.nodeId && !link.targetNode.layout.level){
                            link.targetNode.layout.level = parentLevel;
                            nextNodes.push(link.targetNode);
                        } else if (nodeId == link.targetNode.nodeId && !link.sourceNode.layout.level) {
                            link.sourceNode.layout.level = parentLevel;
                            nextNodes.push(link.sourceNode);
                        }
                    }
                    nextNodes = uniqeByKeys(nextNodes,['nodeId']);

                    return nextNodes;
                }

                var level = 1;
                var nodes = [];
                nodes.push(_rootNode);
                while(nodes.length){
                    var nextNodes = [];
                    for(var i = 0; i < nodes.length; i++){
                        var node = nodes[i] || {};
                        node.layout.level = level;
                        nextNodes = nextNodes.concat(getNextNodes(node.nodeId,svg_links,level));
                    }
                    level++;
                    nodes = nextNodes;
                }
            }
            // 数据处理：设置节点角色
            function setCategoryColor(nodes, links){
                for(var i = 0; i < links.length; i++){
                    var sameLink = {}; // 两点间连线信息
                    sameLink.length = 0; // 两点间连线数量
                    sameLink.currentIndex = 0; // 当前线索引
                    sameLink.isSetedSameLink = false;
                    links[i].sameLink = sameLink;
                }

                /*链接相同两点的线*/
                for(var i = 0; i < links.length; i++){
                    var baseLink = links[i];

                    if(baseLink.sameLink.isSetedSameLink == false){
                        baseLink.sameLink.isSetedSameLink = true;
                        var nodeId1 = baseLink.sourceNode.nodeId;
                        var nodeId2 = baseLink.targetNode.nodeId;

                        var sameLinks = [];
                        sameLinks.push(baseLink);
                        for(var j = 0; j < links.length; j++){
                            var otherLink = links[j];
                            if(baseLink.linkId != otherLink.linkId && !otherLink.sameLink.isSetedSameLink){
                                if((otherLink.sourceNode.nodeId == nodeId1 && otherLink.targetNode.nodeId == nodeId2 ) ||
                                    (otherLink.sourceNode.nodeId == nodeId2 && otherLink.targetNode.nodeId == nodeId1 ) ){
                                    sameLinks.push(otherLink);
                                    otherLink.sameLink.isSetedSameLink = true;
                                }
                            }
                        }

                        for(var k = 0; k < sameLinks.length; k++){
                            var oneLink = sameLinks[k];
                            oneLink.sameLink.length = sameLinks.length; // 两点间连线数量
                            oneLink.sameLink.currentIndex = k; // 当前线索引
                        }
                    }
                }

                for(var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    if (_currentKeyNo == node.data.obj.properties.keyNo) { // 当前节点
                        node.data.color = _COLOR.node.current;
                        node.data.strokeColor = _COLOR.border.current;
                    } else if (node.data.obj.labels[0] == 'Company') {
                        node.data.color = _COLOR.node.company;
                        node.data.strokeColor = _COLOR.border.company;
                    } else {
                        node.data.color = _COLOR.node.person;
                        node.data.strokeColor = _COLOR.border.person;
                    }
                }
            }
            //  --------------------------- getRootData()引用的函数 ----- End
        },
    }
</script>

<style scoped>

</style>
