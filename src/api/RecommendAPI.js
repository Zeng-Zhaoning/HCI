import axios from "axios";


export { getRecommend }

let base =  '/api/recommend/';

function getRecommend(question){
    return axios.get(base + 'simple_question' + '?question=' + question)
        .then(res => {
            return res.data
        }).catch(error => {
            console.log(error);
        })
}