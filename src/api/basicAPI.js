import axios from "axios";


export {
    getKG,
    inputKG,
    getProjectList,
    getUserInfo
}

let base = '/demo/api/basic';

function getKG(pid) {
    return axios.get(`${base}/getKG?pid=${pid}`)
        .then(res => {
            return res.data
        }).catch(error => {
            console.log(error);
        })
}

function inputKG(graph) {
    console.log('看graph', graph);
    return axios.post(base + '/inputKG', graph)
        .then(res => {
            return res.data
        }).catch(error => {
            console.log(error);
        })
}

function getProjectList(uid) {
    return axios.get(`${base}/getUserProjects?uid=${uid}`)
        .then(res => {
            return res.data
        }).catch(err => {
            console.log(err);
        })
}

export function newProject(project) {
    return axios.post(base + '/createProject', project)
        .then(res => {
            return res.data
        }).catch(error => {
            console.log(error);
        })
}

function getUserInfo(uid) {
    return axios.get(`${base}/getUserInfo?uid=${uid}`)
        .then(res => {
            return res.data
        }).catch(err => {
            console.log(err);
        })
}

// function removeProject(pid) {
//     return axios.get(`${base}/removeProject?pid=${pid}`)
//         .then(res => {
//             return res.data
//         }).catch(err => {
//             console.log(err);
//         })
// }