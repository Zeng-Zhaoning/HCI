import {createStore} from 'vuex'
import {workspace} from './workspace'
import {getKG} from '../api/basicAPI'


export default createStore({
    modules:{
        workspace: workspace
    },

    state: {
        uid: 1,
        umail: '',
        upass: '',
        pid: 0,
        project: null,
        project_name: '',
    },

    mutations: {
        setProject(state, project){
            state.project = project;
        },
        // setWholeProject(state, whole){
        //     state.whole_project = whole;
        // },
        // setProjectLeft(state, left){
        //     state.project_left = left;
        // },
        setPid(state, pid){
            state.pid = pid;
        },
        setProjectName(state, name){
            state.project_name = name;
        },
        setUserInfo(state, uid, umail, upass){
            state.uid = uid;
            state.umail = umail;
            state.pass = upass;
        }
    },

    actions: {
        loadProject({state,commit}){
            return new Promise((resolve,reject) => {
                getKG(state.pid).then(res => {
                    console.log(res);
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
