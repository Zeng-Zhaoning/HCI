<template>
  <el-row>
    <el-col :span="1" class="left-1-col">
      <div class="logo-box">
        <img src="/icons/knowledgegraph.png" class="logo-title" />
      </div>
      <div class="left-box">
        <svg class="left-icon" style="color: #ff6161">
          <use xlink:href="#iconjiahao2fill"></use>
        </svg>
        <div class="left-context">新建</div>
      </div>
      <div class="left-box">
        <svg class="left-icon" style="color: #6a85ce">
          <use xlink:href="#iconwenjianjia"></use>
        </svg>
        <div class="left-context">项目</div>
      </div>
    </el-col>
    <el-col :span="3" :offset="0.1" class="left-2-col">
      <div class="input-box">
        <img src="/icons/search.png" class="icon" />
        <input v-model="searchText" 
        placeholder="搜索项目" 
        @keyup="keyUpHandler"
        @keydown="keyDownHandler"/>
      </div>
      <el-menu
        default-active="3"
        class="vertical-menu"
        text-color="#525E71"
        active-text-color="#6a85ce"
      >
        <el-menu-item index="1" class="vertical-menu-item">
          <img src="/icons/proj.png" class="vertical-menu-icon" />
          <span class="vertical-menu-span">全部项目</span>
        </el-menu-item>
        <el-menu-item index="2" class="vertical-menu-item">
          <img src="/icons/like.png" class="vertical-menu-icon" />
          <span class="vertical-menu-span">收藏项目</span>
        </el-menu-item>
        <el-menu-item index="3" class="vertical-menu-item">
          <img src="/icons/trashcan.png" class="vertical-menu-icon" />
          <span class="vertical-menu-span">回收站</span>
        </el-menu-item>
      </el-menu>
    </el-col>
    <el-col :span="20" class="left-3-col">
      <div class="box-11">全部项目</div>
      <el-menu :default-active="1" mode="horizontal" class="horizontal-menu">
        <el-menu-item index="1">当前</el-menu-item>
        <el-menu-item index="2">已锁定</el-menu-item>
      </el-menu>

      <!-- <el-tooltip
        effect="dark"
        content="Top Left prompts info"
        placement="top-start"
      >
        <el-button>top-start</el-button>
      </el-tooltip> -->

      <div class="inner-box">
        <div :key="ind" v-for="(proj, ind) in show_projectList" class="card">
          <div class="inner-card">
            <img src="/icons/book.png" />
            <div class="implicit-btns">
              <div class="hidden-box-1" title="编辑">
                <svg class="card-icon">
                  <use xlink:href="#iconbianji"></use>
                </svg>
              </div>
              <div class="hidden-box-2" title="删除">
                <svg class="card-icon">
                  <use xlink:href="#iconlaji_huabanfuben"></use>
                </svg>
              </div>
            </div>
          </div>
          <div class="card-title">{{ proj }}</div>
        </div>
      </div>
      <div class="account-box" @click="accountShow">
        <el-avatar :size="50" :src="avatar_url"></el-avatar>
      </div>
      <div v-if="show_account" class="user-info">
        <div class="user-info-1l-1">
          <div class="user-info-2l-1" style="color: white">{{ this.mail }}</div>
          <div class="user-info-2l-2" style="color: #e7e7ef">
            {{ this.password }}
          </div>
        </div>
        <div class="user-info-1l-2">
          <svg class="icon-acc" aria-hidden="true" @click="query">
            <use xlink:href="#iconqiehuan1"></use>
          </svg>
        </div>
      </div>
      <div v-if="show_qa" class="qa-menu">
        <div>帮助中心</div>
        <div>需求反馈</div>
        <div>客服中心</div>
      </div>
      <div class="qa-box" @click="questionAnswer">
        <svg class="qa-icon">
          <use xlink:href="#iconwenhao_huabanfuben"></use>
        </svg>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import { getProjectList, getUserInfo } from "@/api/basicAPI";
