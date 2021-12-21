<template>
  <div class="guide-container">
    <edit-guide-1 v-if="editGuideStep === 1" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import EditGuide1 from "./EditGuide1.vue";

export default {
  name: "EditGuide",

  components: {
    EditGuide1,
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
