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
        project_name: '--',
        /**当前新手引导的步骤 */
        guideStep: 0,
        /**新手引导总步骤数 */
        guideMaxStep: 2,
        /**将来要改缓存 */
        showGuide: true,
    },

    mutations: {
        setProject(state, project){
            state.project = project;
        },
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
        },
        /**step: 可为负数，表示后退 */
        changeGuideStep(state, step) {
            const result = state.guideStep + step;
            state.guideStep = Math.max(result, 0);
            if (state.guideStep > state.guideMaxStep) {
                state.showGuide = false;
            }
        },
        /**将来改缓存 */
        changeShowGuide(state) {
            state.showGuide = !state.showGuide;
        },
    },

    actions: {
        loadProject({state,commit}){
            return new Promise((resolve,reject) => {
                getKG(state.pid).then(res => {
                    console.log('loadProject=======', res);
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
