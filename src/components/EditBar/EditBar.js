import { mapState,mapMutations,mapActions,mapGetters } from 'vuex';
import { setGraphAPI } from "../../api/basicAPI";
import OpItem from './OpItem';
import EditBarBlock from "./EditBarBlock";

export default {
    name: "EditBar",
    components: {OpItem,EditBarBlock},
    data(){
        return{
            showEditBar: true,
            showExportOps: false,
            opInfo: '打开的文件后缀为".json"，其表示一个知识图谱\n',
            entities_data: [],
            relations_data: [],

            search_text: '',
            search_type: '',
            select_value: '',
            showEnabled: false,
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


            filter_type: '',
            filter_specific_type: '',
            specific_types: null,
            filter_disabled: true,
            filterShowEnabled: false
        }
    },
    // mounted() {
    //     this.specific_types = this.nodeType;
    // },
    watch: {
        cy(newValue, oldValue){
            this.get_statistic_data();
        },
        statistic_data_change(newValue, oldValue){
            this.get_statistic_data();
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
    },
    ////////////////////////此处为搜索相关代码段////////////////////

    ////////////////////////////////////////////////////////////
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
            let eles = JSON.parse(JSON.stringify(this.cy.json().elements));
            let obj = {"edges": [], "nodes": []};
            if (JSON.stringify(eles) !== '{}') {
                if (eles.edges !== undefined && eles.edges.length > 0) {
                    eles.edges.forEach(val => {
                        let newData = {
                            ...val.data
                        };
                        obj.edges.push({data: newData});
                    });
                }
                if (eles.nodes !== undefined && eles.nodes.length > 0) {
                    eles.nodes.forEach(val => {
                        let newData = {
                            ...val.data
                        };
                        obj.nodes.push({data: newData});
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
        getSearchType(search_type) {
            return search_type === '1' ? this.cy.nodes() : this.cy.edges();
        },

        getDisplay(search_type) {
            return search_type === '1' ? this.nodeDisplay : this.edgeDisplay;
        },

        getRender(search_type) {
            return search_type === '1' ? this.rendNode : this.rendEdge;
        },

        getName(search_type, val) {
            return search_type === '1' ? val.data().name : val.data().relation;
        },

        setSearchParams() {
            this.currentSearch.params = {
                search_text: this.search_text,
                search_type: this.search_type,
                select_value: this.select_value
            }
        },

        clearSearchContent() {
            this.search_text = '';
            this.search_type = '';
            this.select_value = '';
        },

        checkParams() {
            if (this.search_type === '') {
                this.$message({
                    message: '请选择搜索类型',
                    type: 'error',
                    duration: 1500
                });
                return false;
            }

            return true;
        },

        //根据具体搜索条件还需进行修改
        search() {
            let flag = this.checkParams();

            if (!flag) {
                return;
            }
            //保存搜索参数
            this.setSearchParams();

            //搜索
            let params = this.currentSearch.params;
            let target = this.getSearchType(params.search_type);
            let name;
            let count = 0;
            console.log(target)
            target.forEach((val) =>{
                console.log(val);
                name = this.getName(params.search_type, val);
                console.log(name);
                let flagName = params.search_text === '' ? true : this.fuzzyMatch(name, params.search_text);
                console.log('flagName', flagName)
                let flagProperty;
                flagProperty = params.select_value === '' ? true : val.data().property.includes(params.select_value);
                console.log('flagProperty', flagProperty)
                if (flagName && flagProperty) {
                    count++;
                    this.currentSearch.result.push(val.data());
                    val.addClass('searched');
                }
            });

            console.log(this.currentSearch)

            if (count > 0) {
                let display = this.getDisplay(params.search_type);
                this.searchDisplay(display);
                this.$message({
                    message: '搜索完毕',
                    type: 'success',
                    duration: 1500
                });
            }
            else {
                this.$message({
                    message: '未找到符合条件的结果',
                    type: 'error',
                    duration: 1500
                });
            }

            this.showEnabled = true;

        },

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

        searchDisplay(display) {
            let params = this.currentSearch.params;
            let target = this.getSearchType(params.search_type);

            target.forEach((val) => {
                if (val.hasClass('searched')) {
                    display(val);
                }
            });
        },

        nodeDisplay(val) {
            val.style('background-color', '#ebc57c');
        },

        edgeDisplay(val) {
            val.style('color', '#ebc57c');
        },

        desearch() {
            let params = this.currentSearch.params;
            let target = this.getSearchType(params.search_type);

            let render = this.getRender(params.search_type);

            target.forEach((val) =>{

                if (val.hasClass('searched')) {
                    console.log(val);
                    val.removeClass('searched');
                    render(val);
                }
            });

            this.clearSearchContent();

            this.showEnabled = false;

            this.searchLog.push(this.currentSearch);

            console.log('searchLog', this.searchLog)
        },



        ///////////////////////////////////////////////////希望之后能进行复用////////////////////////////////////////////
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
        rendNode(target) {
            let name = target.data().name;
            const text = this.fontShow(name);
            target.data({nameShowed: text});
            const style = this.fontStyle(text.length);
            target.style(style);
            target.style('background-color', '#9c8f96');
        },

        rendEdge(target){
            let name = target.data().relation;
            const text = this.fontShow(name);
            target.data({nameShowed: text});
            target.style('color', '#eea39d');
        },
        //////////////////////////////////////////////////////////////////////////////////////

        ///////////////////////////////////此处为过滤代码///////////////////////////////////////
        /*
        * 不知该如何取得node所连边，暂时注释通过关系过滤节点的相关方法
        * 不过我觉得这样也还好，本来也没要求
        * */
        filter() {
            console.log("execute filter")
            console.log(this.filter_type)
            console.log(this.filter_specific_type)
            let value = this.filter_specific_type;

            if (value === '') {
                this.$message({
                    message: '请选择过滤类型',
                    type: 'error',
                    duration: 1500
                });
                return;
            }



            if (this.filter_type === '1') {
                console.log(value);
                let target_nodes = this.cy.nodes().filter(function (ele) {
                    console.log(ele.data('type') !== value);
                    return ele.data('type') !== value;
                });
                for (let node of target_nodes) {
                    node.addClass('filteredNode');
                    node.style('display', 'none');
                    console.log(node);
                }
            }
            else {
                let target_edges = this.cy.edges().filter(function (ele) {
                    return ele.data('type') !== value;
                })
                for (let edge of target_edges) {
                    console.log(edge);
                    edge.addClass('filteredEdge');
                    edge.style('display', 'none');
                }
                for (let node of this.cy.nodes()) {
                    let flag = true;
                    console.log("node",node);
                    console.log(node.connectedEdges());
                    for (let edge of node.connectedEdges()) {
                        console.log("edge", edge);
                        if (!edge.hasClass('filteredEdge')) {
                            console.log('here')
                            flag = false;
                            break;
                        }
                    }
                    if (flag) {
                        node.addClass('filteredEdge');
                        node.style('display', 'none');
                    }
                }
            }
            this.filterShowEnabled = true;
        },

        defilter() {
            if (this.filter_type === '1') {
                for (let node of this.cy.nodes()) {
                    if (node.hasClass('filteredNode')) {
                        node.removeStyle('display');
                        node.removeClass('filteredNode');
                    }
                }
            }
            else {
                for (let target of this.cy.elements()) {
                    if (target.hasClass('filteredEdge')) {
                        target.removeClass('filteredEdge');
                        target.removeStyle('display');
                    }
                }
            }

            this.filterShowEnabled = false;
            this.filter_specific_type = '';
            this.filter_type = '';
        }
        /////////////////////////////////////////////////////////////////////////////////////
    }
}
