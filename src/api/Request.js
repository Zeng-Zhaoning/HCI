import axios from "axios";
let base =  '/demo/api/basic';
export function get(url, params) {
    return new Promise((resolve, reject) => {
        axios.get(base+url, {
            params: params,

        }).then((res) => {
            resolve(res.data);
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
    });
}

export function post(url, data) {
    return new Promise((resolve, reject) => {
        axios.post(base+url, data,{
        }).then(res => {
            resolve(res.data);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}

