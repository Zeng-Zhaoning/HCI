import axios from "axios";


export { simple_question }

let base =  '/demo/api/qa';

function simple_question(question, pid){
    return new Promise(function (resolve, reject){
        axios.get(`${base}/simple_question?question=${question}&pid=${pid}`)
            .then(res => {
                resolve(res);
            }).catch(error => {
                reject(error);
        })
    })
}