import { mapMutations, mapState } from "vuex";
import { Calendar, Search } from "@element-plus/icons-vue";
export default {
  name: "Lobby",
  components: {
    Calendar,
    Search,
  },
  data() {
    return {
      show_projectList: [], // 展示的项目列表，键不保证是项目id
      projectList: [],  // 用户原始的所有的项目
      searchText: "",
      show_qa: false,
      show_account: false,
      mail: "",
      password: "",
      avatar_url:
        // "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        "https://s4.ax1x.com/2021/12/12/oHD6gO.jpg",
    };
  },
  computed: {
    ...mapState({
      uid: (state) => state.uid,
    }),
  },
  mounted() {
    // init project
    getProjectList(this.uid).then((res) => {
      if (res.success) {
        let resObj = res.content;
        if (res.content !== null) {
          this.projectList = res.content;
          this.show_projectList = this.projectList;
        }
      } else {
        this.$message.error(res.message);
      }
    });

    // init userInfo
    getUserInfo(this.uid).then((res) => {
      if (res.success) {
        let resObj = res.content;
        if (res.content !== null) {
          this.mail = res.content.mail;
          this.password = res.content.password;
        }
      } else {
        this.$message.error(res.message);
      }
    });
  },
  methods: {
    keyDownHandler(event) {
      if (event.keyCode == "13") {
        event.preventDefault();
      }
    },
    keyUpHandler(event) {
      if (event.keyCode == "13") {
        this.search_project(event);
      }
    },
    questionAnswer() {
      this.show_qa = !this.show_qa;
    },
    accountShow() {
      this.show_account = !this.show_account;
    },
    search_project(event){
      this.show_projectList = [];
      let mod = new RegExp(this.searchText);
      Object.keys(this.projectList).forEach((val) => {
        if (mod.test(this.projectList[val])) {
          this.show_projectList.push(this.projectList[val]);
        }
      });
      console.log(this.projectList);
      console.log(this.show_projectList);
    }
  },
};
</script>

<style scoped lang="less">
@import "../assets/css/colors.less";
.el-row {
  width: 100%;
  height: 100%;
  font-family: 微软雅黑;
  font-size: 20px;
}

.left-1-col {
  background: @white;
  box-shadow: 6px 8px 14px rgba(0, 0, 0, 0.04);
  z-index: 1;
  height: 100%;
}

.left-2-col {
  background: @modao-background;
  border-right: 1px solid rgba(85, 83, 117, 0.12);
  height: 100%;
}

.left-3-col {
  background: @modao-background;
  padding: 0;
  height: 100%;
}

.icon-logo {
  width: 2em;
  height: 2em;
  vertical-align: 5em;
  fill: currentColor;
  overflow: hidden;
}

.logo-box {
  text-align: center;
  padding: 7px;
  margin-top: 20px;
  &:hover {
    cursor: pointer;
  }
}

.left-box {
  text-align: center;
  margin-top: 30px;

  &:hover {
    cursor: pointer;
    background-color: @modao-background;
  }

  .left-icon {
    width: 2em;
    height: 2em;
    vertical-align: 5em;
    fill: currentColor;
    overflow: hidden;
  }

  .left-context {
    margin-top: -100px;
    font-size: 15px;
  }
}

.logo-title {
  width: 90%;
  height: auto;
}

.box-11 {
  padding: 3% 0 0 4%;
}

.input-box {
  height: 40px;
  width: 100% - 15px;
  margin: 30px auto 20px auto;
  position: relative;
  input {
    border: 2px solid @separator;
    border-radius: 50px;
    padding-left: 40px;
    padding-right: 10px;
    outline: none;
    font-size: 15px;
    font-family: 微软雅黑;
    letter-spacing: 1px;
    width: 100% - 23px;
    height: 100%;
    color: #565657;
  }
  img {
    position: absolute;
    left: 15px;
    top: 13px;
    width: 20px;
    height: 20px;
    background: white;
    &:hover {
      cursor: pointer;
    }
  }
}

