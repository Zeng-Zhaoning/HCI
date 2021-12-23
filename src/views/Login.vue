<template>
  <div class="container">
    <img class="left-top-pic" src="/icons/left-top-pic.png" />
    <img class="left-bottom-pic" src="/icons/left-bottom-pic.png" />
    <img class="right-pic" src="/icons/right-pic.png" />
    <div class="introduction">
      <img class="web-logo" src="/icons/knowledgegraph.png"/>
      <div class="web-title">知识图谱在线编辑系统</div>
      <div class="web-description">在这里，<br />
        轻松创建你的知识图谱，<br />
        并对图谱进行编辑、保存、导出图片等操作<br />
      </div>
    </div>
    <div class="divider" />
    <div class="login-box" :class="{ 'register-box': isRegistering }">
      <div class="login-title">{{isRegistering ? "注册" : "登录"}}</div>
      <div class="login-inputs">
        <div class="input-box" :class="{error: emailErrorMsg}">
          <img class="mail-icon" src="/icons/email.svg" />
          <input placeholder="邮箱" v-model="email" @blur="checkEmail" @input="onInputEmail" autofocus />
          <div class="errorMsg">{{emailErrorMsg}}</div>
        </div>
        <div class="input-box" :class="{error: passwordErrorMsg}">
          <img class="password-icon" src="/icons/password.svg"/>
          <input placeholder="密码" type="password" v-model="password" @blur="checkPassword" @input="onInputPassword" />
          <div class="errorMsg">{{passwordErrorMsg}}</div>
        </div>
        <div v-if="isRegistering" class="input-box" :class="{error: rePasswordErrorMsg}">
          <img class="password-icon" src="/icons/password.svg"/>
          <input placeholder="确认密码" type="password" v-model="rePassword" @input="checkRePassword" />
          <div class="errorMsg">{{rePasswordErrorMsg}}</div>
        </div>
      </div>
      <div class="bottom-btns">
        <button v-if="!isRegistering" class="login-btn" :class="{disabled: isRequesting}" @click="login" :disabled="isRequesting">
          {{isRequesting ? '登陆中...' : '登录'}}
        </button>
        <button v-if="isRegistering" class="login-btn" :class="{disabled: isRequesting}" @click="register" :disabled="isRequesting">
          {{isRequesting ? '注册中...' : '注册'}}
        </button>
        <div class="other-btns">
          <div v-if="!isRegistering" class="other-btn" @click="changePage">注册账号</div>
          <div v-if="!isRegistering" class="other-btn" @click="toForget">忘记密码？</div>
          <div v-if="isRegistering" class="other-btn" @click="changePage">返回</div>
        </div>
      </div>
    </div>
    <div class="author">
      ©Copyright 苏语风 曾昭宁 刘子仰 林心鹏
    </div>
  </div>
</template>


<script>
/*eslint-disable*/
import { post } from "../api/Request";
import { mapMutations, mapState } from "vuex";
export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
      emailErrorMsg: "",
      passwordErrorMsg: "",
      rePassword: "",
      rePasswordErrorMsg: "",
      isRegistering: false,
      isRequesting: false,
    };
  },
  computed: {
    ...mapState({
      uid: (state) => state.uid,
      umail: (state) => state.umail,
      upass: (state) => state.upass,
    }),
  },
  mounted() {
    document.addEventListener('keypress', this.hadleKeyPress);
  },
  unmounted() {
    document.removeEventListener('keypress', this.hadleKeyPress);
  },
  methods: {
    ...mapMutations(["setUserInfo", "changeIsLobbyGuideShow", "changeIsEditGuideShow"]),
    checkEmail() {
      if (!this.email) {
        this.emailErrorMsg = "请输入邮箱";
      } else if (!/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(this.email)) {
        this.emailErrorMsg = "邮箱格式不正确";
      } else {
        this.emailErrorMsg = "";
      }
    },
    onInputEmail() {
      this.emailErrorMsg && this.checkEmail();
    },
    checkPassword () {
      if (!this.password) {
        this.passwordErrorMsg = "请输入密码";
      } else if (this.password.length < 6) {
        this.passwordErrorMsg = "密码长度不少于6个字符";
      } else {
        this.passwordErrorMsg = "";
      }
    },
    onInputPassword() {
      this.passwordErrorMsg && this.checkPassword();
    },
    checkRePassword () {
      if (!this.rePassword) {
        this.rePasswordErrorMsg = "请再次输入密码";
      } else if (this.rePassword !== this.password) {
        this.rePasswordErrorMsg = "两次输入的密码不一致";
      } else {
        this.rePasswordErrorMsg = "";
      }
    },
    async login() {
      this.checkEmail();
      this.checkPassword();
      const errorMsg = this.emailErrorMsg || this.passwordErrorMsg;
      if (errorMsg) {
        this.$message.error(errorMsg);
        return;
      }

      this.isRequesting = true;
      let res = await post("/checkUser", {
        mail: this.email,
        password: this.password,
      });
      this.isRequesting = false;

      if (!res.success) {
        this.$message.error(res.message);
        (res.message === "密码错误") && (this.passwordErrorMsg = res.message);
        console.log("wrong", res);
        return;
      }

      let uid = res.content["id"];
      this.setUserInfo(uid, this.mail, this.password);
      window.localStorage.setItem("uid", uid);
      window.localStorage.setItem("umail", this.email);
      if (window.localStorage.getItem("isLobbyGuideShow") !== "true") {
        window.localStorage.setItem("isLobbyGuideShow", true);
        this.changeIsLobbyGuideShow();
      }
      if (window.localStorage.getItem("isEditGuideShow") !== "true") {
        window.localStorage.setItem("isEditGuideShow", true);
        this.changeIsEditGuideShow();
      }
      this.clearData();
      this.$router.push("/lobby");
    },
    async register() {
      this.checkEmail();
      this.checkPassword();
      this.checkRePassword();
      const errorMsg = this.emailErrorMsg || this.passwordErrorMsg || this.rePasswordErrorMsg;
      if (errorMsg) {
        this.$message.error(errorMsg);
        return;
      }

      this.isRequesting = true;
      const res = await post('/createUser', {
        id: null,
        mail: this.email,
        password: this.password
      });
      this.isRequesting = false;

      if(res.content==false){
        this.$message.error(res.message)
        console.log("wrong",res)
        return
      }
      this.$message.success("创建成功");
      this.clearData();
      this.changePage();
    },
    clearData() {
      this.email = "";
      this.emailErrorMsg = "";
      this.password = "";
      this.passwordErrorMsg = "";
      this.rePassword = "";
      this.rePasswordErrorMsg = "";
    },
    changePage() {
      this.clearData();
      this.isRegistering = !this.isRegistering;
    },
    toForget() {
      this.$message.info("请联系管理员找回密码");
    },
    hadleKeyPress(event) {
      console.log('chufa');
      if (event.keyCode === 13) {
        !this.isRegistering && this.login();
        this.isRegistering && this.register();
      }
    },
  },
};
</script>

