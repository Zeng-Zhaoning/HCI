<template xmlns="http://www.w3.org/1999/html">
  <div class="container">
    <div class="search-box">
      <div class="header">
        <span>搜索</span>
        <div class="input-box">
          <input
            v-model="input"
            @keyup="keyUpHandler"
            @keydown="keyDownHandler"
            placeholder="输入图中的节点名"
          />
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
        <div v-if="showNodeInfo">
          <div class="result-item">
            <div class="result-name">{{ result.data('name') }}</div>
          </div>
          <div
            class="result-item"
            v-for="(value, key) in result.data('property')"
            :key="key"
          >
            <span class="key">{{ key }}</span>
            <span class="value">
              <span v-if="typeof value === 'string'">{{ value }}</span>
              <span v-else-if="Array.isArray(value)">{{
                value.join("，")
              }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="recommendations-box" v-loading="recsLoading">
        <div class="title"><span>猜你想看</span></div>
        <div class="empty" v-if="!searched">先输入关键词搜索吧~</div>
        <div class="empty" v-if="showNoRecs">暂无推荐</div>
        <div>
          <div
            class="recommendation-item"
            v-for="(rec, index) in recommendations"
            @click="recommendEvent(rec)"
            :key="rec"
          >
            <div class="index" :class="indexClass[index]">{{ index + 1 }}</div>
            <div class="rec-text">{{ rec }}</div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "SideBar",
  data() {
    return {
      searched: false,
      input: "",
      resultLoading: false,
      result: {}, //返回的结果，是一个cy的点
      showNoResult: false,
      showNodeInfo: false,
      recsLoading: false,
      recommendations: [], //推荐条目
      indexClass: ["index-1", "index-2", "index-3"],
      showNoRecs: false,
      initZoom: 1.0,
      initPan: {}
    };
  },
  computed: {
    ...mapState({
      cy: (state) => state.workspace.cy,
      project: (state) => state.project,
      pid: (state) => state.pid,
    }),
  },
  watch: {
    cy(newValue, oldValue){
      this.initZoom = newValue._private.zoom;
      let p_pan = this.cy._private.pan
      this.initPan = {x: p_pan.x, y: p_pan.y};
    }
  },
  methods: {
    ...mapMutations(["setProject"]),
    keyDownHandler(event) {
      if (event.keyCode == "13") {
        event.preventDefault();
      }
    },
    keyUpHandler(event) {
      if (event.keyCode == "13") {
        this.query(event);
      }
    },
    recommendEvent(content){
      this.input = content;
      this.query();
    },
    query(event) {
      if (this.input === "") {
        return;
      }
      this.searched = true;
      this.recsLoading = true;
      this.resultLoading = true;
      this.showNoResult = false;
      this.showNoRecs = false;
      this.showNodeInfo = false;
      this.recommendations = [];
      this.result = {};

      //TODO: 挪用右边栏的搜索功能
      this.searchNode();
      this.resultLoading = false;

      //请求api获得“猜你想看”结果
      let recommendationlist = {
        "詹姆·斯图尔特": 20,
        "玛莎·斯图尔特": 19,
        "伊索特·塞耶": 18,
        "查威克·布特": 17,
        "韦伯·布特": 16,
        "雷欧娜·斯图尔特": 15,
        "伊尔弗莫尼魔法学校": 14,
        "威廉·塞耶": 13,
        "雷欧娜·塞耶": 12,
        "葛姆蕾·冈特": 11,
        "萨拉查·斯莱特林": 10,
      };

      // recommendation
      this.recommendations = Object.keys(recommendationlist).sort(function (a, b) {
        return recommendationlist[b] - recommendationlist[a];
      });
      this.recommendations = this.recommendations.slice(0, 10);

      this.recsLoading = false;
    },

    checkKeyWords(text) {
      let nameValid = /\S/;
      let keyWords = [];
      if (nameValid.test(text)) {
        let item = text.trim();
        if (!keyWords.includes(item)) keyWords.push(item);
      }
      return keyWords;
    },
    searchNode() {
      let keyWords = this.checkKeyWords(this.input);
      if (keyWords.length === 0) {
        this.informMsg("error", "请确认搜索内容和筛选条件都不为空哦");
        return;
      }
      //开始一次搜索
      let nodes = this.cy.nodes();
      let count = 0;
      nodes.forEach((val) => {
        if (val.hasClass("searchedNode")) {
          val.removeClass("searchedNode");
        }
        let hit = false;
        let valName = val.data("name");
        for (let key of keyWords) {
          if (this.fuzzyMatch(valName, key)) {
            hit = true;
            break;
          }
        }
        if (hit) {
          this.result = val;
          this.showNodeInfo = true;
          count += 1;
          val.addClass("searchedNode");
          // 先回原点
          this.cy.viewport({
            zoom: this.initZoom,
            pan: this.initPan,
          });
          this.cy.zoom({
            level: 2.0,
            position: val.position(),
          });
        }
      });
      this.informResult(count > 0, "搜索完毕", "未找到符合条件的结果");
    },
    informMsg(type, msg) {
      this.$message({
        message: msg,
        type: type,
        duration: 1500,
      });
    },
    informResult(isSuccess, success_msg, error_msg) {
      if (isSuccess) {
        this.informMsg("success", success_msg);
      } else {
        this.informMsg("error", error_msg);
      }
    },
    fuzzyMatch(str, key) {
      //不知道需不需要再加一下忽略大小写？
      let index = -1,
        flag = false;
      for (let i = 0, arr = key.split(""); i < arr.length; i++) {
        //有一个关键字都没匹配到，则没有匹配到数据
        if (str.indexOf(arr[i]) < 0) {
          break;
        } else {
          let match = str.matchAll(arr[i]);
          let next = match.next();
          while (!next.done) {
            if (next.value.index > index) {
              index = next.value.index;
              if (i === arr.length - 1) {
                flag = true;
              }
              break;
            }
            next = match.next();
          }
        }
      }
      return flag;
    },
  },
};
</script>

