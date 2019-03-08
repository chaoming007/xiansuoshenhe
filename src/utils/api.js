import axios from 'axios'
import { Message, MessageBox, Loading } from 'element-ui'
import { getToken, removeToken } from '@/utils/auth'
import store from '../store'
import global from '@/utils/global'
// 创建axios实例
const service = axios.create({
    baseURL: process.env.BASE_URL, // api的base_url
    // timeout: 15000,                  // 请求超时时间2
    // headers: {
    //     'Authorization':"Bearer "+'getToken()',
    // },
});
// request拦截器
service.interceptors.request.use(config => {
        config.headers.Authorization ="Bearer "+getToken();
        config.headers.token ="Bearer "+getToken();
        return config
    }, error => {
        // Do something with request error
        console.error(error) // for debug
        Promise.reject(error)
    })
    // respone拦截器
service.interceptors.response.use(
    response => {
        const res = response.data;
        // console.log(res);
        if (res && res.status == undefined) {
            return res;
        }
        if (res.status == '1000') {
            return res;
        }
        if (res.status == '10001') {
            return res;
        }
        if (res.status == '10018') {
            return res;
        }
        if (res.status == '10111') {
            return res;
        }
        // console.log(res.status);
        if (res.status == global.SUCCESS_CODE || res.status == global.GET_INFO_SUCCESS) {
            return res.data;
        } else if (res.status == "20011" || res.status == "10002") {
            Message({
                showClose: true,
                message: res.message,
                type: 'error',
                duration: 500,
                onClose: () => {
                    store.dispatch('FedLogOut').then(() => {
                        location.reload() // 为了重新实例化vue-router对象 避免bug
                    })
                }
            });
            return Promise.reject("未登录")

        } else {
            Message({
                message: res.message,
                type: 'error',
                duration: 3 * 1000
            })
            return Promise.reject(res)
        }
    },
    error => {
        console.error('err' + error) // for debug
        Message({
            message: error.message,
            type: 'error',
            duration: 3 * 1000
        })
        const status = error.response.status;
        if (status == 403) {
            return new Promise(resolve => {
                removeToken()
                resolve()
            })
        }
        return Promise.reject(error)
    }
)
export default service