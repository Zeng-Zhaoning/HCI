import {createStore} from 'vuex'
import {workspace} from './workspace'

import {getProjectAPI, getAllProjectsAPI} from "@/api/projectAPI";



export default createStore({
    modules:{
        workspace: workspace
    },

    state: {
        uid: 1,
        user_name: "Administer",
        current_pid: 1,
        current_project: null,
        all_projects: [],
    },

    getters: {
        current_project(state) {
            for (let p of state.all_projects) {
                if (p.pid === state.current_pid) {
                    return p;
                }
            }
        },
    },

    mutations: {
        setCurrentProject(state, pid) {
            state.current_pid = pid;
        },
        setAllProjects(state, pros) {
            state.all_projects = pros;
        },
        updateProjectInfo(state, data){
            //data 包括：pid, project_name, text, edges[], nodes[]
            for (let p of state.all_projects) {
                if (p.pid === data.pid) {
                    p.project_name = data.project_name;
                    p.text = data.text;
                    p.edges = data.edges;
                    p.nodes = data.nodes;
                    return;
                }
            }
        }
    },

    actions: {
        loadProject({commit}, pid) {
            getProjectAPI(pid)
                .then(res => {
                    if (res.success) {
                        commit('setCurrentProject', res.content)
                    } else {
                        console.log(res.message);
                    }
                })
                .catch(error => {
                    console.log(error)
                })
        },

        loadAllProjects({state, commit, getters}, uid) {
            return new Promise(((resolve, reject) => {
                getAllProjectsAPI(uid)
                    .then(function (res) {
                        if (res.success) {
                            commit('setAllProjects', res.content);
                        } else {
                            console.log(res.message);
                        }
                        resolve(res);
                    })
                    .catch(error => {
                        console.log(error);
                        reject(error);
                    });
            }))
        },


    }

})