<style scoped lang="less">
@import "../assets/css/colors.less";

.container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.left-top-pic {
  height: 50%;
  opacity: 15%;
  position: absolute;
  top: -30px;
  left: -20px;
}

.left-bottom-pic {
  height: 20%;
  opacity: 15%;
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: -10;
}

.right-pic {
  height: 40%;
  opacity: 15%;
  position: absolute;
  right: 40px;
  bottom: 26%;
  z-index: -10;
}

.introduction {
  margin-left: 20%;
}

.web-logo {
  height: 140px;
  width: 140px;
}

.web-title {
  letter-spacing: 2px;
  font-size: 20px;
  // margin-top: 10px;
  margin-bottom: 60px;
}

.web-description {
  font-size: 18px;
  font-family: 华文细黑;
  line-height: 40px;
}

.divider {
  width: 1px;
  height: 35%;
  border: none;
  background-color: @separator;
  position: absolute;
  left: 50%;
  right: 50%;
  // transform: translateY(-50%);
}

.login-box {
  width: 280px;
  height: 47%;
  background-color: white;
  box-shadow: 0 0 20px 4px #F0F0F1;
  padding: 50px 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  margin-left: 20%;
}

.register-box {
  height: 53%;
}

.login-title {
  color: @theme;
  font-weight: bold;
  font-size: 24px;
}

.login-inputs {
  width: 100%;
  margin-top: 60px;
  margin-bottom: 40px;
}

.input-box {
  border: 1px solid @separator;
  background-color: rgb(253, 253, 253);
  padding: 0 10px;
  border-radius: 7px;
  height: 40px;
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  position: relative;
  img {
    height: 17px;
    width: 17px;
    vertical-align: middle;
    margin-right: 6px;
  }
  input {
    background-color: rgb(253, 253, 253);
    height: 35px;
    border: none;
    outline: none;
    flex: 1;
    font-size: 15px;
    caret-color: @theme;
    color: @myblack;
    &::placeholder {
      color: @prompt;
      font-size: 14px;
    }
  }
  &:focus-within {
    border: 1px solid @theme;
  }
  &.error {
    border: 1px solid red;
  }
}

.errorMsg {
  color: red;
  font-size: 13px;
  width: 100%;
  position: absolute;
  top: 41px;
  left: 0;
}

.bottom-btns {
  width: 100%;
}

.login-btn {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 50px;
  background-color: @theme;
  color: white;
  font-size: 16px;
  &:hover {
    cursor: pointer;
    background-color: rgb(105, 137, 226);
  }
  &:active {
    background-color: rgba(105, 137, 226, 0.9);
  }
  &.disabled {
    opacity: 0.8;
  }
}

.other-btns {
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: row-reverse;
  margin-top: 13px;
}

.other-btn {
  font-size: 14px;
  color: @prompt;
  &:hover {
    color: tomato;
    cursor: pointer;
    text-decoration: underline;
  }
}

.author {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  color: @prompt;
}
</style>
