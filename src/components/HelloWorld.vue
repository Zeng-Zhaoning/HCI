<template>
  <div class="hello">
    <p>{{ current_project }}</p>
  </div>
</template>


<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'HelloWorld',
  data(){
    return{

    }
  },
  props: {
    msg: String
  },
  computed: {
    ...mapState([
      'current_pid',
      'current_project'
    ])
  },
  methods: {
    ...mapActions([
        'loadProject'
    ])

  },
  created() {
    this.loadProject(this.current_pid);
  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
h3 {
  margin: 40px 0 0;
}

</style>
