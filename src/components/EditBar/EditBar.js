import { mapState, mapMutations } from 'vuex';
import { inputKG } from "../../api/basicAPI";
import OpItem from './OpItem';
import EditBarBlock from "./EditBarBlock";
import MyButton from "@/components/Tools/MyButton";


export default {
    name: "EditBar",
    components: {OpItem,EditBarBlock, MyButton},
    data(){
        return{
            showEditBar: false,
            showExportOps: false,
            opInfo: '打开的文件后缀为".json"，其表示一个知识图谱\n',
            entities_data: [],
            relations_data: [],

            ////////////////////////////搜索相关/////////////////////////////////
            max_log_len: 10,

            search_node_text: [],
            search_node_condition: [],
            node_searched: false,
            search_node_log: [],

            search_edge_text:[],
            search_edge_condition: [],
            edge_searched:false,
            search_edge_log: [],

            // search_text: '',
            // search_type: '',
            // select_value: '',
            // showEnabled: false,
            // edgeDisabled: true,
            // types: [
            //     {
            //         label: '节点',
            //         value: '1'
            //     },
            //     {
            //         label: '关系',
            //         value: '2'
            //     }
            // ],
            // currentSearch: {
            //     params: {},
            //     result: []
            // },
            // searchLog: [],

            //////////////////////过滤相关/////////////////////////////

            filter_node_checkList: [],
            filter_edge_checkList: [],

            // filter_disabled: true,
            // filterShowEnabled: false,
            //
            // filter_node_checked: false,
            // filter_node_checkList: [],
            // filter_edge_checked: false,
            // filter_edge_checkList: [],

            //////////////////////展示效果相关////////////////////////////////

            layout: null,

            layoutTypeNow : '',

            relation_label_enabled: true,
            font_size: 20,
            node_radius: 20,
        }
    },
    watch: {
        cy(newValue, oldValue){
            this.get_statistic_data();
            this.layoutTypeNow = newValue.options().layout.name;
        },
        statistic_data_change(newValue, oldValue){
            console.log("检测到数据变化")
            this.get_statistic_data();
        },

        /////////////////////////////展示相关//////////////////////////////
        layoutTypeNow(newVal, oldVal) {
            // console.log("layout watched: '",oldVal,"' to '",newVal,"'");
            let layout = this.layout;
            if(layout!==null){
                layout.stop();
            }
            if(newVal==='preset'){
                //console.log("elements stored: ",this.elements);
                let nodes = this.elements.nodes;
                let positions = node=>{
                    let nodeId = node.data("id");
                    for(let node of nodes){
                        if(node.data.id===nodeId){
                            return node.position;
                        }
                    }
                    return {x:0,y:0};//可以拓展成随机放置
                };
                layout = this.cy.layout({name: newVal,fit:true,positions:positions});//若以后恢复的布局中新增颜色、大小等，可能需要为增加的部分渲染内容新写代码
                //console.log("reset done")

            }else if(newVal==='d3-force'){
                let d3_options = {
                    name: 'd3-force',
                    animate: true,
                    fit: true,//适应viewport
                    fixedAfterDragging: false,
                    linkId: function id(d) {
                        return d.id;
                    },
                    linkDistance: 1000,
                    manyBodyStrength: -10000,
                    ready: function(){},
                    stop: function(){},
                    tick: function(progress) {
                        // console.log('progress - ', progress);
                    },
                    randomize: false,
                    infinite: true
                }
                layout = this.cy.layout(d3_options)
            }else{
                layout = this.cy.layout({name: newVal, fit: true})
            }
            this.layout = layout;
            this.layout.run();
        },
        relation_label_enabled(newVal, oldVal) {
            let edges = this.cy.edges();
            let enabled = newVal;
            for (let edge of edges) {
                if(enabled&&edge.hasClass('label_hidden')){
                    edge.removeClass('label_hidden');
                }else if(!enabled&&!edge.hasClass('label_hidden')){
                    edge.addClass('label_hidden');
                }
            }
        },
        font_size(newVal, oldVal) {
            // let defaultSize = '25px';//默认值，25px是看workspace找到的
            if (newVal === '') {
                this.setNodeFontSize('');//同步改变workspace中的nodeNodeFontSize
                //CytoscapeKG中在监听到workspace中nodeFontSize刚变回''时
                //会根据节点大小和字数重新渲染各个节点的字体大小，所以不能用统一默认值
                //此处什么也不需要做，因为CytoscapeKG里做了
                return;
            }
            let size = Number(newVal);
            if (!isNaN(size)) {
                this.setNodeFontSize(newVal);//同步改变workspace中的nodeNodeFontSize
                size = parseInt(size);
                for (let node of this.cy.nodes()) {
                    node.style('font-size', size + 'px');
                }
            }
            else {
                if (newVal !== '') {
                    this.informMsg('error','请输入数字');
                }
                this.setNodeFontSize('');//同步改变workspace中的nodeNodeFontSize
                //CytoscapeKG中在监听到workspace中nodeFontSize刚变回''时
                //会根据节点大小和字数重新渲染各个节点的字体大小，所以不能用统一默认值
                //此处什么也不需要做，因为CytoscapeKG里做了
            }
        },
        node_radius(newVal, oldVal) {
            if (newVal === '') {
                this.setNodeRadius('');//同步改变workspace中的nodeRadius
                for (let node of this.cy.nodes()) {
                    node.removeStyle('width');
                    node.removeStyle('height');
                }
                return;
            }
            let radius = Number(newVal);
            if (!isNaN(radius)) {
                radius = parseInt(radius);
                let realRadius = radius * 2;
                this.setNodeRadius(realRadius+"");//同步改变workspace中的nodeRadius
                for (let node of this.cy.nodes()) {//是不是要改成等比例扩大？
                    node.style('width', realRadius + 'px');
                    node.style('height', realRadius + 'px');
                }
            }
            else {
                this.setNodeRadius('');//同步改变workspace中的nodeRadius
                if (newVal !== '') {
                    this.informMsg('error','请输入数字');
                }
                for (let node of this.cy.nodes()) {
                    node.removeStyle('width');
                    node.removeStyle('height');
                }
            }
        }
    },
    computed: {
        ...mapState({
            cy: state => state.workspace.cy,
            statistic_data_change: state => state.workspace.statistic_data_change,
            nodeType: state => state.workspace.nodeType,
            edgeType: state => state.workspace.edgeType,
            layoutType: state => state.workspace.layoutType,
            elements: state => state.workspace.elements,
            pid: state => state.pid,
        }),
        node_checkList_disabled: {
            get() {
                return !this.filter_node_checked;
            }
        },
        edge_checkList_disabled: {
            get() {
                return !this.filter_edge_checked;
            }

        },
    },
    methods:{
        ...mapMutations(['setJsonSrcPath', 'setSeCurrentSearchParams',
            'setCurrentSearchResult','setNodeRadius','setNodeFontSize', 'setProject', 'changeShowQAPanel']),
        changeEditBarState(){
            this.showEditBar = !this.showEditBar;
        },

        open(){
            document.getElementsByClassName("choose-file")[0].click();
        },

        getFilePath(){
            //获取读取我文件的File对象
            let selectedFile = document.getElementsByClassName("choose-file")[0].files[0];
            let reader = new FileReader();//这是核心,读取操作就是由它完成.
            reader.readAsDataURL(selectedFile)
            reader.that = this;
            reader.onload = function () {
                //当读取完成后回调这个函数,然后此时文件的内容存储到了this.result中,直接操作即可
                this.that.setJsonSrcPath(this.result);
            }
        },

        save(){
            let data = {};
            let graphData = this.getDataJsonObject();
            data = {
                nodes: graphData.nodes,
                edges: graphData.edges
            };

            data = this.getCleanData(data);
            console.log("要保存的数据：",data);

            const loading = this.$loading({
                lock: true,
                text: '...保存中...',
                spinner: 'el-icon-loading',
                background: 'rgba(255, 255,255, 0.8)'
            });
            inputKG({...data, pid: this.pid}).then(res => {
                if(res.success){
                    this.setProject(data);
                    this.$message.success('保存成功');
                }else{
                    this.$message.error( '保存失败')
                }
            }).catch( err => {
                console.log(err);
                this.$message.error('网络错误或服务器错误')
            }).finally(() => {
                loading.close();
            })
        },

        changeExportState(){
            this.showExportOps = !this.showExportOps;
        },

        /**
         * 导出全局图片.
         * options: The export options.
         output： Whether the output should be 'base64uri' (default), 'base64', 'blob', or 'blob-promise' (a promise that resolves to the blob is returned).
         bg: The background colour of the image (transparent by default).
         full: Whether to export the current viewport view (false, default) or the entire graph (true).
         scale: This value specifies a positive number that scales the size of the resultant image.
         maxWidth: Specifies the scale automatically in combination with maxHeight such that the resultant image is no wider than maxWidth.
         maxHeight: Specifies the scale automatically in combination with maxWidth such that the resultant image is no taller than maxHeight
         */
        exportPng(){
            this.$message.success("正在导出图片...");
            let blob = this.cy.png({
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
                if (this.cy.elements().length === 0) {
                    this.$message.error("知识图谱已经空啦，导不出东西的呀");
                }
            });
        },

        /**
         * 对象拷贝
         * JSON.parse(JSON.stringify(obj))我们一般用来深拷贝
         但不是完全深拷贝，有以下特点：
         1、如果obj里面有时间对象，则JSON.stringify后再JSON.parse的结果，时间将只是字符串的形式。而不是时间对象；
         2、如果obj里有RegExp、Error对象，则序列化的结果将只得到空对象；
         3、如果obj里有函数，undefined，则序列化的结果会把函数或 undefined丢失；
         4、如果obj里有NaN、Infinity和-Infinity，则序列化的结果会变成null
         5、JSON.stringify()只能序列化对象的可枚举的自有属性，例如 如果obj中的对象是有构造函数生成的， 则使用JSON.parse(JSON.stringify(obj))深拷贝后，会丢弃对象的constructor；
         6、如果对象中存在循环引用的情况也无法正确实现深拷贝；

         注：由于前后端数据格式不统一，这里对数据格式做了转化。
         日后前/后端有修改时这里都要改！
         */
        getDataJsonObject() {
            let eles = JSON.parse(JSON.stringify(this.cy.json().elements));//其实深拷贝可能没啥意义，只是单纯直觉上想用一用(*╹▽╹*)
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
        getCleanData(eles) {
            let obj = {"edges": [], "nodes": []};
            if (JSON.stringify(eles) !== '{}') {
                if (eles.edges !== undefined && eles.edges.length > 0) {
                    eles.edges.forEach(val => {
                        obj.edges.push({
                            data: {
                                id:val.data.id,
                                type:val.data.type,
                                relation:val.data.relation,
                                source:val.data.source,
                                target:val.data.target
                            }
                        });
                    });
                }
                if (eles.nodes !== undefined && eles.nodes.length > 0) {
                    eles.nodes.forEach(val => {
                        obj.nodes.push({
                            data: {
                                id:val.data.id,
                                type:val.data.type,
                                name:val.data.name,
                                property:val.data.property
                            },
                            position: val.position
                        });
                    });
                }
            }
            return obj;
        },
        exportJson(){
            this.$message("正在导出json...");
            //有空也可以改成promise式的
            let data = this.getDataJsonObject();
            let filename =  this.generateFileName() + '.json';
            if(typeof data === 'object'){
                data = JSON.stringify(data, undefined, 4)
            }
            // 要创建一个 blob 数据
            let blob = new Blob([data], {type: 'text/json'}),
                a = document.createElement('a');
            a.download = filename;

            // 将blob转换为地址
            // 创建 URL 的 Blob 对象
            let url = window.URL.createObjectURL(blob)
            a.href = url;

            // 标签 data- 嵌入自定义属性  屏蔽后也可正常下载
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');

            // 添加鼠标事件并向一个指定的事件目标派发
            let e = document.createEvent('MouseEvents');
            e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);

            // 释放掉blob对象
            window.URL.revokeObjectURL(url);
        },

        generateFileName(){
            let name = "";
            try{
                // TODO: 项目名
                name = this.current_project.project_name;
            }catch (e) {
                console.log("Error occurs:"+e);
                console.log("可能未连接到Server");
                name = new Date().getTime();
            }
            return name;
        },

        /**
         * 获取统计数据，即给 data 中的 entities_data 和 relaions_data 赋值
         */
        get_statistic_data(){
            let data = this.getDataJsonObject();
            let nodes = data.nodes,
                edges = data.edges;
            let EData = {
                individual: 0,
                organization: 0,
                thing: 0,
                default: 0,
                total: nodes.length
            };
            for (let node of nodes){
                if (!(node.data.type == 'individual' || node.data.type == 'organization' || node.data.type == 'thing')){
                    EData['default'] ++;
                }else {
                    EData[node.data.type] ++;
                }
            }
            let RData = {
                connection: 0,
                inheritance: 0,
                default: 0,
                total: edges.length
            }
            for (let edge of edges){
                RData[edge.data.type] ++;
            }
            this.entities_data = [EData];
            this.relations_data = [RData];
        },

        ///////////////////////////////////此处为过滤代码///////////////////////////////////////
        nodeFilter(){
            let checkList = this.filter_node_checkList;
            this.cy.nodes().forEach(val=>{
                let hit = checkList.includes(val.data('type'));
               if(hit&&!val.hasClass('removed')) {
                   val.addClass('removed');
               }else if(!hit&&val.hasClass('removed')){
                   val.removeClass('removed');
               }
            });
        },
        edgeFilter(){
            let checkList = this.filter_edge_checkList;
            this.cy.edges().forEach(val=>{
                let hit = checkList.includes(val.data('type'));
                if(hit&&!val.hasClass('hidden')) {
                    val.addClass('hidden');
                }else if(!hit&&val.hasClass('hidden')){
                    val.removeClass('hidden');
                }
            });
        },
        nodeDefilter(){
            if(this.filter_node_checkList.length===0)return;
            this.cy.nodes().forEach(val=>{
                if(val.hasClass('removed')){
                    val.removeClass('removed');
                }
            });
            this.filter_node_checkList = [];
        },
        edgeDefilter(){
            if(this.filter_edge_checkList.length===0)return;
            this.cy.edges().forEach(val=>{
                if(val.hasClass('hidden')){
                    val.removeClass('hidden');
                }
            });
            this.filter_edge_checkList = [];
        },
    },
}
