import {createStore} from 'vuex'
import {workspace} from './workspace'
import {getKG} from '../api/basicAPI'


export default createStore({
    modules:{
        workspace: workspace
    },

    state: {
        project: null,
        whole_project: null,
        project_left: null,
    },

    mutations: {
        setProject(state, project){
            state.project = project;
        },
        setWholeProject(state, whole){
            state.whole_project = whole;
        },
        setProjectLeft(state, left){
            state.project_left = left;
        }
    },

    actions: {
        loadWholeProject({state,commit}){
            return new Promise((resolve,reject) => {
                getKG().then(res => {
                    if (res.success){
                        commit('setWholeProject', res.content);
                    }else {
                        console.log(res.message);
                    }
                    resolve(res)
                }).catch(err => {
                    console.log(err);
                    reject(err);
                })
            })
        },
    }
})
