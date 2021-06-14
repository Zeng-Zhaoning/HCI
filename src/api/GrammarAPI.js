import axios from "axios";


export { grammar_analyse }

let base =  '/api/grammar/';

function grammar_analyse(question){
    return axios.get(base + 'grammar_analyse?question=' + question)
        .then(res => {
            return res.data
        }).catch(error => {
            console.log(error);
        })
}