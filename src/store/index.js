/**
 * 注：考虑到本应用要集中管理的数据似乎不多，
 * 目前个人觉得就用这一个仓库（文件）集中管理数据就好了，
 * 不需要新建user,project等。
 */

import { createStore } from 'vuex'
import { getProjectAPI } from "@/api/projectAPI";

export default createStore({
  state: {
    current_project: null,
    current_pid: 1
  },

  getters: {

  },

  mutations: {
    setCurrentProject(state, project){
      state.current_project = project;
    }
  },

  actions: {
    loadProject({ commit }, pid) {
      getProjectAPI(pid)
          .then( project => { commit('setCurrentProject', project) })
          .catch( error => { console.log(error) })
    }
  }

})
