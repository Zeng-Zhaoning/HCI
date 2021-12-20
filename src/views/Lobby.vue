<template>
  <el-row>
    <el-col :span="1" class="left-1-col">
      <div class="logo-box">
        <img src="/icons/knowledgegraph.png" class="logo-title" />
      </div>
      <div class="left-box">
        <svg class="left-icon" style="color: #ff6161" @click="createProject">
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
        <input
          v-model="searchText"
          placeholder="搜索项目"
          @keyup="keyUpHandler"
          @keydown="keyDownHandler"
        />
      </div>
      <el-menu
        default-active="1"
        class="vertical-menu"
        text-color="#525E71"
        active-text-color="#6a85ce"
        @select="show_menu_items"
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
      <div class="box-11" v-if="show_state == 1">全部项目</div>
      <div class="box-11" v-if="show_state == 2">收藏项目</div>
      <div class="box-11" v-if="show_state == 3">回收站</div>
      <el-menu
        :default-active="'1'"
        mode="horizontal"
        class="horizontal-menu"
        v-if="show_state == 1"
        @select="show_lock_item"
      >
        <el-menu-item index="1">当前</el-menu-item>
        <el-menu-item index="2">已锁定</el-menu-item>
      </el-menu>
      <img class="no_proj" src="/icons/no_proj.png" v-if="show_no_proj" />
      <div class="inner-box">
        <div :key="ind" v-for="(proj, ind) in show_projectList" class="card">
          <div class="inner-card">
            <img src="/icons/book.png" />
            <div class="implicit-btns">
              <div class="hidden-box-1" title="编辑" @click="edit(proj)">
                <svg class="card-icon">
                  <use xlink:href="#iconbianji"></use>
                </svg>
              </div>
              <div class="hidden-box-2" title="删除" @click="remove_proj(proj)">
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
      <div v-if="show_account" class="user-info" @click.stop="">
        <div class="user-info-1l-1">
          <span class="user-info-2l-1">您好，</span>
          <div class="user-info-2l-2">
            {{ mail }}
          </div>
        </div>
        <div class="log-out" @click="backToLogin">退出登录</div>
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
import { getProjectList, getUserInfo, newProject } from "@/api/basicAPI";
import { mapMutations, mapState, mapActions } from "vuex";
// import { Calendar, Search } from "@element-plus/icons-vue";
export default {
  name: "Lobby",
//   components: {
//     Calendar,
//     Search,
//   },
  data() {
    return {
      show_projectList: [], // 展示的项目列表，键不保证是项目id
      projectList: [], // 用户原始的所有的项目
      searchText: "",
      show_qa: false,
      show_account: false,
      mail: "",
      password: "",
      avatar_url:
        // "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        "https://s4.ax1x.com/2021/12/12/oHD6gO.jpg",
      show_state: 1,
      show_no_proj: false,
    };
  },
  computed: {
    ...mapState({
      uid: (state) => state.uid,
      pid: (state) => state.pid,
      proj_name: (state) => state.project_name,
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
        // this.$message.error(res.message);
        this.show_no_proj = true;
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

    document.querySelector('#app').addEventListener("click", (event) => {
      this.show_account = false;
      this.show_qa = false;
    });
  },
  methods: {
    ...mapMutations(["setPid", "setProjectName"]),
    ...mapActions(['loadProject']),
    createProject() {
      this.$prompt("请输入项目名称", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(({ value }) => {
          !value && this.$message({
            type: "error",
            message: "项目名不能为空",
          });
          // api
          newProject({ name: value, uid: this.uid }).then((res) => {
            if (res.success) {
              let new_pid = res.content;
              getProjectList(this.uid).then((res) => {
                if (res.success) {
                  let resObj = res.content;
                  if (res.content !== null) {
                    this.projectList = res.content;
                    this.show_projectList = this.projectList;
                    this.show_state = 1;
                    this.$message({
                      type: "success",
                      message: "项目新建成功",
                    });
                  }
                } else {
                  this.$message.error(res.message);
                }
              });
            } else {
              this.$message.error(res.message);
            }
          });
        })
    },
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
    /**用于统一控制面板的开关，新增面板时在这里加一下变量名 */
    showModal(modalName) {
      const modals = ['show_qa', 'show_account'];
      modals.forEach((item) => {
        if (item === modalName) {
          this[item] = !this[item];
        } else {
          this[item] = false;
        }
      });
    },
    questionAnswer(event) {
      // this.show_qa = !this.show_qa;
      this.showModal('show_qa');
      event.stopPropagation();
    },
    accountShow(event) {
      // this.show_account = !this.show_account;
      this.showModal('show_account');
      event.stopPropagation();
    },
    search_project(event) {
      this.show_projectList = [];
      let mod = new RegExp(this.searchText);
      Object.keys(this.projectList).forEach((val) => {
        if (mod.test(this.projectList[val])) {
          this.show_projectList.push(this.projectList[val]);
        }
      });
      console.log(this.projectList);
      console.log(this.show_projectList);
    },
    edit(proj) {
      // update pid
      Object.keys(this.projectList).forEach((val) => {
        if (proj === this.projectList[val]) {
          this.setPid(val);
          window.localStorage.setItem("pid", val);
          this.setProjectName(proj);
          window.localStorage.setItem("project_name", proj);
          this.loadProject();
          this.$router.push({ name: "Home" });
        }
      });
    },
    show_all_projects() {
      this.show_projectList = this.projectList;
    },
    show_menu_items(index) {
      this.show_state = index;
      if (index == 1) {
        this.show_projectList = this.projectList;
        if (Object.keys(this.show_projectList).length > 0) {
          this.show_no_proj = false;
        }
      } else if (index == 2) {
        this.show_projectList = [];
        this.show_no_proj = true;
      } else {
        this.show_projectList = [];
        this.show_no_proj = true;
      }
    },
    show_lock_item(index) {
      this.show_projectList = this.projectList;
      if (index == 1) {
        if (Object.keys(this.show_projectList).length > 0) {
          this.show_no_proj = false;
        }else{
          this.show_no_proj = true;
        }
      } else {
        this.show_projectList = [];
        this.show_no_proj = true;
      }
    },
    remove_proj(proj) {
      // 只是简单的去除，没有牵扯后端操作
      Object.keys(this.projectList).forEach((val) => {
        if (proj === this.projectList[val]) {
          delete this.projectList[val];
          this.$message.success("删除成功!");
        }
      });
      console.log(this.projectList);
    },
    backToLogin(){
      this.$router.push('/');
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
  width: 90%;
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
    width: 72%;
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
  display: inline-block;
  padding: 8px 8px;
  width: 10%;
  text-align: center;
  margin: 0 10px;

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
      border-radius: 10px 0 0 10px;
      width: 50%;
      height: 100%;
      display: inline-block;
      &:hover {
        background-color: #dadada;
      }
    }
    .hidden-box-2 {
      border-radius: 0 10px 10px 0;
      width: 50%;
      height: 100%;
      display: inline-block;
      &:hover {
        background-color: #dadada;
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
  // border: 1px solid #333333;
  // border-radius: 15px;
  border: none;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 0 5px 3px #f0f0f1;
  
  position: absolute;
  right: 50px;
  top: 100px;

  width: 200px;
  height: 90px;

  padding-left: 15px;
  padding-top: 10px;
  line-height: 20px;
  .user-info-1l-1 {
    width: 80%;
    display: inline-block;
  }
  .user-info-2l-1 {
    color: @theme;
    margin: 10px 0;
    font-size: 15px;
    overflow: hidden; 
    text-overflow: ellipsis;
  }
  .user-info-2l-2 {
    margin: 5px 0;
    font-size: 15px;
    overflow: hidden; 
    text-overflow: ellipsis;
    color: @modao-font;
  }
}

.log-out {
  color: @prompt;
  font-size: 14px;
  position: absolute;
  right: 16px;
  bottom: 11px;
  &:hover {
    cursor: pointer;
    color: tomato;
    text-decoration: underline;
  }
}

.no_proj {
  margin-left: 35%;
  margin-top: 15%;
}
</style>