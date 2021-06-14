import {createStore} from 'vuex'
import {workspace} from './workspace'
import {getKG} from '../api/basicAPI'


export default createStore({
    modules:{
        workspace: workspace
    },

    state: {
        user_name: "Administer",
        project: null,
    },

    mutations: {
        setProject(state, project){
            state.project = project;
        },
    },

    actions: {
        loadProject({commit}, num){
            return new Promise((resolve,reject) => {
                getKG(num).then(res => {
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
