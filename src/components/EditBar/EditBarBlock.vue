<template>
  <div class="edit-block" :class="{'collapsed-edit-block':!show, 'expanded-edit-block':show}">
    <div class="title">
      <span>{{ blockName }}</span>
    </div>
    <span class="control-edit-block" @click="changeShow" v-if="blockName !== '操作'">
      <i :class="{'el-icon-arrow-up': show, 'el-icon-arrow-down': !show}"></i>
    </span>
    <div style="margin-top: 12px">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "EditBlock",
  props:{
    blockName: String
  },
  data(){
    return {
      show: this.blockName==="操作",
    }
  },
  methods:{
    changeShow(){
      this.show = ! this.show;
    }
  }
}
</script>

<style lang="less">
@import "../../assets/css/colors.less";
@len1 : 10px;
@len2 : 14px;
@len3 : 20px;
.edit-block{
  padding: @len2 @len2;
  margin-bottom: 5px;
  border-radius: 4px;
  background-color: white;
  box-shadow: -5px 0 10px #e6e6e6;
  position: relative;
  width: 300px - 2*@len2;
  overflow: hidden;
}
.title{
  color: @theme;
  font-weight: bold;
  font-size: 15px;
  font-family: 微软雅黑;
  height: @len3;
  span{
    line-height: @len3;
  }
}

.control-edit-block{
  position: absolute;
  top: @len2;
  right: @len2;
  color: #6a85ce;
  height: 20px;
  i{
    line-height: 20px;
  }
}
.control-edit-block:hover{
  cursor: pointer;
}

.collapsed-edit-block {
  transition: max-height 0.3s cubic-bezier(0, 1, 0, 1);
  max-height: @len3;
}
.expanded-edit-block {
  max-height: 999px;
  transition: max-height 0.3s cubic-bezier(0.75, 0, 0.9, 0);
}
</style>