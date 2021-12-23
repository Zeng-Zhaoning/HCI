<template>
  <div class="container">
    <div class="panel">
      <div class="guide-title">欢迎！</div>
      <div class="guide-text">
        跟随教程创建属于你的知识图谱吧！
      </div>
      <div class="btns">
        <div class="text-btn" @click="changeIsLobbyGuideShow">跳过</div>
        <div class="btn" @click="changeLobbyGuideStep(1)">开始</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  name: "Start",

  methods: {
    ...mapMutations(["changeLobbyGuideStep", "changeIsLobbyGuideShow"]),
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
  width: 400px;
  padding: 25px 30px;
}

.guide-title {
  font-size: 21px;
  font-weight: normal;
}

.guide-text {
  margin-bottom: 45px;
}

</style>
