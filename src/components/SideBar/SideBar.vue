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
import {mapState} from "vuex";

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
      cy: state => state.workspace.cy
    })
  },
  methods:{
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
      if (this.question === ''){ return; }

      let input = this.input;
      // this.input = "";//不一定要清空把
      this.searched = true;
      this.recsLoading = true;
      this.resultLoading = true;
      this.showNoResult = false;
      this.showNoRecs = false;
      this.recommendations = [];

      //显示部分图谱
      this.cy.nodes().forEach(val=>{
        let valName = val.data("name");
        let valProps = val.data("property");
        let edges = val.connectedEdges();
        let hit = false;
        if(input){//假设input存在且为字符串
          let byName=true,byProp=true,byRelation=true;
          let relaHit;
          let propHit;
          let keyWords = [input];//假设input为字符串
          for(let key of keyWords){
            if(byName&&this.fuzzyMatch(valName, key)) {
              hit = true;
              break;
            }
            if(byProp){
              propHit = false;
              let propArray = [];
              for(let key in valProps){
                propArray.push(key);
                let val = valProps[key];
                if(val instanceof Array){
                  propArray = propArray.concat(val);
                }else{
                  propArray.push(val);
                }
              }
              for(let prop of propArray){
                if(this.fuzzyMatch(prop, key)){
                  propHit=true;
                  break;
                }
              }
              if(propHit){
                hit = true;
                break;
              }
            }
            if(byRelation){
              relaHit = false;
              for(let edge of edges){
                let edgeName = edge.data("relation");
                if(this.fuzzyMatch(edgeName, key)){
                  relaHit = true;
                  break;
                }
              }
              if(relaHit){
                hit = true;
                break;
              }
            }
          }
        }else{
          hit = true;//若无输入则复原所有节点
        }
        if(!hit&&!val.hasClass('removed')) {
          console.log("remove")
          val.addClass('removed');
        }else if(hit&&val.hasClass('removed')){
          console.log("recover")
          val.removeClass('removed');
        }
      });

      //请求api获得搜索结果
      this.result = {
        "姓名": "哈利波特",
        "年龄": "19岁",
        "生日": "2000年",
        "学院": "南大软院",
      };
      this.resultLoading = false;

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

    fuzzyMatch(str, key){//不知道需不需要再加一下忽略大小写？
      let index = -1, flag = false;
      for(let i = 0, arr = key.split(""); i < arr.length; i++ ){
        //有一个关键字都没匹配到，则没有匹配到数据
        if(str.indexOf(arr[i]) < 0){
          break;
        }else{
          let match = str.matchAll(arr[i]);
          let next = match.next();
          while (!next.done){
            if(next.value.index > index){
              index = next.value.index;
              if(i === arr.length - 1){
                flag = true
              }
              break;
            }
            next = match.next();
          }
        }
      }
      return flag;
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
