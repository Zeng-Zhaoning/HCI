import axios from "axios";


export { getRecommend }

let base =  '/demo/api/recommend/';

function getRecommend(question){
    return new Promise((resolve,reject) => {
        axios.get(base + 'simple_question' + '?question=' + question)
            .then(res => {
                resolve(res.data);
            }).catch(error => {
                console.log(error);
                reject(error);
        })
    })
}