import axios from "axios";


export { grammar_analyse }

let base =  '/demo/api/grammar/';

function grammar_analyse(question){
    return new Promise((resolve, reject) => {
        axios.get(base + 'grammar_analyse?question=' + question)
            .then(res => {
                resolve(res.data);
            }).catch(error => {
                reject(error);
        })
    })
}