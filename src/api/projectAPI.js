import axios from "axios";
axios.defaults.baseURL =  '/api/project';

export {createProjectAPI, getProjectAPI, getAllProjectsAPI}

function createProjectAPI(uid, projectName){
    return axios.post( '/create_new_project/' + uid, { projectName })
        .then(res => {
            return res.data
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getProjectAPI(pid){
    return axios.get( '/get_project/' + pid)
        .then(res => {
            return res.data
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getAllProjectsAPI(uid){
    return axios.get( '/get_all_projects' + uid)
        .then(res => {
            return res.data
        })
        .catch(function (error) {
            console.log(error);
        });
}