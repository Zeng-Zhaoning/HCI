import axios from "axios";


export { simple_question }

let base =  '/demo/api/qa/';

function simple_question(question){
    return new Promise(function (resolve, reject){
        axios.get(base + 'simple_question?question=' + question)
            .then(res => {
                resolve(res);
            }).catch(error => {
                reject(error);
        })
    })
}