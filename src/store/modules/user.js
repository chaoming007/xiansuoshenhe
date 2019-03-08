import { getInfo, login, logout } from '@/api/login'
import { getToken, removeToken, setToken } from '@/utils/auth'
import { default as api } from '../../utils/api'
import store from '../../store'
import router from '../../router'
import { delStorage } from '../../utils/localStorage'
import { Message, MessageBox } from 'element-ui'

const user = {
    state: {
        nickname: "",
        userId: "",
        avatar: 'http://img2.baa.bitautotech.com/newavatar/2018/12/07/29815843_120_4c148c7a-5d4c-46e8-9288-1d50f849041e.jpg',
        role: '',
        permissionLevel: '',
        menus: [],
        permissions: [],
        userInfo:{}
    },
    mutations: {
        SET_USER: (state, userInfo) => {
            state.nickname = userInfo.nickname;
            state.userId = userInfo.userId;
            state.role = userInfo.roleName;
            state.permissionLevel = userInfo.permissionLevel;
            state.menus = userInfo.menuList;
            state.permissions = userInfo.permissionList;
        },
        RESET_USER: (state) => {
            state.nickname = "";
            state.userId = "";
            state.role = '';
            state.menus = [];
            state.permissions = [];
        },
        GET_USER_INFO:(state,dat)=>{
            state.userInfo=dat;
        }
    },
    actions: {
        // 登录
        Login({ commit, state }, loginForm) {
            return new Promise((resolve, reject) => {
                //console.log(loginForm)
                api({
                    url:"http://172.20.4.12:9002/ssoapi/v1/auth/login",
                    method:"post",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    data:loginForm
                }).then(data => {
                    setToken(data.jwt);
                    console.log(data,"登录成功")
                    // if (data.data.message === "success") {
                    //     console.log(data,"登录")
                    //     //cookie中保存前端登录状态
                    //     setToken(data.token);
                    // }
                    resolve(data);
                }).catch(err => {
                    reject(err)
                })
            })
        },
        // 获取用户信息
        GetInfo({ commit, state }) {
            let data = { "status": "20002", "message": "获取用户信息请求成功", data: { "userPermission": { "id": 0, "userId": 2, "username": null, "password": null, "nickname": "普通管理员", "permissionLevel": "1", "roleId": 2, "roleName": "普通管理员", "createTime": null, "updateTime": null, "lastLoginTime": null, "deleted": null, "permissions": null, "menuList": ["businessThread", "role", "templateManage", "index", "orderList", "menu", "dataView", "version", "patch", "operate", "operationlog", "application", "material", "user", "productList"], "permissionList": ["dataView:update", "operationlog:list", "material:update", "orderList:add", "orderList:list", "role:add", "menu:update", "templateManage:list", "material:add", "templateManage:update", "menu:delete", "patch:publish", "user:update", "menu:list", "index:add", "orderList:update", "patch:add", "patch:delete", "templateManage:add", "productList:add", "businessThread:add", "index:list", "operate:list", "operate:update", "version:publish", "application:delete", "operate:add", "businessThread:list", "dataView:add", "user:list", "role:update", "operate:delete", "version:update", "version:list", "role:list", "role:delete", "dataView:list", "productList:update", "material:list", "application:add", "version:delete", "patch:list", "menu:add", "businessThread:update", "application:list", "application:update", "version:add", "patch:update", "index:update", "productList:list"], "operatorId": null, "enabled": true, "authorities": null, "accountNonExpired": true, "accountNonLocked": true, "credentialsNonExpired": true } } };
            return new Promise((resolve, reject) => {
                // api({
                //     url: '/auth/get_info',
                //     method: 'post'
                // }).then(data => {
                //     console.log(data,"获取信息--------")
                    //储存用户信息
                    commit('SET_USER', data.data.userPermission);
                    //cookie保存登录状态,仅靠vuex保存的话,页面刷新就会丢失登录状态
                    //setToken();
                    //生成路由
                    let userPermission = data.data.userPermission;
                    // if (!userPermission.menuList || userPermission.menuList.length == 0) {
                    //     Message({
                    //         showClose: true,
                    //         message: "该账号没有任何权限!",
                    //         type: 'error',
                    //         duration: 2000,
                    //         onClose: () => {
                    //             store.dispatch('FedLogOut').then(() => {
                    //                 location.reload() // 为了重新实例化vue-router对象 避免bug
                    //             })
                    //         }
                    //     });
                    //     return;
                    // }
                    store.dispatch('GenerateRoutes', userPermission).then(() => {
                        //生成该用户的新路由json操作完毕之后,调用vue-router的动态新增路由方法,将新路由添加
                        router.addRoutes(store.getters.addRouters)
                    })
                    resolve(data)
                // }).catch(error => {
                //     reject(error)
                // })
            })
        },
        // 登出
        // LogOut({ commit }) {
        //     return new Promise((resolve) => {
        //         api({
        //             url: "http://mapiconfig.yiche.com/auth/logout",
        //             method: "post"
        //         }).then(data => {
        //             commit('RESET_USER')
        //             removeToken()
        //             delStorage()
        //             resolve(data);
        //         }).catch(() => {
        //             commit('RESET_USER')
        //             removeToken()
        //         })
        //     })
        // },
        // 获得登录用户信息
        getUserInfo({commit},dat){
            commit('GET_USER_INFO',dat)
        },
        
        // 前端 登出
        FedLogOut({ commit }) {
            //console.log(111)
            // return new Promise(resolve => {
            //     commit('RESET_USER')
            //     removeToken()
            //     resolve()
            // })
        }
    }
}
export default user