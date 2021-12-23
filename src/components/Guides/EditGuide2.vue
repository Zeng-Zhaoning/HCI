<template>
  <div>
    <div class="guide-highlight" :style="highlightStyle" @click="changeEditGuideStep(1)" />
    <div class="panel" :style="panelStyle">
      <div class="array" />
      <div class="guide-title">搜索栏</div>
      <div class="guide-text">
        快速定位图中的节点。<br />
        tips：节点属性可以直接修改噢！
        <span class="current-step">({{editGuideStep}}/{{editGuideMaxStep}})</span>
      </div>
      <div class="btns">
        <div class="text-btn" @click="changeIsEditGuideShow">退出</div>
        <div class="text-btn" @click="changeEditGuideStep(-1)">上一步</div>
        <div class="btn" @click="changeEditGuideStep(1)">下一步</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "EditGuide2",
  data() {
    return {
      highlightStyle: {},
      panelStyle: {},
    };
  },

  computed: {
    ...mapState(["editGuideStep", "editGuideMaxStep"]),
  },

  mounted() {
    const target = document.querySelector("#side-bar");
    const info = target.getBoundingClientRect();
    const { height, width, top, left } = info;
    this.highlightStyle = {
      height: height + 'px',
      width: width - 2 + 'px',
      top: top + 'px',
      left: left + 'px',
    };
    // panelTopBias = 镂空区高度一半，减去三角箭头高的一半，再减去三角箭头的 top 偏移量
    const panelTopBias = height / 4 - 14;
    this.panelStyle = {
      top: top + panelTopBias + 'px',
      left: width + 35 + 'px',
    };
  },

  methods: {
    ...mapMutations(["changeEditGuideStep", "changeIsEditGuideShow"]),
  },
};
</script>

<style lang="less" scoped>
@import "./guide.less";

.array {
  position: absolute;
  left: -7px;
  top: 20px;
}

</style>
