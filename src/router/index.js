import Vue from 'vue'
import Router from 'vue-router'
// in development env not use Lazy Loading,because Lazy Loading too many pages will cause webpack hot update too slow.so only in production use Lazy Loading
/* layout */
import Layout from '../views/layout/Layout'

const _import = require('./_import_' + process.env.NODE_ENV)
console.log(process.env.NODE_ENV);

Vue.use(Router)
export const constantRouterMap = [
    { path: '/login', component: _import('login/index'), hidden: true },
    { path: '/404', component: _import('404'), hidden: true },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        name: '首页',
        hidden: true,
        children: [{
            path: 'dashboard',
            component: _import('dashboard/index')
        }]
    },

]
export default new Router({
    // mode: 'history', //后端支持可开
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRouterMap
})
export const asyncRouterMap = [
    // {
    //     path: '/version',
    //     component: Layout,
    //     redirect: '/version/application',
    //     meta: { title: '应用管理', icon: 'iconfont icon-app' },
    //     children: [{
    //             path: 'application',
    //             name: '应用列表',
    //             component: _import('application/application'),
    //             meta: { title: '应用列表', icon: 'iconfont icon-liebiao' },
    //             menu: 'application'
    //         },
    //         {
    //             path: 'version',
    //             name: '应用发布',
    //             component: _import('application/version'),
    //             meta: { title: '应用发布', icon: 'iconfont icon-yingyongguanli' },
    //             menu: 'version'
    //         }
    //     ]
    // },
    {
        path: '/clueManage',
        component: Layout,
        redirect: '/clueManage/clueList',
        meta: { title: '询价运营审核', icon: 'iconfont icon-quanxianshenpi' },
        children: [{
                path: 'clueList',
                name: '询价列表',
                component: _import('clueManage/clueList'),
                meta: { title: '询价列表', icon: 'iconfont icon-liebiao' },
                // menu: 'clueList'
            },{
                path: 'clueDetail',
                name: '询价详情',
                hidden: true,
                component: _import('clueManage/clueDetail'),
                meta: { title: '询价详情', icon: 'iconfont icon-liebiao' },
                // menu: 'clueDetail'
            },{
                path: 'cluePropSet',
                name: '询价设置',
                hidden: false,
                component: _import('clueManage/cluePropSet'),
                meta: { title: '询价设置', icon: 'iconfont icon-icon_shezhi' },
                // menu: 'cluePropSet'
            }
        ]
    },
    {
        path: '/clueLoanManage',
        component: Layout,
        redirect: '/clueLoanManage/clueLoanList',
        meta: { title: '贷款运营审核', icon: 'iconfont icon-yunyingguanli' },
        children: [{
                path: 'clueLoanList',
                name: '贷款列表',
                component: _import('clueLoanManage/clueLoanList'),
                meta: { title: '贷款列表', icon: 'iconfont icon-liebiao' },
                // menu: 'clueLoanList'
            },{
                path: 'clueLoanDetail',
                name: '贷款详情',
                hidden: true,
                component: _import('clueLoanManage/clueLoanDetail'),
                meta: { title: '贷款详情', icon: 'iconfont icon-liebiao' },
                // menu: 'clueLoanDetail'
            },{
                path: 'clueLoanPropSet',
                name: '贷款设置',
                hidden: false,
                component: _import('clueLoanManage/clueLoanPropSet'),
                meta: { title: '贷款设置', icon: 'iconfont icon-icon_shezhi' },
                // menu: 'clueLoanPropSet'
            }
        ]
    },
    { path: '*', redirect: '/404', hidden: true }
]