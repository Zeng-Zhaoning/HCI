<template>
  <div class="container"
       :class="{ select : selected }">
    <span class="pname">
      {{ pname }}
    </span>

  </div>
</template>

<script>
import {mapState} from "vuex"
export default {
  name: "ProjectItem",
  props:{
    pname: String,
    pid: Number
  },
  data(){
    return{

    }
  },
  computed: {
    selected(){
      return this.pid === this.current_project.pid;
    },
    ...mapState(['current_project'])
  },
  methods:{

  }
}
</script>

<style scoped lang="less">
@item_height : 50px;
@import "../../assets/css/colors";
.container :hover{
  background: @hover;
  cursor:pointer;
}
.container{
  height: @item_height;
  line-height: @item_height;
}
.pname{
  padding-left: 25px;
  color: @myblack;
  font-size: 14px;
}
.select{
  background: @hover;
}
</style>