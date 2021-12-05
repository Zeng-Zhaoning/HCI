import axios from "axios";


export {getKG, inputKG}

let base =  '/demo/api/basic';

function getKG(pid){
    return axios.get(`${base}/getKG?pid=${pid}`)
        .then(res => {
            return res.data
        }).catch(error => {
            console.log(error);
        })
}

function inputKG(graph){
    console.log('看graph', graph);
    return axios.post(base + '/inputKG', graph)
        .then(res => {
            return res.data
        }).catch(error => {
            console.log(error);
        })
}