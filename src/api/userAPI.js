import axios from "axios";
axios.defaults.baseURL =  '/api/user';

export {registerAPI, createProjectAPI}

function registerAPI(userForm){
    return axios.post( '/register', {userForm})
        .then(res => {
            return res.data
        })
        .catch(function (error) {
            console.log(error);
        });
}

function createProjectAPI(userForm){
    return axios.get( '/login', {userForm})
        .then(res => {
            return res.data
        })
        .catch(function (error) {
            console.log(error);
        });
}