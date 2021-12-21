<template>
  <div class="container">
    <div class="highlight" :style="highlightStyle"></div>
    <div class="text">新手指引</div>
  </div>
</template>

<script>
import { mapMutations, mapState, mapActions } from "vuex";

export default {
  name: "LobbyGuide1",
  data() {
    return {
      targetInfo: null,
      highlightStyle: {},
    };
  },

  computed: {
    ...mapState({
      uid: (state) => state.uid,
    }),
  },

  mounted() {
    const createNewBtn = document.querySelector("#create-new");
    this.targetInfo = createNewBtn.getBoundingClientRect();
    const { height, width, top, left } = this.targetInfo;
    this.highlightStyle = {
      height: height + 20 + 'px',
      width: width + 20 + 'px',
      top: top + 30 - 10 + 'px',
      left: left - 10 + 'px',
    };
  },

  methods: {
    ...mapMutations(["setPid"]),
    ...mapActions(['loadProject']),
    
  },
};
</script>

<style scoped lang="less">
@import "../../assets/css/colors.less";

.container {
  width: 100%;
  height: 100%;
  z-index: 100;
  position: fixed;
}

.highlight {
  box-shadow: 0 0 0px 2000px rgba(0, 0, 0, 0.65);
  color: white;
  position: absolute,
}

.text {
  color: white;
  position: absolute;
}
</style>