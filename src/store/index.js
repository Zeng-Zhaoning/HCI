import {createStore} from 'vuex'
import {workspace} from './workspace'
import {getKG} from '../api/basicAPI'

export default createStore({
    modules:{
        workspace: workspace
    },

    state: {
        uid: undefined,
        umail: '',
        upass: '',
        pid: undefined,
        project: null,
        project_name: '',
        /**项目页新手引导的当前步骤 */
        lobbyGuideStep: 0,
        /**项目页新手引导总步骤数 */
        lobbyGuideMaxStep: 2,
        /**将来要改缓存 */
        isLobbyGuideShow: true,
        /**编辑页新手引导的当前步骤 */
        editGuideStep: 1,
        /**编辑页新手引导总步骤数 */
        editGuideMaxStep: 1,
        /**将来要改缓存 */
        isEditGuideShow: true,
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
        changeLobbyGuideStep(state, step) {
            const result = state.lobbyGuideStep + step;
            state.lobbyGuideStep = Math.max(result, 0);
            if (state.lobbyGuideStep > state.lobbyGuideMaxStep) {
                state.isLobbyGuideShow = false;
            }
        },
        /**将来改缓存 */
        changeIsLobbyGuideShow(state) {
            state.isLobbyGuideShow = !state.isLobbyGuideShow;
        },
        /**step: 可为负数，表示后退 */
        changeEditGuideStep(state, step) {
            const result = state.editGuideStep + step;
            state.editGuideStep = Math.max(result, 0);
            if (state.editGuideStep > state.editGuideMaxStep) {
                state.isEditGuideShow = false;
            }
        },
        /**将来改缓存 */
        changeIsEditGuideShow(state) {
            state.isEditGuideShow = !state.isEditGuideShow;
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
