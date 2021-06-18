<template>
  <div class="container">
    <div class="search-box">
      <div class="header">
        <span>搜索</span>
        <div class="input-box">
          <input v-model="input" @keyup="keyUpHandler" @keydown="keyDownHandler"/>
          <svg class="icon" aria-hidden="true" @click="query">
            <use xlink:href="#iconyou"></use>
          </svg>
        </div>
      </div>
    </div>

    <el-scrollbar>
      <div class="result-box" v-loading="resultLoading">
        <div class="title"><span>搜索结果</span></div>
        <div class="empty" v-if="!searched">先输入关键词搜索吧~</div>
        <div class="empty" v-if="showNoResult">无匹配，换个关键词搜索吧</div>
        <div>
          <div class="result-item" v-for="(value, key) in result">
            <div class="key">{{ key }}</div>
            <div class="value">{{ value }}</div>
          </div>
        </div>
      </div>

      <div class="recommendations-box" v-loading="recsLoading">
        <div class="title"><span>猜你想看</span></div>
        <div class="empty" v-if="!searched">先输入关键词搜索吧~</div>
        <div class="empty" v-if="showNoRecs">暂无推荐</div>
        <div>
          <div class="recommendation-item"
               v-for="(rec, index) in recommendations"
               :key="rec">
            <div class="index" :class="indexClass[index]">{{ index + 1 }}</div>
            <div class="rec-text">{{ rec }}</div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import { getRecommend } from "@/api/RecommendAPI"
import { grammar_analyse } from "@/api/GrammarAPI"
import {mapMutations, mapState} from "vuex";

export default {
  name: "SideBar",
  data(){
    return {
      searched: false,
      input: '',
      resultLoading: false,
      result: {}, //返回的结果
      showNoResult: false,
      recsLoading: false,
      recommendations: [],  //推荐条目
      indexClass: ['index-1', 'index-2', 'index-3'],
      showNoRecs: false,
    }
  },
  computed: {
    ...mapState({
      whole_project: state => state.whole_project,
      project_left: state => state.project_left,
      project: state => state.project,
    }),
  },
  methods:{
    ...mapMutations(['setProject','setProjectLeft']),
    keyDownHandler(event){
      if (event.keyCode == '13'){
        event.preventDefault();
      }
    },
    keyUpHandler(event){
      if (event.keyCode == '13'){
        this.query(event);
      }
    },
    query(event){
      if (this.input === ''){ return; }

      let input = this.input;
      this.searched = true;
      this.recsLoading = true;
      this.resultLoading = true;
      this.showNoResult = false;
      this.showNoRecs = false;
      this.recommendations = [];

      //请求api获得搜索结果
      grammar_analyse(input).then(res => {
        if (res.success && res.content !== null){
          let nodes = res.content.nodes;
          let ans = res.content.ans;
          if (ans.length > 0){
            if (nodes !== null && nodes.length > 0){
              if (nodes.length === 1){
                this.result = nodes[0];
              }else {
                // 展示ans
              }
            }else {
              //展示ans
            }
          }else {
            this.showNoResult = true;
          }
        }else {
          this.$message.error(res.message);
        }
      }).catch(err => {
        this.$message.error("请确保网络连接正常");
        console.log("要么断网，要么服务器崩了",err);
      }).finally(() => {
        this.resultLoading = false;
      });

      //图谱展示
      this.showGraph(this.result["id"]);

      //请求api获得推荐结果
      getRecommend(input).then(res => {
        if (res.success){
          let recsObj = res.content;
          if (res.content !== null){
            //根据键值排序得到键名list
            this.recommendations = Object.keys(recsObj).sort(function(a,b){return recsObj[b]-recsObj[a]});
            this.recommendations = this.recommendations.slice(0,10);
          }else{
            this.showNoRecs = true;
          }
        }else {
          this.$message.error(res.message);
        }
      }).catch(err => {
        this.$message.error("请确保网络连接正常");
        console.log("要么断网，要么服务器崩了",err);
      }).finally(() => {
        this.recsLoading = false;
      });
    },

    showGraph(nodeID){
      //todo 根据id获得其相邻的三层节点集和边集，并设置到state.project; 其余没被展示的点集、边集设置到state.project_left
      let nodeIDs = new Set([nodeID]);
      let edges = new Set();
      for (let edge of this.whole_project.edges){
        if (edge.data.source === nodeID){
          edges.add(edge);
          nodeIDs.add(edge.data.target);
          let node2ID = edge.data.target;
          // 要展示第三层的话下面注释去掉。不过只拿“哈利波特”来搜索的话，三层已经太多了
          // for (let edge2 of this.whole_project.edges){
          //   if (edge2.data.source === node2ID){
          //     edges.add(edge2);
          //     nodeIDs.add(edge2.data.target);
          //   }
          // }
        }
      }

      let project_left = {nodes:[], edges:[]};
      let project = {nodes:[], edges:[]};
      project.edges = Array.from(edges);

      for (let node of this.whole_project.nodes){
        if (nodeIDs.has(node.data.id)){
          project.nodes.push(node);
        }else {
          project_left.nodes.push(node);
        }
      }
      for (let edge of this.whole_project.edges){
        if (!edges.has(edge)){
          project_left.edges.push(edge);
        }
      }

      this.setProject(JSON.parse(JSON.stringify(project)));
      this.setProjectLeft(JSON.parse(JSON.stringify(project_left)));
    }
  }
}
</script>

