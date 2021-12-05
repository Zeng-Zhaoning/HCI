import axios from "axios";

export function get(url, params) {
    return new Promise((resolve, reject) => {
        axiosInstance.get(url, {
            params: params,
            headers:{
                "satoken":window.localStorage.getItem("satoken")
            }
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
        axiosInstance.post(url, data,{
            headers:{
                "satoken":window.localStorage.getItem("satoken")
            }
        }).then(res => {
            resolve(res.data);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}

export function pyPost(url,data){
    return new Promise((resolve,reject)=>{
        pythonAxiosInstance.post(url,data).then(res=>{
            resolve(res.data)
        }).catch(err=>{
            console.log(err);
            reject(err)
        })
    })
}

export function pyPostExtract(url,data){
    return new Promise((resolve,reject)=>{
        pythonAxiosExtract.post(url,data).then(res=>{
            resolve(res.data)
        }).catch(err=>{
            console.log(err);
            reject(err)
        })
    })
}

const axiosInstance = axios.create({
    //服务器
    baseURL: "http://124.70.54.24:8327",
    //本地
    // baseURL:"http://localhost:8327",
    timeout: 10000,
    headers: {}
});

const pythonAxiosInstance = axios.create({
    baseURL: "http://139.9.235.173:12308",
    //本地
    // baseURL:"http://localhost:8327",
    timeout: 10000,
    headers: {}
})

const pythonAxiosExtract = axios.create({
    baseURL: "http://139.9.235.173:12307",
    //本地
    // baseURL:"http://localhost:8327",
    timeout: 10000,
    headers: {}
})