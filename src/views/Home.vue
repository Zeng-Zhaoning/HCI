<template>
  <el-container id="home">
    <el-aside width="300px">
      <side-bar class="side-bar"></side-bar>
    </el-aside>
    <el-main>
      <work-space></work-space>
    </el-main>
  </el-container>
</template>

<script>
import SideBar from "../components/SideBar/SideBar";
import WorkSpace from "../components/WorkSpace";
import { mapActions,mapState,mapMutations,mapGetters } from "vuex";


export default {
  name: 'Home',
  components: {
    WorkSpace,
    SideBar,
  },
  computed: {
    project: state => state.project,
  },
  methods: {
    ...mapMutations(['setProject']),
    ...mapActions(['loadProject']),
  },
  created(){
    //this.loadProject();
    this.setProject({
      "nodes": [
        {
          "data": {
            "name": "伯1",
            "id": "1",
            "type": "default",
            "property": {
              "逝世": "1994年 (36岁至41岁)",
              "职业": [
                "魔法体育运动司职员"
              ],
              "物种": "人类",
              "出生": "1953年9月1日与1958年8月31日之间",
              "性别": "女"
            }
          },
          "position": {
            "x": -561.9463175845465,
            "y": 328.5929277632738
          }
        },
        {
          "data": {
            "name": "莎2",
            "id": "2",
            "type": "default",
            "property": {
              "逝世": "1994年 (36岁至41岁)",
              "职业": [
                "魔法体育运动司职员"
              ],
              "物种": "人类",
              "出生": "1953年9月1日与1958年8月31日之间",
              "性别": "女"
            }
          },
          "position": {
            "x": -561.9463175845465,
            "y": 328.5929277632738
          }
        },
        {
          "data": {
            "name": "乔3",
            "id": "3",
            "type": "default",
            "property": {
              "逝世": "1994年 (36岁至41岁)",
              "职业": [
                "魔法体育运动司职员"
              ],
              "物种": "人类",
              "出生": "1953年9月1日与1958年8月31日之间",
              "性别": "女"
            }
          },
          "position": {
            "x": -561.9463175845465,
            "y": 328.5929277632738
          }
        }
      ],
      "edges": [
        {
          "data": {
            "id": "c38e79d4-0433-4e87-826c-300b4cadc541",
            "source": "1",
            "target": "2",
            "relation": "关系1",
            "type": "connection"
          }
        },
        {
          "data": {
            "id": "c38e79d4-0433-4e87-826c-300b4cadc542",
            "source": "1",
            "target": "3",
            "relation": "关系2",
            "type": "connection"
          }
        },
        {
          "data": {
            "id": "c38e79d4-0433-4e87-826c-300b4cadc543",
            "source": "2",
            "target": "3",
            "relation": "关系3",
            "type": "connection"
          }
        }
      ]
    });
  }
}
</script>

<style scoped lang="less">
@import "../assets/css/colors.less";
#home {
  height: 100%;
  width: 100%;
}
.el-main{
  padding: 0;
  background-color: @background;
  height: 100%;
}

</style>