.search-box-1 {
  width: 85%;
  margin-left: 8%;
  margin-top: 15%;
  // border:2px solid;
  // border-radius:25px;
}

.info-box-1 {
  width: 85%;
  height: 40px;
  margin-left: 8%;
  margin-top: 10%;
  background-color: @prompt;
  img {
    width: 20px;
    height: 20px;
    margin-top: 5%;
    margin-left: 5%;
  }
}

.vertical-menu {
  margin-top: 10%;
}

.vertical-menu-item {
  background-color: @modao-background;
  border-bottom: 1px solid rgba(85, 83, 117, 0.12);
}

.vertical-menu-icon {
  width: 20px;
  height: 20px;
  margin-right: 10%;
  margin-left: 13%;
}

.vertical-menu-span {
  font-size: 16.5px;
}

.horizontal-menu {
  width: 11%;
  margin-top: 1%;
  margin-left: 3%;
  background-color: @modao-background;
}

.inner-box {
  margin-top: 3%;
  margin-left: 3%;
}

.card {
  padding: 8px 8px;
  width: 10%;
  text-align: center;

  .inner-card {
    height: 50px;
    border-radius: 10px;
    padding: 30px 30px 20px 30px;
    box-shadow: 6px 8px 14px rgba(0, 0, 0, 0.12);
    &:hover {
      height: 100px;
      padding: 0 0;
      background-color: white;
      cursor: pointer;
      img {
        display: none;
      }
      .implicit-btns {
        display: block;
      }
    }
    img {
      width: 50%;
      // display: none;
    }
    .implicit-btns {
      width: 100%;
      height: 100%;
      display: none;
      text-align: center;
      line-height: 100px;
    }
    .hidden-box-1 {
      width: 50%;
      height: 100%;
      display: inline-block;
      &:hover {
        background-color: @set1-dove-grey;
      }
    }
    .hidden-box-2 {
      width: 50%;
      height: 100%;
      display: inline-block;
      &:hover {
        background-color: @set1-dove-grey;
      }
    }
  }
  .card-title {
    margin-top: 8%;
    font-size: 15px;
    color: @modao-font;
  }

  .card-icon {
    width: 1.2em;
    height: 1.2em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
}

.qa-box {
  position: absolute;
  right: 10px;
  bottom: 20px;
  width: 60px;
  &:hover {
    cursor: pointer;
  }

  .qa-icon {
    color: #333333;
    width: 2em;
    height: 2em;
    // vertical-align: 5em;
    fill: currentColor;
    overflow: hidden;
  }
}

.qa-menu {
  position: absolute;
  right: 50px;
  bottom: 80px;

  border-radius: 15px;
  width: 110px;
  height: 120px;
  font-size: 13px;
  color: white;
  background-color: @myblack;
  text-align: center;
  line-height: 40px;
  div {
    height: 33%;
  }
  &:hover {
    cursor: pointer;
  }
}

.account-box {
  position: absolute;
  right: 40px;
  top: 40px;
  &:hover {
    cursor: pointer;
  }
}

.user-info {
  border-radius: 15px;
  position: absolute;
  right: 50px;
  top: 100px;

  width: 200px;
  height: 80px;
  background-color: @shadow-1;

  padding-left: 15px;
  padding-top: 10px;
  line-height: 20px;
  .user-info-1l-1 {
    width: 80%;
    display: inline-block;
  }
  .user-info-1l-2 {
    width: 20%;
    display: inline-block;
  }
  .user-info-2l-1 {
    margin: 10px 0;
    font-size: 17px;
  }
  .user-info-2l-2 {
    margin: 10px 0;
    font-size: 14px;
  }
}

.icon-acc {
  color: white;
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;

  &:hover {
    cursor: pointer;
  }
}
</style>