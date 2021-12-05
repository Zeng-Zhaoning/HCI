<template>
  <div class="qa-panel">
    <div class="title-box">智能问答</div>
    <div class="message-box">
      <el-scrollbar>
        <div class="message-item" v-for="text in texts">
          <div class="message-item-1" v-if="text.from === 1">
            <div class="name">小智</div>
            <div class="message">{{ text.text }}</div>
          </div>
          <div class="message-item-2" v-if="text.from === 2">
            <div class="name">我</div>
            <div class="message">{{ text.text }}</div>
          </div>
        </div>
        <img src="../../public/icons/loading.gif" v-show="loading"/>
      </el-scrollbar>
    </div>
    <div class="input-box">
      <textarea v-model="question" @keyup="keyUpHandler" @keydown="keyDownHandler"></textarea>
      <my-button class="query-btn" @click="query">询问</my-button>
    </div>
  </div>
</template>

<script>
import MyButton from "@/components/Tools/MyButton";
import {simple_question} from "@/api/QAAPI"
import { mapState } from 'vuex';
export default {
  name: "QAPanel",
  components: {MyButton},
  data(){
    return{
      loading: false,
      question: "哈利波特",
      texts: [
        {
          from: 1, //1是系统，2是用户
          text: "试着问我问题吧~",
        }
      ]
    }
  },
  computed: {
    ...mapState({
      pid: state => state.pid,
    }),
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
      if (this.question !== ''){
        this.texts.push({from: 2, text:this.question});
        let question = this.question;
        this.question = "";  //清空输入栏
        this.loading = true;
        let scrollView = document.getElementsByClassName("el-scrollbar__wrap")[0];
        scrollView.scrollTop = scrollView.scrollHeight;
        simple_question(question, this.pid).then(res => {
          this.loading = false;
          if (res.data.success){
            this.texts.push({from: 1, text: res.data.content});
          }else {
            this.texts.push({from: 1, text: "查询失败噢...信息：" + res.data.message});
          }
        }).catch(err => {
          this.loading = false;
          this.$message.error("访问失败，请检查网络")
        }).finally(() => {
          scrollView.scrollTop = scrollView.scrollHeight;
        });
      }
    },
  }
}
</script>

<style scoped lang="less">
@import "../assets/css/colors.less";
.qa-panel{
  width: 300px;
  height: 630px;
  box-shadow: 0px 0 1px #e6e6e6;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #eeeeee;
  display: flex;
  flex-direction: column;
}

.title-box{
  color: @theme;
  font-weight: bold;
  font-size: 15px;
  font-family: 微软雅黑;
  height: 20px;
  line-height: 20px;
  padding: 14px;
  border-bottom: 1px solid #eeeeee;
}

.message-box{
  flex: 1;
  padding: 14px 0 14px 14px;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.el-scrollbar{
  padding-right: 14px;
}

.message-item{
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
}

.name{
  color: @myblack;
  font-size: 14px;
  font-family: 微软雅黑;
  letter-spacing:1px;
  margin-bottom: 5px;
  width: 100%;
}

.message{
  color: @myblack;
  font-size: 14px;
  font-family: 微软雅黑;
  letter-spacing:1px;
  max-width: 75%;
  width: fit-content;
  padding: 10px 13px;
  border-radius: 8px;
}

.message-item-1{
  .message{
    border: 1px solid #d8d8ff;
  }
}

.message-item-2{
  .name{
    text-align: right;
  }
  .message{
    background: #ededfd;
    float: right;
  }
}

.input-box{
  height: 150px;
  border-top: 1px solid #eeeeee;
  position: relative;
}

textarea{
  resize: none;
  border: none;
  margin: 10px 10px 0 10px;
  outline: none;
  font-size: 15px;
  font-family: 微软雅黑;
  letter-spacing:1px;
  height: 100% - 40px;
  width: 100% - 10px;
  color: #565657;
}

.query-btn{
  margin-bottom: 14px;
  position: absolute;
  right: 14px;
  bottom: 0;
}

</style>