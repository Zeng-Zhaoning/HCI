import axios from "axios";


export { simple_question }

let base =  '/api/qa/';

function simple_question(question){
    return axios.get(base + 'simple_question?question=' + question)
        .then(res => {
            return res.data
        }).catch(error => {
            console.log(error);
        })
}