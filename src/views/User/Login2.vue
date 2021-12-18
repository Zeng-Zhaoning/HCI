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
    <div class="login-box">
      <div class="login-title">登录</div>
      <div class="login-inputs">
        <div class="input-box">
          <img class="mail-icon" src="/icons/email.svg" />
          <input placeholder="邮箱" />
        </div>
        <div class="input-box">
          <img class="password-icon" src="/icons/password.svg"/>
          <input placeholder="密码" type="password"/>
        </div>
      </div>
      <div class="bottom-btns">
        <button class="login-btn">登录</button>
        <div class="other-btns">
          <div class="other-btn">忘记密码？</div>
          <div class="other-btn">注册账号</div>
        </div>
      </div>
    </div>
    <div class="author">
      ©Copyright 苏语风 曾昭宁 刘子仰 林心鹏
    </div>
  </div>
</template>

<style scoped lang="less">
@import "../../assets/css/colors.less";

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
}

.other-btns {
  width: 100%;
  display: flex;
  justify-content: space-between;
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
