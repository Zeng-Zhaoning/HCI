import axios from "axios";


export {setTextAPI, getGraphAPI}

let base =  '/api/basic';

function setTextAPI(pid, text){

    return axios.post(base + '/set_text/' + pid, {string: text})
        .then(res => {
            return res.data
        }).catch(error => {
            console.log(error);
        })
}


function getGraphAPI(pid){
    return axios.get(base + '/get_graph/' + pid )
        .then(res => {
            return res.data
        }).catch(error => {
            console.log(error);
        })
}
