<template>
  <div>
    <div class="guide-highlight" :style="highlightStyle" @click="changeEditGuideStep(1)" />
    <div class="panel" :style="panelStyle">
      <div class="array" />
      <div class="guide-title">工具栏</div>
      <div class="guide-text">
        你可以：<br />
        1、保存修改、导出图片；<br />
        2、查看图谱的统计信息；<br />
        3、隐藏不关心的节点、关系；<br />
        4、在“视图调整”栏修改图谱外观，如布局、字体大小。
        <span class="current-step">({{editGuideStep}}/{{editGuideMaxStep}})</span>
      </div>
      <div class="btns">
        <div class="text-btn" @click="changeEditGuideStep(-1)">上一步</div>
        <div class="btn" @click="changeEditGuideStep(1)">我试试！</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "EditGuide4",
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
    const target = document.querySelector("#edit-bar");
    const info = target.getBoundingClientRect();
    const { height, width, top } = info;
    this.highlightStyle = {
      height: height + 'px',
      width: width + 25 + 'px',
    };
    // panelTopBias = 镂空区高度一半，减去三角箭头高的一半，再减去三角箭头的 top 偏移量
    const panelTopBias = height / 4 - 14;
    this.panelStyle = {
      top: top + panelTopBias + 'px',
      right: width + 60 + 'px',
    };
    // TODO: 模拟打开一个操作栏
  },

  methods: {
    ...mapMutations(["changeEditGuideStep", "changeIsEditGuideShow"]),
  },
};
</script>

<style lang="less" scoped>
@import "./guide.less";

.guide-highlight {
  right: 0;
  width: 300px;
  height: 100%;
}

.array {
  position: absolute;
  right: -7px;
  top: 20px;
}

</style>
