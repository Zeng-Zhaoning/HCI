/**
 * 注：考虑到本应用要集中管理的数据似乎不多，
 * 目前个人觉得就用这一个仓库（文件）集中管理数据就好了，
 * 不需要新建user,project等。
 */

import { createStore } from 'vuex'
import { getProjectAPI } from "@/api/projectAPI";

export default createStore({
  state: {
    user_name: "傻逼",
    uid: 1,
    current_project: {
      pid: 1,
      project_name: "希望工程",
      text: "测试内容",
      graph: [{subject: "傻逼1",object: "傻逼2",relation: "嘲笑"}]
    },
    all_projects: [
      {
        pid: 1,
        project_name: "希望工程",
        text: "测试内容",
        graph: [{subject: "傻逼1",object: "傻逼2",relation: "嘲笑"}]
      },
      {
        pid: 2,
        project_name: "吃饭工程",
        text: "测试吃饭",
        graph: [{subject: "傻逼2",object: "傻逼3",relation: "鄙视"}]
      }
    ]
  },

  getters: {

  },

  mutations: {
    setCurrentProject(state, project){
      state.current_project = project;
    },
  },

  actions: {
    loadProject({ commit }, pid) {
      getProjectAPI(pid)
          .then( project => { commit('setCurrentProject', project) })
          .catch( error => { console.log(error) })
    }
  }

})