<style scoped lang="less">
@import "../../assets/css/colors.less";
@pad : 15px;
@len1 : 20px;

.container{
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header{
  background: @theme;
  padding-top: @pad;
  height: 65px;
  line-height: 30px;
  width: 300px;
  font-size: 17px;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 30px;
}

.search-box{
  .input-box{
    height: 40px;
    width: 100% - 15px;
    margin: 8px auto;
    position: relative;
  }
  input{
    border: 2px solid @separator;
    border-radius: 8px;
    padding-left: 10px;
    padding-right: 10px;
    outline: none;
    font-size: 15px;
    font-family: 微软雅黑;
    letter-spacing:1px;
    width: 100% - 8px;
    height: 100%;
    color: #565657;
  }
  input:hover{
    border-color: @prompt;
  }
  input:focus{
    border-color: @theme;
  }
}

svg{
  position: absolute;
  right: 5px;
  top: 13px;
  width: 20px;
  height: 20px;
  background: white;
}
svg:hover{
  cursor: pointer;
}

.title{
  color: @theme;
  font-size: 14px;
  font-family: 微软雅黑;
  height: @len1;
  span{
    line-height: @len1;
  }
}

.result-box{
  padding: @pad;
  min-height: 100px;
  font-family: 微软雅黑;
  font-size: 14px;
  color: #565657;
}

.result-item{
  display: flex;
  flex-direction: row;
  margin: 8px;
}

.key{
  //color: @theme;
  height: 20px;
  line-height: 20px;
  border-radius: 4px;
  text-align: center;
  color: white;
  background: @theme;
  padding: 0 4px;
  font-size: 13px;
  margin-right: 8px;
}


/* 建议栏 */
.recommendations-box{
  padding: @pad;
  font-family: 微软雅黑;
  font-size: 14px;
}
.recommendation-item{
  display: flex;
  flex-direction: row;
  margin: 8px;
  color: #565657;
}
.index{
  height: 20px;
  line-height: 20px;
  width: 20px;
  border-radius: 4px;
  text-align: center;
}
.index-1{
  background: @set2-blush;
  color: white;
}
.index-2{
  background: @set1-dandelion;
  color: white;
}
.index-3{
  background: @set4-neptune;
  color: white;
}
.rec-text{
  margin-left: 10px;
  letter-spacing: 0.5px;
}

.empty{
  color: @prompt;
  font-size: 14px;
  font-family: 微软雅黑;
  text-align: center;
  margin: 20px;
}

</style>