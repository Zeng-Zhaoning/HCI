/**
 * 注：考虑到本应用要集中管理的数据似乎不多，
 * 目前个人觉得就用这一个仓库（文件）集中管理数据就好了，
 * 不需要新建user,project等。
 *
 * 3/14新注：
 * 好吧。。迭代二应该就要分家了。。
 */

import { createStore } from 'vuex'
import { getProjectAPI,getAllProjectsAPI } from "@/api/projectAPI";
import { setTextAPI } from "@/api/basicAPI"


export default createStore({
  state: {
    user_name: "傻逼",
    uid: 1,
    current_pid: 1,
    current_project: null,
    //注意下面这个是当前工作区的文本，不是当前项目的文本（可能是编辑中未保存的暂时文本）
    workspace_text: "",
    all_projects: []
  },

  getters: {
    current_project(state){
        for(let p of state.all_projects){
            if (p.pid === state.current_pid){
                return p;
            }
        }
    },
  },

  mutations: {
    setCurrentProject(state, pid){
      state.current_pid = pid;
    },
    setAllProjects(state, pros){
      state.all_projects = pros;
    },
    setWorkspaceText(state, text){
        state.workspace_text = text;
    },
    setProjectGraph(state, data){
        let pid = data.pid;
        let graph = data.graph;
        for(let p of state.all_projects){
            if(p.pid === pid){
                p.graph = graph
            }
        }
    },
  },

  actions: {
    loadProject({ commit }, pid) {
      getProjectAPI(pid)
          .then( res => {
            if(res.success){
              commit('setCurrentProject', res.content)
            }else{ console.log(res.message); }
          })
          .catch( error => { console.log(error) })
    },

    loadAllProjects({ state, commit, getters }, uid){
        return new Promise(((resolve, reject) => {
            getAllProjectsAPI(uid)
                .then( function (res) {
                    if(res.success){
                        commit('setAllProjects', res.content);
                        resolve(res);
                    }
                    else { console.log(res.message);}
                })
                .catch( error => {
                    console.log(error);
                    reject(error)
                });
        }))
    },

    postText({ commit }, data){
        let pid = data.pid;
        let text = data.text;
        setTextAPI(pid, text).then(res => {
            if(res.success){

            }else { console.log(res.message); }
        }).catch(err => {

        })
    }
  }

})
