import { mapState,mapMutations,mapActions,mapGetters } from 'vuex';
import { setGraphAPI } from "../../api/basicAPI";
import OpItem from './OpItem';
import EditBarBlock from "./EditBarBlock";
import TagEditor from "../PropEditTool/TagEditor"; //
import {toRaw} from 'vue'
import {isNumber} from "element-plus/es/utils/util";

export default {
    name: "EditBar",
    components: {OpItem,EditBarBlock,TagEditor}, //
    data(){
        return{
            showEditBar: true,
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

            search_text: '',
            search_type: '',
            select_value: '',
            showEnabled: false,
            edgeDisabled: true,
            types: [
                {
                    label: '节点',
                    value: '1'
                },
                {
                    label: '关系',
                    value: '2'
                }
            ],
            currentSearch: {
                params: {},
                result: []
            },
            searchLog: [],

            //////////////////////过滤相关/////////////////////////////

            filter_disabled: true,
            filterShowEnabled: false,

            filter_node_checked: false,
            filter_node_checkList: [],
            filter_edge_checked: false,
            filter_edge_checkList: [],

            //////////////////////展示效果相关////////////////////////////////
            layout_type: '',
            layout_types: [
                {
                    label: 'random',
                    value: 'random'
                },
                {
                    label: 'grid',
                    value: 'grid'
                },
                {
                    label: 'circle',
                    value: 'circle'
                },
                {
                    label: 'preset',
                    value: 'preset'
                },
                {
                    label: 'concentric',
                    value: 'concentric'
                },
                {
                    label: 'breadthfirst',
                    value: 'breadthfirst'
                },
                {
                    label: 'cose',
                    value: 'cose'
                }
            ],
            relation_label_enabled: 1,
            font_size: '',
            node_radius: '',

        }
    },
    watch: {
        //暂时注释避免影响cy使用
        // cy(newValue, oldValue){
        //     this.get_statistic_data();
        //     console.log("cy", newValue)
        //     this.layout_type = newValue.options().layout.name;
        // },
        statistic_data_change(newValue, oldValue){
            this.get_statistic_data();
        },
        search_type(newVal, oldVal) {
            this.edgeDisabled = newVal !== '1';
        },
        filter_type(newVal, oldVal) {
            console.log(newVal);
            if (newVal === '') {
                this.filter_disabled = true;
            }
            else {
                this.filter_disabled = false;
                if (newVal === '1') {
                    this.specific_types = this.nodeType;
                    console.log(this.nodeType)
                }
                else  if (newVal === '2') {
                    this.specific_types = this.edgeType;
                    console.log(this.edgeType)
                }
                else {
                    console.log('类型错误！！！')
                }
                console.log(this.specific_types);
            }
        },
        /////////////////////////////展示相关//////////////////////////////
        layout_type(newVal, oldVal) {
            console.log(newVal);
            let layout = this.cy.layout({name: newVal})
            layout.run();
        },
        //在workspace中添加css不能起作用，不知道为什么，暂时先通过style进行设置
        relation_label_enabled(newVal, oldVal) {
            console.log(newVal, typeof newVal)
            if (newVal === 1) {
                for (let edge of this.cy.edges()) {
                    edge.removeStyle('text-opacity');
                }
            }
            else {
                for (let edge of this.cy.edges()) {
                    edge.style('text-opacity', 0)
                }

            }
        },
        font_size(newVal, oldVal) {
            console.log(newVal)

            //默认值，25px是看workspace找到的
            if (newVal === '') {
                for (let node of this.cy.nodes()) {
                    node.style('font-size', '25px');
                }
                return;
            }

            let size = Number(newVal);
            console.log(size)
            if (!isNaN(size)) {
                size = parseInt(size);
                for (let node of this.cy.nodes()) {
                    node.style('font-size', size + 'px');
                }
            }
            else {
                if (newVal !== '') {
                    this.$message({
                        message: '请输入数字',
                        type: 'error',
                        duration: 1500
                    });
                }
                for (let node of this.cy.nodes()) {
                    node.style('font-size', '25px');
                }
            }
        },
        node_radius(newVal, oldVal) {
            if (newVal === '') {
                for (let node of this.cy.nodes()) {
                    node.removeStyle('width');
                    node.removeStyle('height');
                }
                return;
            }

            let radius = Number(newVal);
            if (!isNaN(radius)) {
                radius = parseInt(radius);
                for (let node of this.cy.nodes()) {
                    node.style('width', (radius * 2) + 'px');
                    node.style('height', (radius * 2) + 'px');
                }
            }
            else {
                if (newVal !== '') {
                    this.$message({
                        message: '请输入数字',
                        type: 'error',
                        duration: 1500
                    });
                }
                for (let node of this.cy.nodes()) {
                    node.removeStyle('width');
                    node.removeStyle('height');
                }
            }
        }
    },
    mounted() {
    },
    computed: {
        ...mapState({
            current_pid: state => state.current_pid,
            workspace_text: state => state.workspace.workspace_text,
            cy: state => state.workspace.cy,
            statistic_data_change: state => state.workspace.statistic_data_change,
            nodeType: state => state.workspace.nodeType,
            edgeType: state => state.workspace.edgeType
        }),
        ...mapGetters(['current_project']),
        text: {
            get(){
                return this.workspace_text;
            },
            set(value){
                this.setWorkspaceText(value);
            }
        },
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
        ...mapMutations(['setWorkspaceText', 'setJsonSrcPath', 'updateProjectInfo', 'setSeCurrentSearchParams', 'setCurrentSearchResult']),
        ...mapActions(['postText']),

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
            try{
                data = {
                    project_name: this.current_project.project_name,
                    pid: this.current_pid,
                    text: this.current_project.text,
                    ...this.getDataJsonObject()
                }
            }catch (e) {
                console.log("Error occurs:"+e);
                alert("保存不了哦，请检查是否连接到Server");
                return false;
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
                    this.$message.success('保存成功')
                }else{
                    this.$message.error( '保存失败')
                }
            }).catch( err => {
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
                name = this.current_project.project_name;
            }catch (e) {
                console.log("Error occurs:"+e);
                console.log("可能未连接到Server");
                name = new Date().getTime();
            }
            return name;
        },

        /**
         * 导出局部图片.暂时不用
         */
        exportCutPng() {
            let unselectedVertexes = this.cy.elements('node:unselected')
            if (!unselectedVertexes || 0 === unselectedVertexes.length) {
                this.exportPng();
            }else{
                let remove = unselectedVertexes.remove(); // 保留删除内容
                this.exportPng();
                (remove && remove.length) && (remove.restore()); // 恢复删除内容
            }
        },


        /**
         * 保存输入的文本并解析成图
         */
        saveAndAnalyse(){
            let data = {
                pid: this.current_pid,
                text: this.workspace_text
            }
            this.postText(data).then(res => {
                this.$message({
                    message: '保存文本成功',
                    type: 'success',
                    duration: 1500
                })
            }).catch(err => {
                this.$message({
                    message: '保存文本失败',
                    type: 'error',
                    duration: 1500
                });
            })
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
                EData[node.data.type] ++;
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

        ///////////////////////////////////此处为搜索相关代码段///////////////////////////////////
        // getSearchType(search_type) {
        //     return search_type === '1' ? this.cy.nodes() : this.cy.edges();
        // },
        //
        //
        // getName(search_type, val) {
        //     return search_type === '1' ? val.data().name : val.data().relation;
        // },
        //
        // setSearchParams() {
        //     this.currentSearch.params = {
        //         search_text: this.search_text,
        //         search_type: this.search_type,
        //         select_value: this.select_value
        //     }
        // },
        //
        // clearSearchContent() {
        //     this.search_text = '';
        //     this.search_type = '';
        //     this.select_value = '';
        //     this.currentSearch = {
        //         params: {},
        //         result: []
        //     };
        // },

        checkKeyWords(text){
            let nameValid = /\S/;
            let keyWords = [];
            text.forEach(val=>{//校验、去重
                if(nameValid.test(val)){
                    let item = val.trim();
                    if(!keyWords.includes(item)) keyWords.push(item);
                }
            });
            return keyWords;
        },

        saveSearchLog(keyWords,log){//添加搜索日志
            keyWords.forEach(val=>{
                let index = log.findIndex(item=>item===val);
                if(index<0){//更新日志位置
                    log.unshift(val);//添加在头部
                }

            });
            let maxLen = this.max_log_len;
            if(log.length>maxLen){//清除多余的早期历史记录
                log.slice(maxLen,log.length-maxLen);
            }
        },

        searchNode(){
            let keyWords = this.checkKeyWords(this.search_node_text);
            let condition = this.search_node_condition;
            this.search_node_text = keyWords;//自动简化搜索框内容
            if(keyWords.length===0||condition.length===0){
                this.informMsg('error','请确认搜索内容和筛选条件都不为空哦');
                return;
            }
            console.log("(keyWords, condition, log) before saveLog",keyWords,condition,this.search_node_log);

            //开始一次搜索
            this.saveSearchLog(keyWords,this.search_node_log);//保存搜索历史
            console.log("(keyWords, condition, log) after saveLog",keyWords,condition,this.search_node_log);
            const byName = condition.includes('name');
            const byRelation = condition.includes('relation');
            const byProp = condition.includes('property');
            let nodes = this.cy.nodes();
            let count = 0;
            nodes.forEach(val=>{
                if (val.hasClass('searchedNode')) {
                    val.removeClass('searchedNode');
                }
                let valName = val.data("name");
                let valProps = val.data("property");
                let edges = val._private.edges;
                let hit = false;
                let relaHit;
                let propHit;
                for(let key of keyWords){
                    if(byName&&this.fuzzyMatch(valName, key)) {
                        hit = true;
                        break;
                    }
                    if(byProp){
                        propHit = false;
                        for(let prop of valProps){
                            if(this.fuzzyMatch(prop, key)){
                                propHit=true;
                                break;
                            }
                        }
                        if(propHit){
                            hit = true;
                            break;
                        }
                    }
                    if(byRelation){
                        relaHit = false;
                        for(let edge of edges){
                            let edgeName = edge.data("relation");
                            if(this.fuzzyMatch(edgeName, key)){
                                relaHit = true;
                                break;
                            }
                        }
                        if(relaHit){
                            hit = true;
                            break;
                        }
                    }
                }
                if(hit){
                    count += 1;
                    val.addClass('searchedNode');
                }
            });
            this.informResult(count > 0,'搜索完毕','未找到符合条件的结果')
            this.node_searched = true;
        },

        searchEdge(){
            let keyWords = this.checkKeyWords(this.search_edge_text);
            let condition = this.search_edge_condition;
            this.search_edge_text = keyWords;//自动简化搜索框内容
            if(keyWords.length===0||condition.length===0){
                this.informMsg('error','请确认搜索内容和筛选条件都不为空哦');
                return;
            }

            //开始一次搜索
            this.saveSearchLog(keyWords,this.search_edge_log);//保存搜索历史
            const byName = condition.includes('relation');
            const bySource = condition.includes('source');
            const byTarget = condition.includes('target');
            let edges = this.cy.edges();
            let count = 0;
            edges.forEach(val=>{
                if (val.hasClass('searchedEdge')) {
                    val.removeClass('searchedEdge');
                }
                let valName = val.data("relation");
                let valSource = this.cy.$id(val.data("source")).data("name");
                let valTarget = this.cy.$id(val.data("target")).data("name");
                let hit = false;
                let nameHit;
                let sHit;
                let tHit;
                for(let key of keyWords){
                    if((byName&&this.fuzzyMatch(valName, key))||
                        (bySource&&this.fuzzyMatch(valSource,key))||
                        (byTarget&&this.fuzzyMatch(valTarget,key))) {
                        hit = true;
                        break;
                    }
                }
                if(hit){
                    count += 1;
                    val.addClass('searchedEdge');
                }
            });
            this.informResult(count > 0,'搜索完毕','未找到符合条件的结果');
            this.edge_searched = true;
        },

        informResult(isSuccess,success_msg,error_msg){
            if (isSuccess) {
                this.informMsg('success',success_msg);
            }
            else {
                this.informMsg('error',error_msg);
            }
        },

        informMsg(type,msg) {
            this.$message({
                message: msg,
                type: type,
                duration: 1500
            });
        },

        // //根据具体搜索条件还需进行修改
        // search() {
        //     let flag = this.checkParams();
        //
        //     if (!flag) {
        //         return;
        //     }
        //     //保存搜索参数
        //     this.setSearchParams();
        //
        //     //搜索
        //     let params = this.currentSearch.params;
        //     let target = this.getSearchType(params.search_type);
        //     let name;
        //     let count = 0;
        //     console.log(target)
        //     target.forEach((val) =>{
        //         name = this.getName(params.search_type, val);
        //         console.log(name);
        //         let flagName = params.search_text === '' ? true : this.fuzzyMatch(name, params.search_text);
        //         console.log('flagName', flagName)
        //
        //
        //
        //         if (this.search_type === '2') {
        //             if (flagName) {
        //                 count++;
        //                 this.currentSearch.result.push(val.data());
        //                 val.source().addClass('searchedNode');
        //                 val.target().addClass('searchedNode')
        //             }
        //             console.log(val)
        //         }
        //         else {
        //             let flagProperty;
        //             flagProperty = params.select_value === '' ? true : val.data().property.includes(params.select_value);
        //             console.log('flagProperty', flagProperty)
        //             if (flagName && flagProperty) {
        //                 count++;
        //                 this.currentSearch.result.push(val.data());
        //                 val.addClass('searchedNode');
        //             }
        //         }
        //
        //
        //     });
        //
        //     console.log(this.currentSearch)
        //
        //     if (count > 0) {
        //         //let display = this.getDisplay(params.search_type);
        //         //this.searchDisplay(display);
        //         this.$message({
        //             message: '搜索完毕',
        //             type: 'success',
        //             duration: 1500
        //         });
        //     }
        //     else {
        //         this.$message({
        //             message: '未找到符合条件的结果',
        //             type: 'error',
        //             duration: 1500
        //         });
        //     }
        //
        //     this.showEnabled = true;
        //
        // },

        fuzzyMatch(str, key){
            let index = -1, flag = false;
            for(let i = 0, arr = key.split(""); i < arr.length; i++ ){
            //有一个关键字都没匹配到，则没有匹配到数据
                if(str.indexOf(arr[i]) < 0){
                    break;
                }else{
                    let match = str.matchAll(arr[i]);
                    let next = match.next();
                    while (!next.done){
                        if(next.value.index > index){
                            index = next.value.index;
                            if(i === arr.length - 1){
                                flag = true
                            }
                            break;
                        }
                        next = match.next();
                    }
                }
            }
            return flag;
        },

        desearchNode(){
            let nodes = this.cy.nodes();
            nodes.forEach(val=>{
                if (val.hasClass('searchedNode')) {
                    val.removeClass('searchedNode');
                }
                this.search_node_condition = [];
                this.search_node_text = [];
                this.node_searched = false;
            });
        },

        desearchEdge(){
            let edges = this.cy.edges();
            edges.forEach(val=>{
                if (val.hasClass('searchedEdge')) {
                    val.removeClass('searchedEdge');
                }
                this.search_edge_condition = [];
                this.search_edge_text = [];
                this.edge_searched = false;
            });
        },

        // desearch() {
        //     let params = this.currentSearch.params;
        //     let target = this.cy.nodes();
        //
        //     target.forEach((val) =>{
        //
        //         if (val.hasClass('searchedNode')) {
        //             console.log(val);
        //             val.removeClass('searchedNode');
        //         }
        //     });
        //
        //     this.clearSearchContent();
        //
        //     this.showEnabled = false;
        //
        //     this.searchLog.push(this.currentSearch);
        //
        //     console.log('searchLog', this.searchLog)
        // },


        ///////////////////////////////////此处为过滤代码///////////////////////////////////////

        filter() {
            console.log("execute filter")

            let flag = this.filter_node_checked || this.filter_edge_checked;
            console.log(flag)
            if (!flag) {
                this.$message({
                    message: '请选择过滤类型',
                    type: 'error',
                    duration: 1500
                });
                return;
            }



            if (this.filter_node_checked) {
                let checkList = this.filter_node_checkList;
                let target_nodes = this.cy.nodes().filter(function (ele) {
                    return !checkList.includes(ele.data('type'));
                });
                for (let node of target_nodes) {
                    node.addClass('filtered');
                    console.log(node);
                }
            }
            if (this.filter_edge_checked) {
                let checkList = this.filter_edge_checkList;
                let target_edges = this.cy.edges().filter(function (ele) {
                    return !checkList.includes(ele.data('type'));
                })
                for (let edge of target_edges) {
                    console.log(edge);
                    edge.addClass('filtered');
                }
                for (let node of this.cy.nodes()) {
                    let flag = true;
                    console.log("node",node);
                    console.log(node.connectedEdges());
                    for (let edge of node.connectedEdges()) {
                        console.log("edge", edge);
                        if (!edge.hasClass('filtered')) {
                            flag = false;
                            break;
                        }
                    }
                    if (flag) {
                        node.addClass('filtered');
                    }
                }
            }
            this.filterShowEnabled = true;
        },

        defilter() {
            for (let target of this.cy.elements()) {
                target.removeClass('filtered');
            }
            this.filterShowEnabled = false;

            this.clearFilterParams();
        },

        clearFilterParams() {
            this.filter_node_checkList = [];
            this.filter_edge_checkList = [];
            this.filter_node_checked = false;
            this.filter_edge_checked = false;
        }
        /////////////////////////////////////////////////////////////////////////////////////
    }
}
