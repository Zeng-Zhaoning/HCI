<template>
  <div class="guide-container">
    <edit-guide-1 v-if="editGuideStep === 1" />
    <edit-guide-2 v-if="editGuideStep === 2" />
    <edit-guide-3 v-if="editGuideStep === 3" />
    <edit-guide-4 v-if="editGuideStep === 4" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import EditGuide1 from "./EditGuide1.vue";
import EditGuide2 from "./EditGuide2.vue";
import EditGuide3 from "./EditGuide3.vue";
import EditGuide4 from "./EditGuide4.vue";

export default {
  name: "EditGuide",

  components: {
    EditGuide1,
    EditGuide2,
    EditGuide3,
    EditGuide4,
  },

  computed: {
    ...mapState({
      editGuideStep: state => state.editGuideStep,
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
