<template>
  <div>
    <div class="guide-highlight" :style="highlightStyle" @click="changeEditGuideStep(1)" />
    <div class="panel" :style="panelStyle">
      <div class="array" />
      <div class="guide-title">编辑区</div>
      <div class="guide-text">
        你可以：<br />
        1、拖拽移动视角或节点；<br />
        2、右键打开菜单栏，可以增加、删除、修改节点或关系。
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
  name: "EditGuide3",
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
    const target = document.querySelector("#work-space");
    const info = target.getBoundingClientRect();
    const { height, width, top, left } = info;
    this.highlightStyle = {
      height: height - 80 - 20 + 'px',
      width: width - 450 - 30 + 'px',
      top: top + 10 + 40 + 'px',
      left: left + 75 + 'px',
    };
    // panelTopBias = 镂空区高度一半，减去三角箭头高的一半，再减去三角箭头的 top 偏移量
    const panelTopBias = height / 4 - 14;
    this.panelStyle = {
      top: top + panelTopBias + 'px',
      left: width - 60 + 'px',
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
