<template>
    <div>
        <el-tag :key="tag"
                v-for="tag in properties"
                closable
                style="margin-right: 1%;max-width:90%;"
                @close="handleClose">
            <span style="display:inline-flex;max-width:90%;overflow:hidden;text-overflow:ellipsis;">
                {{tag}}
            </span>
        </el-tag>
        <el-input
                v-if="tagInputVisible"
                v-model="tagInputValue"
                ref="saveTagInput"
                size="small"
                style="width: 10%;"
                @keyup.enter.native="handleTagInputConfirm"
                @blur="handleTagInputConfirm"
        >
        </el-input>
        <el-button v-else size="small" @click="showTagInput">新增＋</el-button>
    </div>

</template>

<script>
    //使用示例：<tag-editor v-model:properties="form.properties"></tag-editor>
    //因为样式上没调好看，最终没用上这个，但是删了又可惜，留在这当做我努力过吧(╥﹏╥)
    export default {
        name: "TagEditor",
        model:{
          prop: 'properties',
          event: 'change'
        },
        data(){
            return {
                tagInputVisible: false,
                tagInputValue: '',

            };
        },
        props:{
            properties: Array
        },
        methods:{
            handleClose(){
                properties.splice(properties.indexOf(tag), 1);
                this.$emit('change',this.properties);
            },
            showTagInput() {
                this.tagInputVisible = true;
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },
            handleTagInputConfirm() {
                let tagInputValue = this.tagInputValue;
                if (tagInputValue) {
                    this.properties.push(tagInputValue);
                    this.$emit('change',this.properties);
                }
                this.tagInputVisible = false;
                this.tagInputValue = '';
            }
        }
    }
</script>

<style scoped>

</style>
