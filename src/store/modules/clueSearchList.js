
const clueSearchList = {
    state: {
        searchInfo: {}
    },
    mutations: {
        SET_SEARCH_INFO:(state,dat) => {
            state.searchInfo = dat
        }
    },
    actions: {
        //获取查询信息
        getSearchInfo({commit},dat){
            commit('SET_SEARCH_INFO',dat)
        }
    }
}

export default clueSearchList