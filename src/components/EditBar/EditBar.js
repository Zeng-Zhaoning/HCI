import { mapState,mapMutations,mapActions,mapGetters } from 'vuex';
import { setGraphAPI } from "../../api/basicAPI";

export default {
    name: "EditBar",
    data(){
        return{
            showEditBar: true,
            showExportOps: false,
            tree: [{
                label: '一级 1',
                children: [{
                    label: '二级 1-1',
                    children: [{
                        label: '三级 1-1-1'
                    }]
                }]
            }],
            defaultProps: {
                children: 'children',
                label: 'label'
            }
        }
    },
    computed: {
        ...mapState({
            current_pid: state => state.current_pid,
            workspace_text: state => state.workspace.workspace_text,
            cy: state => state.workspace.cy,
        }),
        ...mapGetters(['current_project']),
        text: {
            get(){
                return this.workspace_text;
            },
            set(value){
                this.setWorkspaceText(value);
            }
        }
    },
    methods:{
        ...mapMutations(['setWorkspaceText', 'setProjectGraph']),
        ...mapActions(['postText']),

        analyse(){
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

        save(){
            this.$message('保存中...')
            let data = {
                project_name: this.current_project.project_name,
                pid: this.current_pid,
                text: this.current_project.text,
                ...this.getDataJsonObject()
            }
            setGraphAPI(data).then(res => {
                if(res.success){
                    this.$message.success('保存成功')
                }else{
                    this.$message.error( '保存失败')
                }
            }).catch( err => {
                this.$message.error('网络错误或服务器错误')
            })
        },

        changeEditBarState(){
            this.showEditBar = !this.showEditBar;
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
                aLink.download = this.current_project.project_name + '.png';
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
                if (eles.edges.length > 0) {
                    eles.edges.forEach(val => {
                        let data = {};
                        //data.id = val.data.id;
                        data.subid = val.data.source;
                        data.objid = val.data.target;
                        data.relation = val.data.label;
                        obj.edges.push(data);
                    });
                }
                if (eles.nodes.length > 0) {
                    eles.nodes.forEach(val => {
                        let data = {};
                        data.id = val.data.id;
                        data.name = val.data.content;
                        obj.nodes.push(data);
                    });
                }
            }
            //console.log("eles_simple_json", obj);
            return obj;
        },
        exportJson(){
            this.$message("正在导出json...");
            //有空也可以改成promise式的
            let data = this.getDataJsonObject();
            let filename =  this.current_project.project_name + '.json';
            if(typeof data === 'object'){
                data = JSON.stringify(data, undefined, 4)
            }
            // 要创建一个 blob 数据
            let blob = new Blob([data], {type: 'text/json'}),
                a = document.createElement('a');
            a.download = filename;

            // 将blob转换为地址
            // 创建 URL 的 Blob 对象
            a.href = window.URL.createObjectURL(blob);

            // 标签 data- 嵌入自定义属性  屏蔽后也可正常下载
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');

            // 添加鼠标事件并向一个指定的事件目标派发
            let e = document.createEvent('MouseEvents');
            e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);

            // 释放掉blob对象
            window.URL.revokeObjectURL(url);
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
    }
}