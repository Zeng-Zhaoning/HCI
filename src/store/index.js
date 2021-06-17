import {createStore} from 'vuex'
import {workspace} from './workspace'
import {getKG} from '../api/basicAPI'


export default createStore({
    modules:{
        workspace: workspace
    },

    state: {
        project: null,
    },

    mutations: {
        setProject(state, project){
            state.project = project;
        },
    },

    actions: {
        loadProject({state,commit}){
            return new Promise((resolve,reject) => {
                getKG().then(res => {
                    if (res.success){
                        commit('setProject', res.content);
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
