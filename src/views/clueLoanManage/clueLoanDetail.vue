<template>
    <div class="operate-box">
        <div class="op-header">
            <el-button type="text" @click="backPageFun"><em class="el-icon-d-arrow-left"></em> 返回上一级</el-button>
            <el-tag class="tag-status">{{projectStatusName}}</el-tag>
        </div>
        <div class="op-cont">
            <!--项目ID start-->
            <div class="item-public">
                <div class="item">
                    <div class="itemName">项目ID：</div>
                    <div class="itemValue">{{detailsCont.crid}}</div>
                </div>
                <div class="item">
                    <div class="itemName">投放时段：</div>
                    <div class="itemValue">{{detailsCont.begintime}}~{{detailsCont.endtime}}</div>
                </div>
                <div class="item" v-for="(item,index) in detailsCont.properties" :key="index">
                    <div class="itemName">{{item.title}}：</div>
                    <div class="itemValue">{{item.content}}</div>
                </div>
            </div>
            <!--项目ID end-->
            <div class="clue-box">
                <el-table :data="clueList" border>
                    <el-table-column align="center" prop="totalCount" label="总量"></el-table-column>
                    <el-table-column align="center" prop="enablecount" label="有效数"></el-table-column>
                    <el-table-column align="center" prop="disablecount" label="无效数"></el-table-column>
                    <el-table-column align="center" prop="repeatcount" label="重复数"></el-table-column>
                    <el-table-column align="center" prop="overflowcount" label="溢出数"></el-table-column>
                </el-table>
            </div>
            <!--循环列表 start-->
            <div class="item-loop">
                <ul>
                    <li v-for="(item,index) in detailsCont.details" :key="index">
                        <h2 class="item-h2">需求{{index+1}}：</h2>
                        <div class="item">
                            <div class="itemName">关联车型：</div>
                            <div class="itemValue">
                                <span v-for="(itemCar,indexCar) in item.carinfo" :key="indexCar">{{itemCar}}<em v-if="indexCar<item.carinfo.length-1">、</em></span>
                            </div>
                        </div>
                        <div class="item">
                            <div class="itemName">投放城市：</div>
                            <div class="itemValue">
                                <p v-for="(itemCity,indexCity) in item.cityinfo" :key="indexCity">
                                    <span class="item-province">{{indexCity}}</span>-
                                    <span v-for="(itm,idx) in itemCity" :key="idx">{{itm}}<em v-if="idx<itemCity.length-1">、</em></span>
                                </p>
                            </div>
                        </div>
                        <div class="item">
                            <div class="itemName">线索上限：</div>
                            <div class="itemValue">{{item.limit}}</div>
                        </div>
                    </li>
                </ul>
            </div>
            <!--循环列表 end-->
            <div class="btn-box" v-if="status==1">
                <el-button type="primary" class="btn" @click="handlePass">通过审核</el-button>
                <el-button class="btn" @click="handleRefuse">拒审</el-button>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            status: Number(this.$route.query.status),     //项目状态
            clueList: [],  
            userData:"",          //用户信息数据
            detailsCont: {},  
            detailUrl: '/clueapi/requirement/get_clue_requirement_detail',    //项目详情接口地址
            checkUrl: '/clueapi/requirement/approval_clue_requirement',   //审核接口地址  
            checkYichehUrl: 'http://172.20.4.14:8769/app_third/api/v1/loan/requirement_audit'   //审核之后易车惠接口
        }
    },
    created(){
        this.formatProjectStatus();
        this.getDetailData1();    //获取项目详情数据
    },
    methods: {
        //返回上一级
        backPageFun() {
            this.$router.push({
                path:'/clueLoanManage/clueLoanList',
                query: {
                    status: this.status,
                    currentStatus:this.$route.query.searchStatus || ""
                }
            })
            // this.$router.history.go(-1)
        },
        //获取详情
        getDetailData1(){
            this.api({
                url: this.detailUrl,
                method: 'post',
                data: {
                    crid: this.$route.query.crid    //项目id
                }
            }).then(data=>{
                this.detailsCont = {...data};
                this.clueList.push({...data})
            })
        },
        //格式化项目状态
        formatProjectStatus() {
            let projectStatusName = ""
            switch (this.status) {
                case 1:
                    this.projectStatusName = "待审"
                    break;
                case 2:
                    this.projectStatusName = "拒审"
                    break;
                case 3:
                    this.projectStatusName = "未开始"
                    break;
                case 4:
                    this.projectStatusName = "投放中"
                    break;
                case 5:
                    this.projectStatusName = "已结束"
                    break;
                case 6:
                    this.projectStatusName = "已暂停"
                    break;
                default:
                    this.projectStatusName = ""
                
            }
            return projectStatusName
        },
        //通过审核
        handlePass() {

            console.log(this.setVerifyParam(),"审批接口入参")
            this.$confirm('是否确认通过审核？', '提示',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.api({
                    url: this.checkUrl,
                    method: 'post',
                    data: {
                        crid: this.$route.query.crid,
                        status: 1,
                        type: 2     //贷款运营审核需要传2
                    }
                }).then((data) => {
                    this.$message({
                        type: 'success',
                        message: '审核通过!'
                    });
                    //调取易车惠接口，通知易车惠审核状态
                    this.getAppThirdData(1)
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消'
                });
            })
        },
        //拒审
        handleRefuse(){
            console.log(this.setVerifyParam(),"审批接口入参")
            this.$confirm('是否拒绝审核通过？', '提示',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.api({
                    url: this.checkUrl,
                    method: 'post',
                    data: {
                        crid: this.$route.query.crid,
                        status: 2,
                        type: 2     //贷款运营审核需要传2 
                    }
                }).then((data) => {
                    this.$message({
                        type: 'success',
                        message: '拒绝审核!'
                    });
                    //调取易车惠接口，通知易车惠审核状态
                    this.getAppThirdData(2)
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消'
                });
            })
        },
        //设置易车惠接口参数
        setVerifyParam(num){
            let data = {};
            data.cid = "501"
            data.param = {
                crid: this.$route.query.crid,
                status: num,
                operator: JSON.parse(localStorage.getItem('userData')).user.userId
            }
            return data;
        },
        //获取易车惠接口
        getAppThirdData(num){
            this.api({
                url: this.checkYichehUrl,
                method: "post",
                data: this.setVerifyParam(num)
            }).then((data) =>{
                this.$router.push({path:'/clueLoanManage/clueLoanList'})
            })
        }
    }
}
</script>
<style lang="scss" scoped>
.operate-box{
    padding: 20px;
}
.op-header{
    padding-bottom: 20px;
    .tag-status{
        float: right;
    }
}
.op-cont{
    padding-left: 20px;
}
.item-public{
    margin-bottom: 15px;
}
.clue-box{
    margin-bottom: 25px;
}
.item-loop ul li{
    border-bottom:1px solid #f1f1f1;
    margin-bottom: 15px;
}
.item-loop ul li:last-child{
    border-bottom: none;
}
.item-h2{
    font-size: 16px;
    font-weight: normal;
    width: 100px;
    text-align: right;
    padding: 0 0 10px 0;
    margin-top: 0;
}
.item{
    padding-bottom: 20px;
    line-height: 24px;
    overflow: hidden;
    .itemName{
        float: left;
        width: 100px;
        text-align: right;
    }
    .itemValue{
        margin-left: 110px;
        .item-province{
            color: #409EFF;
        }
        p:last-child{
            padding-bottom: 0;
        }
    }
    p{
        margin: 0;
        padding-bottom: 10px;
    }
}
ul,li,ol{
    list-style: none;
}
.item-loop{
    ul{
        margin: 0;
        padding: 0;
    }
}
.btn-box{
    padding-top: 20px;
    text-align: center;
    .btn{
        width: 100px;
    }
}
</style>
