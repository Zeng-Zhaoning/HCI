<template>
  <div>
    <div class="guide-highlight" :style="highlightStyle" @click="changeLobbyGuideStep(1)" />
    <div class="panel" :style="panelStyle">
      <div class="array" />
      <div class="guide-title">新建</div>
      <div class="guide-text">
        在这里新建图谱项目
        <span class="current-step">({{lobbyGuideStep}}/{{lobbyGuideMaxStep}})</span>
      </div>
      <div class="btns">
        <div class="text-btn" @click="changeIsLobbyGuideShow">退出</div>
        <div class="btn" @click="changeLobbyGuideStep(1)">下一步</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "LobbyGuide1",
  data() {
    return {
      highlightStyle: {},
      panelStyle: {},
    };
  },

  computed: {
    ...mapState(["lobbyGuideMaxStep", "lobbyGuideStep"]),
  },

  mounted() {
    const target = document.querySelector("#create-new");
    const info = target.getBoundingClientRect();
    const { height, width, top, left } = info;
    this.highlightStyle = {
      height: height + 20 + 'px',
      width: width + 'px',
      top: top - 10 + 'px',
      left: left + 'px',
    };
    // panelTopBias = 镂空区高度一半，减去三角箭头高的一半，再减去三角箭头的 top 偏移量
    const panelTopBias = height / 2 - 28;
    this.panelStyle = {
      top: top + panelTopBias + 'px',
      left: width + 25 + 'px',
    };
  },

  methods: {
    ...mapMutations(["changeLobbyGuideStep", "changeIsLobbyGuideShow"]),
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
