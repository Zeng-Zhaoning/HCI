<template>
  <div class="op" @click="open">
    <svg class="icon" aria-hidden="true">
      <use :xlink:href="icon"></use>
    </svg>
    <div class="text-box">
      {{ opName }}
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "OpItem",
  props:{
    opName: String,
    icon: String,
  }
}
</script>

<style lang="less">
@import "../../assets/css/colors.less";
@len1 : 10px;
@len2 : 12px;
.op{
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border: none;
  font-family: 幼圆;
  color: #909399;
  font-weight: bold;
  font-size: 13px;
  margin: @len2 @len2 @len1 @len2;
  position: relative;
  text-align: center;
  svg{
    height: 30px;
    width: 30px;
  }
}
.op:hover{
  cursor: pointer;
  .text-box{
    color: @myblack;
  }
}

@len3: 42.22px;
.choose-format-box{
  transform: translate3d(0,0,0);  //硬件加速
  height: @len3;
  border: 1px solid @separator;
  border-radius: 4px;
  border-left: none;
  position: absolute;
  left: @len3 - 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  z-index: 1;
  .export-op{
    background-color: white;
    height: @len3;
    line-height: @len3;
    width: @len3+10px;
    text-align: center;
    color: @prompt;
    font-size: 13px;
  }
  .export-op:hover{
    background-color: #f0f7ff;
    color: @theme;
  }
  overflow: hidden;
}

.collapsed {
  transition: max-width 0.35s cubic-bezier(0, 1, 0, 1);
  max-width: 0;
  border-right: none;
}
.expanded {
  max-width: 999px;
  transition: max-width 0.35s cubic-bezier(0.75, 0, 0.9, 0);
}

</style>