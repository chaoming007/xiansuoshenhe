<template>
    <div class="operate-list">
        <!--查询start-->
        <div class="search-box">
            <el-form :inline="true">
                <!--关联车型start-->
                <el-form-item label="关联车型">
                    <selectModel :masterSource="masterSource" :carSource="carSource" :defaultMasterId="-1" :modelsEnabled="false" @masterChangeEvent="masterChangeEvent" @carChangeEvent="carChangeEvent"></selectModel>
                </el-form-item>
                <!--创建时间start-->
                <el-form-item label="创建时间">
                    <el-date-picker
                        v-model="searchBar.createtime"
                        type="datetimerange"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期">
                    </el-date-picker>
                </el-form-item>
                <!--项目状态start-->
                <el-form-item label="项目状态">
                    <el-select v-model="searchBar.status" placeholder="请选择" clearable @clear="clearSelectEvt">
                        <el-option 
                            v-for="item in statusList" 
                            :key="item.value" 
                            :label="item.label" 
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button icon="el-icon-search" @click="searchEvt">查询</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table-list">
            <el-table :data="list" style="width: 100%" border :header-cell-style="{'background-color': '#f6f7fa'}">
                <el-table-column align="center" prop="crid" label="项目ID" width="180"></el-table-column>
                <el-table-column align="center" label="投放时段" width="300">
                    <template slot-scope="scope">
                        {{scope.row.begintime}}~{{scope.row.endtime}}
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="totalCount" label="线索上限"></el-table-column>
                <el-table-column align="center" label="项目状态" width="180" :formatter="formatProjectStatus"></el-table-column>
                <el-table-column align="center" prop="createtime" label="创建时间" width="180"></el-table-column>
                <el-table-column align="center" prop="updatetime" label="审核时间" width="180"></el-table-column>
                <el-table-column align="center" label="操作" width="220" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="primary" plain size="mini" @click="viewProject(scope.row)">查看</el-button>
                        <!--当状态是投放中时status=4,显示暂停按钮-->
                        <el-button 
                            v-show="scope.row.status===4"
                            type="danger" 
                            plain
                            size="mini" 
                            @click="changeSwitch(scope.row.crid,scope.row.status)">
                            暂停
                        </el-button>
                        <el-button 
                            v-show="scope.row.status===6"
                            type="primary" 
                            plain
                            size="mini" 
                            @click="changeSwitch(scope.row.crid,scope.row.status)">
                            恢复
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!--列表end-->
        <!-- 分页 begin -->
        <div class="page">
            <el-pagination 
                v-show="paginationShow"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pagination.currentPage"
                :page-sizes="[10, 20, 30, 50, 100]"
                :page-size="pagination.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </div>
        <!-- 分页 end -->
    </div>
    <!-- <div class=""></div> -->
