import axios from "axios";

export {createProjectAPI, getProjectAPI, getAllProjectsAPI}

let base =  '/demo/api/project';

function createProjectAPI(uid, projectName){
    return axios.post( base + '/create_new_project/' + uid, { projectName })
        .then(res => {
            return res.data
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getProjectAPI(pid){
    return axios.get( base + '/get_project/' + pid)
        .then(res => {
            return res.data
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getAllProjectsAPI(uid){
    return axios.get( base + '/get_all_projects/' + uid)
        .then(res => {
            return res.data
        })
        .catch(function (error) {
            console.log(error);
        });
}