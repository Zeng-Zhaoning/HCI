<template>
  <div>
    <div class="guide-highlight" :style="highlightStyle" @click="changeLobbyGuideStep(1)" />
    <div class="panel" :style="panelStyle">
      <div class="array" />
      <div class="guide-title">项目卡片</div>
      <div class="guide-text">
        编辑或删除图谱项目。接下来我们去编辑页看看吧！
        <span class="current-step">({{lobbyGuideStep}}/{{lobbyGuideMaxStep}})</span>
        <img src="/icons/lobby_guide_2.png" />
      </div>
      <div class="btns">
        <div class="text-btn" @click="changeLobbyGuideStep(-1)">上一步</div>
        <div class="btn" @click="changeLobbyGuideStep(1)">我试试！</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "LobbyGuide2",
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
    const target = document.querySelector(".inner-card");
    const info = target.getBoundingClientRect();
    const { height, width, top, left } = info;
    this.highlightStyle = {
      height: height + 20 + 'px',
      width: width + 20 + 'px',
      top: top - 10 + 'px',
      left: left - 10 + 'px',
    };
    // panelTopBias = 镂空区高度一半，减去三角箭头高的一半，再减去三角箭头的 top 偏移量
    const panelTopBias = height / 2 - 28;
    const panelLeftBias =  width + 20 + 15;
    this.panelStyle = {
      top: top + panelTopBias + 'px',
      left: left + panelLeftBias + 'px',
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

img {
  height: 100px;
  margin-top: 10px;
  display: block;
}

</style>