<style scoped lang="less">
@import "../assets/css/colors.less";
@pad: 15px;
@len1: 20px;

.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
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

.search-box {
  .input-box {
    height: 40px;
    width: 100% - 15px;
    margin: 8px auto;
    position: relative;
  }
  input {
    border: 2px solid @separator;
    border-radius: 8px;
    padding-left: 10px;
    padding-right: 10px;
    outline: none;
    font-size: 15px;
    font-family: 微软雅黑;
    letter-spacing: 1px;
    width: 100% - 8px;
    height: 100%;
    color: #565657;
  }
  input:hover {
    border-color: @prompt;
  }
  input:focus {
    border-color: @theme;
  }
  input::placeholder {
    color: @prompt;
  }
}

svg {
  position: absolute;
  right: 5px;
  top: 13px;
  width: 20px;
  height: 20px;
  background: white;
}
svg:hover {
  cursor: pointer;
}

.title {
  color: @theme;
  font-size: 14px;
  font-family: 微软雅黑;
  height: @len1;
  span {
    line-height: @len1;
  }
}

.result-box {
  padding: @pad;
  min-height: 100px;
  font-family: 微软雅黑;
  font-size: 14px;
  color: #565657;
}

.ans {
  margin: 8px;
}

.result-name {
  font-size: 17px;
  font-weight: bold;
  color: #565657;
  margin: 25px 0;
}

.result-item {
  //display: flex;
  //flex-direction: row;
  margin: 8px;
}

.key {
  display: inline-block;
  letter-spacing: 1px;
  //color: @theme;
  height: 20px;
  line-height: 20px;
  border-radius: 4px;
  text-align: center;
  color: white;
  background: @theme;
  padding: 1px 4px;
  font-size: 13px;
  margin-right: 8px;
}

/* 建议栏 */
.recommendations-box {
  padding: @pad;
  font-family: 微软雅黑;
  font-size: 14px;
}
.recommendation-item {
  display: flex;
  flex-direction: row;
  margin: 8px;
  color: #565657;
  cursor:pointer;
}
.index {
  height: 20px;
  line-height: 20px;
  width: 20px;
  border-radius: 4px;
  text-align: center;
}
.index-1 {
  background: @set2-blush;
  color: white;
}
.index-2 {
  background: @set1-dandelion;
  color: white;
}
.index-3 {
  background: @set4-neptune;
  color: white;
}
.rec-text {
  margin-left: 10px;
  letter-spacing: 0.5px;
}

.empty {
  color: @prompt;
  font-size: 14px;
  font-family: 微软雅黑;
  text-align: center;
  margin: 20px;
}

</style>