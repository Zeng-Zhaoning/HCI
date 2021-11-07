<!--element 的按钮实在太奇怪了，按下去之后无法恢复原状，网上解决方法都无效，让我很不爽-->
<template>
  <div class="mybtn-box">
    <button>
      <slot></slot>
    </button>
  </div>
</template>

<script>
export default {
  name: "MyButton",
}
</script>

<style scoped lang="less">
@import "../../assets/css/colors.less";
@len1 : 10px;
@len2 : 12px;

.mybtn-box{
  display: flex;
  align-content: center;
  justify-content: center;
  width: 100px;
  height: 35px;
}

button{
  padding: @len1 0 @len1 0;
  text-align: center;
  line-height: 100%;
  font-size: 13px;
  width: 100%;
  height: 100%;
  color: @theme;
  background: white;
  border: 1px solid #dadce7;
  border-radius: 4px;
  transition-duration:0.2s;
}

button:hover{
  cursor: pointer;
  background-color: #f7f7ff;
  border: 1px solid #c6cde2;
  transition-duration:0.2s;
}
</style>