<template>
  <div class="container">
    <div class="panel">
      <div class="guide-title">图谱简介</div>
      <div class="guide-text">
        <span class="strong">节点：</span>每个实心圆代表一个“节点”<br />
        <img src="/icons/edit-guide-1.png" />
        <span class="strong">关系：</span>两个节点间的连线代表一个“关系”<br />
        <img src="/icons/edit-guide-2.png" />
        <span class="strong">画布：</span>编辑区的空白背景
        <span class="current-step">({{editGuideStep}}/{{editGuideMaxStep}})</span>
      </div>
      <div class="btns">
        <div class="text-btn" @click="changeIsEditGuideShow">退出</div>
        <div class="btn" @click="changeEditGuideStep(1)">下一步</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "EditGuide1",
  data() {
    return {
      highlightStyle: {},
      panelStyle: {},
    };
  },

  computed: {
    ...mapState(["editGuideStep", "editGuideMaxStep"]),
  },

  methods: {
    ...mapMutations(["changeEditGuideStep", "changeIsEditGuideShow"]),
  },
};
</script>

<style lang="less" scoped>
@import "./guide.less";

.container {
  background-color: rgba(0, 0, 0, 0.7);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel {
  width: 450px;
  padding: 25px 30px;
}

img {
  height: 80px;
  display: block;
  margin: 7px 0 30px 0;
}

.strong {
  color: @theme;
  font-weight: bold;
}

</style>
