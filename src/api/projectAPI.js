import axios from "axios";
axios.defaults.baseURL =  '/api/project';


export function getProjectByPID(pid){
    return axios.get( '/get_project/' + pid)
        .then(res => {
            return res.data
        })
        .catch(function (error) {
            console.log(error);
        });
}
