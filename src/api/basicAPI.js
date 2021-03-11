import axios from "axios";
axios.defaults.baseURL =  '/api/basic';

export {setTextAPI, getGraphAPI}

function setTextAPI(pid, text){
    return axios.post('/set_text/' + pid, {content: text})
        .then(res => {
            return res.data
        }).catch(error => {
            console.log(error);
        })
}


function getGraphAPI(pid){
    return axios.get('/get_graph/' + pid )
        .then(res => {
            return res.data
        }).catch(error => {
            console.log(error);
        })
}
