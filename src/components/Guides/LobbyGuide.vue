<template>
  <div class="guide-container">
    <start v-if="lobbyGuideStep === 0" />
    <lobby-guide-1 v-else-if="lobbyGuideStep === 1" />
    <lobby-guide-2 v-else-if="lobbyGuideStep === 2" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import Start from "./Start.vue";
import LobbyGuide1 from "./LobbyGuide1.vue";
import LobbyGuide2 from "./LobbyGuide2.vue";

export default {
  name: "LobbyGuide",

  components: {
    Start,
    LobbyGuide1,
    LobbyGuide2,
  },

  computed: {
    ...mapState({
      lobbyGuideStep: (state) => state.lobbyGuideStep,
    }),
  },

};
</script>

<style scoped lang="less">
.guide-container {
  width: 100%;
  height: 100%;
  z-index: 100;
  position: fixed;
}
</style>
