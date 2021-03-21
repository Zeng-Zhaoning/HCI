import axios from "axios";

export {registerAPI, createProjectAPI}

let base =  '/demo/api/user';

function registerAPI(userForm){
    return axios.post( base + '/register', {userForm})
        .then(res => {
            return res.data
        })
        .catch(function (error) {
            console.log(error);
        });
}

function createProjectAPI(userForm){
    return axios.get( base + '/login', {userForm})
        .then(res => {
            return res.data
        })
        .catch(function (error) {
            console.log(error);
        });
}