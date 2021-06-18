import axios from "axios";


export {addKG, getKG, inputKG}

let base =  '/demo/api/basic/';

function addKG(graph){
    return axios.post(base + 'addKG', graph)
        .then(res => {
            return res.data
        }).catch(error => {
            console.log(error);
        })
}


function getKG(){
    return axios.get(base + 'getKG')
        .then(res => {
            return res.data
        }).catch(error => {
            console.log(error);
        })
}

function inputKG(graph){
    return axios.post(base + 'inputKG', graph)
        .then(res => {
            return res.data
        }).catch(error => {
            console.log(error);
        })
}