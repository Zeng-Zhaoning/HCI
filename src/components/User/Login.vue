<template>
    <div class="page">
        <div style="display: flex;justify-content: center;margin-top: 5%">
            <el-card style="max-width: 500px;">
                <div class="card">
                    <img src="../../assets/images.webp"/>
                    <div style="text-align: center;font-weight:bold;font-size:20px">HRKG</div>
                    <div style="text-align: center;font-weight:bold;margin-top: 16px">登录</div>
                    <div style="margin-top: 16px">
                    <el-input v-model="email" placeholder="郵箱" style="width: 200px;" prefix-icon="el-icon-user"></el-input>
                    </div>
                    <div style="margin-top: 16px">
                        <el-input v-model="password" placeholder="密码" style="width: 200px;" show-password prefix-icon="el-icon-lock"></el-input>
                    </div>
                    <div style="margin-top: 16px">
                        <el-button type="primary" @click="login">登录</el-button>
                    </div>
                    <div style="margin-top: 16px">
                        <el-button type="warning" @click="toRegister">注册</el-button>
                    </div>
                    <div style="margin-top: 16px">
                        <el-button type="text" @click="toForget">忘记密码</el-button>
                    </div>
                </div>
            </el-card>
        </div>

    </div>
</template>


<script>
/*eslint-disable*/
    import {post} from "../../api/Request"
    export default {
        name: "Login",
        data(){
            return{
                email:'',
                password:'',
            }
        },
        methods:{
            async login(){
                if(!/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(this.email)){
                    this.$notify.error('邮箱格式不符合要求')
                    return
                }
                if(this.password.length<6){
                    this.$notify.error('密码长度需要大于等于6个字符')
                    return
                }
                if(!this.password&&!this.email){
                    this.$notify.error('输入内容不能为空')
                    return
                }

                let res = await post('/checkUser',{mail:this.email,password:this.password})

                if(res.content!=true){
                    this.$notify.error(res.message)
                    console.log("wrong",res)
                    return
                }
                console.log(res)
                // let [tokenName,tokenVal] = res.data.password.split(':')
                // window.localStorage.setItem(tokenName,tokenVal)
                // window.localStorage.setItem("uid",`${res.data.id}`)
                // window.localStorage.setItem("mail",`${res.data.email}`)
                //
                // this.$notify.success(res.msg)
                this.$router.push('/lobby')
            },
            toRegister(){
                this.$router.push('register')
            },
            toForget(){
                this.$notify.success('那我也没办法了')
                return
            }
        }
    }
</script>

<style scoped>
.page{
    position: fixed;
    width:100%;
    height:100%;
    background-size: 100% 100%;
    background-image: url('../../assets/test.jpg');
}
.card{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
</style>
