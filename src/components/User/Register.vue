<template>
  <div class="page">
    <div style="display: flex;justify-content: center;margin-top: 5%">
      <el-card style="max-width: 500px">
        <div class="card">
          <img src="../../assets/images.webp"/>
          <div style="text-align: center;font-weight:bold;">注册</div>
          <div style="margin-top: 16px">
            <el-input v-model="email" placeholder="邮箱" prefix-icon="el-icon-folder" style="width: 200px;"></el-input>
          </div>
          <div style="margin-top: 16px">
            <el-input v-model="password" placeholder="密码" prefix-icon="el-icon-lock" show-password
                      style="width: 200px;"></el-input>
          </div>
          <div style="margin-top: 16px">
            <el-input v-model="rePassword" placeholder="确认密码" prefix-icon="el-icon-lock" show-password
                      style="width: 200px;"></el-input>
          </div>
          <div style="margin-top: 16px">
            <el-button type="primary" @click="register">注册</el-button>
          </div>
          <div style="margin-top: 16px">
            <el-button type="warning" @click="toGoBack">返回登录</el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import {post} from '../../api/Request'

export default {
  name: "Register",
  data() {
    return {
      email: '',
      password: '',
      rePassword: ''
    }
  },
  methods: {
    async register() {
      if (!/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(this.email)) {
        this.$notify.error('邮箱格式不符合要求')
        return
      }
      if (this.password.length < 6) {
        this.$notify.error('密码长度需要大于等于6个字符')
        return
      }
      if (!this.password && !this.email) {
        this.$notify.error('输入内容不能为空')
        return
      }
      if (this.password !== this.rePassword) {
        this.$notify.error('两次输入的密码不一致，请重新输入')
        return
      }
      const res = await post('/createUser', {id: null, mail: this.email, password: this.password})
      if(res.content==false){
        this.$notify.error(res.message)
        console.log("wrong",res)
        return
      }
      this.$notify.success("创建成功")
      this.$router.back()
    },
    toGoBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.page {
  position: fixed;
  width: 100%;
  height: 100%;
  background-size: 100% 100%;
  background-image: url('../../assets/test.jpg');
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