</template>
<script>
import {getToken,removeToken} from '@/utils/auth'
import {awaitWarp,getData} from '@/utils/index'
import selectModel from '@/components/selectModels'
export default {
    data() {
        return {
            list: [],       //列表  
            // 分页
            total: 0, //总记录数
            pagination: {
                pageSize: 20,  //每页显示条数
                currentPage: 1  //当前页数
            },
            /* 查询初始化 */
            searchBar: {
                cmbid: -1,     //品牌id
                cmkid: -1,     //车型id
                cmdid: -1,     //车款id
                createtime: '',   //创建时间
                status: this.$route.query.currentStatus?Number(this.$route.query.currentStatus):0 //项目状态 0全部 1待审 2拒审 3未开始 4投放中 5已结束 6已暂停
            },
            disabled: true,
            statusList: [{      //项目状态下拉数据
                value: 0,
                label: '全部'
            },{
                value: 1,
                label: '待审'
            },{
                value: 2,
                label: '拒审'
            },{
                value: 3,
                label: '未开始'
            },{
                value: 4,
                label: '投放中'
            },{
                value: 5,
                label: '已结束'
            },{
                value: 6,
                label: '已暂停'
            }], 
            searchStatus:this.$route.query.currentStatus || "",  //查询项目状态，单独定义查询状态，用于切换路由传值
            //列表无数据的情况，数据小于20条，无分页
            paginationShow:false,
            listUrl: '/clueapi/requirement/get_clue_requirement_list',    //审核列表接口地址  
            checkUrl: '/clueapi/requirement/approval_clue_requirement',   //审核接口地址   
        }
    },
    created() {
        this.getList();    //获取列表
    },
    components:{
        selectModel
    },
    methods: {
        getList() {
            this.api({
                url: this.listUrl,
                method: 'post',
                // headers: {
                //     'Content-Type': 'application/json',
                //     'Authorization': "Bearer " + getToken()
                // },
                data: this.setListDat()
            }).then((data) =>{
                this.total = data.total;
                this.list = [...data.records];
                this.paginationShow = true;
                //判断如果没有数据，并且数据条数小于20条的情况下，不显示分页
                if(data.total===0 || data.total <= this.pagination.pageSize){
                    this.paginationShow = false;
                }
            })
        },
        //设置项目列表请求数据
        setListDat(){
            let data = {};
            data.pageSize = this.pagination.pageSize;
            data.currentPage = this.pagination.currentPage;
            if(this.searchBar.createtime){
                data.startTime = this.timFormateFun(this.searchBar.createtime[0]);
                data.endTime = this.timFormateFun(this.searchBar.createtime[1]);
            }
            data.status = this.searchBar.status;
            data.cmbid = this.searchBar.cmbid;   //品牌id
            data.cmkid = this.searchBar.cmkid;   //车型id
            data.cmdid = this.searchBar.cmdid;   //车款id
            data.type = 2;    //贷款运营审核需要传2
            return data;
        },
        clearSelectEvt(){
            this.searchStatus = ""
        },
        searchEvt(){
            this.pagination.currentPage = 1
            this.searchStatus=this.searchBar.status
            this.getList();
        },
        //品牌选择事件
        masterChangeEvent({ master }){
            this.searchBar.cmbid = master.id
            this.searchBar.cmkid = -1
            this.searchBar.cmdid = -1
        },
        //车型选择事件
        carChangeEvent({master, car }){
            this.searchBar.cmbid = master.id   //品牌id
            this.searchBar.cmkid = car.brandId    //子品牌id
            this.searchBar.cmdid = car.id     //车系id
        },  
        //恢复暂停开关
        changeSwitch(id,status){
            var msg=status==4?"暂停":"恢复";
            this.$confirm('确认要'+msg+'当前项目吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                this.api({
                    url: this.checkUrl,
                    method:"post",
                    data:{
                        crid: id,  //项目id
                        status: status===4?3:4,  //项目状态，如果当前操作是暂停，那就传3，如果当前操作是恢复，那就传4
                        type: 2     //贷款线索审核传2
                    }
                }).then((data)=>{ 
                    this.$message({
                        message: msg+'成功！',
                        type: 'success'
                    });
                    this.getList();
                })
            }).catch(() => {}); 
        },  
         //格式化项目状态
        formatProjectStatus(row, column) {
            let projectStatusName = ""
            switch (row.status) {
                case 1:
                    projectStatusName = "待审"
                    break;
                case 2:
                    projectStatusName = "拒审"
                    break;
                case 3:
                    projectStatusName = "未开始"
                    break;
                case 4:
                    projectStatusName = "投放中"
                    break;
                case 5:
                    projectStatusName = "已结束"
                    break;
                default:
                    projectStatusName = "已暂停"
                    break;
            }
            return projectStatusName
        },
        //日期处理函数
        timFormateFun(dat){      
            return new Date(dat).getFullYear()+"-"+this.addZeroFun((new Date(dat).getMonth()+1))+"-"+this.addZeroFun(new Date(dat).getDate())+" "+this.addZeroFun(new Date(dat).getHours())+":"+this.addZeroFun(new Date(dat).getMinutes())+":"+this.addZeroFun(new Date(dat).getSeconds())
        },
        addZeroFun(num){
            return num<10?"0"+num:num
        },
        //查看
        viewProject(row){
            this.$router.push({
                path: '/clueLoanManage/clueLoanDetail',
                query: {
                    crid: row.crid,     //项目id
                    status: row.status,   //项目状态
                    searchStatus:this.searchStatus
                }
            })
        },
        handleSizeChange(val) {
            //改变每页数量
            this.pagination.pageSize = val;
            this.getList();
        },
        handleCurrentChange(val) {
            //改变页码
            this.pagination.currentPage = val;
            this.getList();
        },
        masterSource: async function(){
            let { data } =  await awaitWarp(getData({ url:'http://api.car.bitauto.com/CarInfo/GetCarDataJson.ashx',params:{ datatype:1,action:'master'}}))
            let arr = []
            for(let rootItem in data.MsterList){
                for(let item of data.MsterList[rootItem]){
                    arr.push({ masterId: item.MasterId,name:item.MasterName,initial:rootItem })
                }
            }
            return arr
        },
        carSource:async function(masterId){
            let { data } =  await awaitWarp(getData({ url:'http://api.car.bitauto.com/CarInfo/GetCarDataJson.ashx',params:{ pid:masterId,datatype:1,action:'serial'}}))
            let arr = []
            for(let rootItem in data){
                let arrChild = []
                for(let item of data[rootItem].Child){
                    arrChild.push({ serialId:item.SerialId, serialName:item.SerialName, saleStatus:item.CsSaleState == "在销" ? 1: 0, brandId:data[rootItem].BrandId, brandName:data[rootItem].BrandName,  })
                }
                arr.push({ brandId:data[rootItem].BrandId, brandName:data[rootItem].BrandName, serialList: arrChild })
            }
            return arr
        }

       
    }
}
</script>
<style lang="scss" scoped>
.operate-list{
    padding: 20px;
}
.page{
    padding: 20px 0;
}
.brand-series{
    margin-left: 10px;
}

</style>
