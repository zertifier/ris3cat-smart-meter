//TODO: this is not implemented. My recommanation: To manage errors, change requests to angular http requests.

import axios from 'axios';
import swal from 'sweetalert2';

const axiosClient = axios.create({
    baseURL: '', 
});

axiosClient.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response) {
            let errorMsg = '';
            if (error.response.data && error.response.data.msg) {
                swal.fire('Error', error.response.data.msg, 'error');
                errorMsg = error.response.data.msg;
            } else {
                swal.fire('Error', error.response.statusText, 'error');
                errorMsg = error.response.statusText;
            }
            console.log("interceptor error ", errorMsg);
        } else {
            console.log("Network Error", error.message);
            swal.fire('Error', 'Network Error', 'error');
        }
        return Promise.reject(error);
    }
);

export default axiosClient;