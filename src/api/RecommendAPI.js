import axios from "axios";


export { getRecommend }

let base =  '/demo/api/recommend/';

function getRecommend(question, pid){
    return new Promise((resolve,reject) => {
        axios.get(`${base}/simple_question?question=${question}&pid=${pid}`)
            .then(res => {
                resolve(res.data);
            }).catch(error => {
                console.log(error);
                reject(error);
        })
    })
}