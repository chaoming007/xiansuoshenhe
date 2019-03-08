<template>
    <div class="operate-list">
        <el-tabs v-model="activeName" type="card" @click="handleClick">
            <!-- 按车型设置 start -->
            <el-tab-pane label="按车型设置" name="first">
                <!--查询start-->
                <div class="search-box">
                    <el-form :inline="true">
                        <!--关联车型start-->
                        <el-form-item label="关联车型">
                            <selectModel :masterSource="masterSource" :carSource="carSource" :defaultMasterId="-1" :modelsEnabled="false" @masterChangeEvent="masterChangeEvent" @carChangeEvent="carChangeEvent"></selectModel>
                        </el-form-item>
                        <el-form-item>
                            <el-button icon="el-icon-search" @click="searchEvt">查询</el-button>
                        </el-form-item>
                        <el-form-item class="btn-right">
                            <el-button icon="el-icon-add" type="primary" @click="addEvt">新增</el-button>
                        </el-form-item>
                    </el-form>
                </div>
                <!--查询end-->
                <!--列表start-->
                <div class="table-list">
                    <el-table :data="list" style="width: 100%" border :header-cell-style="{'background-color': '#f6f7fa'}">
                        <el-table-column align="center" prop="cmbname" label="品牌" width="180"></el-table-column>
                        <el-table-column align="center" prop="cmkname" label="子品牌" width="280"></el-table-column>
                        <el-table-column align="center" prop="cmdname" label="车型" width="380"></el-table-column>
                        <el-table-column align="center" label="线索比例">
                            <template slot-scope="scope">
                                {{Math.round(Number(scope.row.percent*100))+'%'}}
                            </template>
                        </el-table-column>
                        <el-table-column align="center" label="操作" width="200">
                            <template slot-scope="scope">
                                <el-button type="text" size="mini" @click="editEvt(scope.row)">修改</el-button>
                                <el-button type="text" size="mini" @click="deleteEvt(scope.row.id)">删除</el-button>
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
                <!-- 新增弹框 start -->
                <el-dialog
                    title="新增品牌线索"
                    :visible.sync="isAdd"
                    width="650px"
                    center
                    class="clue-addbox"
                    :before-close="addFormClose">
                    <el-form :model="addFormData" :rules="rulesAdd" ref="addFormData" label-width="100px">
                        <el-form-item label="关联车型" prop="cmdid">
                            <selectModel ref="addFormDataSelectModel" :masterSource="masterSource" :carSource="carSource" :defaultMasterId="addFormData.cmbid" :defaultCarId="addFormData.cmkid" :modelsEnabled="false" :defaultModelsId="addFormData.cmdid" @masterChangeEvent="addFormMasterChangeEvent" @carChangeEvent="addFormCarChangeEvent"></selectModel>
                            <input type="hidden" v-model="addFormData.cmdid"/>
                        </el-form-item>
                        <el-form-item label="线索比例" prop="percent">
                            <el-input v-model="addFormData.percent" placeholder="请输入百分比数值" class="clue-inpt"></el-input> %
                        </el-form-item>
                    </el-form>
                    <div slot="footer" class="dialog-footer">
                        <el-button @click="addFormClose">取 消</el-button>
                        <el-button type="primary" @click="submitFormAdd('addFormData')">保 存</el-button>
                    </div>
                </el-dialog>
                <!-- 新增弹框 end -->
                <!-- 修改弹框 start -->
                <el-dialog
                    title="编辑品牌线索"
                    :visible.sync="isEdit"
                    width="500px"
                    center
                    class="clue-editbox">
                    <el-form :model="editFormData" :rules="rulesEdit" ref="editFormData" label-width="100px">
                        <el-form-item label="线索比例" prop="percent">
                            <el-input v-model="editFormData.percent" placeholder="请输入百分比数值" class="clue-inpt"></el-input> %
                        </el-form-item>
                    </el-form>
                    <div slot="footer" class="dialog-footer">
                        <el-button @click="isEdit = false">取 消</el-button>
                        <el-button type="primary" @click="submitFormEdit('editFormData')">保 存</el-button>
                    </div>
                </el-dialog>
                <!-- 修改弹框 end -->
            </el-tab-pane>
            <!-- 按车型设置 end -->
            <!-- 全局设置 start -->
            <el-tab-pane label="全局设置" name="second">
                <div class="global-box">
                    <p>
                        当前全局线索分配比例: <span class="percent">{{Math.round(Number(globalList.percent*100))+'%'}}</span>
                        <el-button type="primary" class="btn-global" size="mini" @click="editGlobalEvt()">修改</el-button>
                    </p>
                </div>
                <!-- 修改弹框 start -->
                <el-dialog
                    title="编辑品牌线索"
                    :visible.sync="isEditGlobal"
                    width="500px"
                    center
                    class="clue-editbox">
                    <el-form :model="editGlobalForm" :rules="rulesEditGlobal" ref="editGlobalForm" label-width="100px">
                        <el-form-item label="线索比例" prop="percent">
                            <el-input v-model="editGlobalForm.percent" placeholder="请输入百分比数值" class="clue-inpt"></el-input> %
                        </el-form-item>
                    </el-form>
                    <div slot="footer" class="dialog-footer">
                        <el-button @click="isEditGlobal = false">取 消</el-button>
                        <el-button type="primary" @click="submitFormEditGobal('editGlobalForm')">保 存</el-button>
                    </div>
                </el-dialog>
                <!-- 修改弹框 end -->
            </el-tab-pane>
            <!-- 全局设置 end -->
        </el-tabs>
    </div>
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
            },
            isAdd: false,  //是否显示新增弹框
            isEdit: false,  //是否显示修改弹框
            isEditGlobal: false,  //是否显示全局设置修改弹框
            //新增弹框表单
            addFormData: {
                cmbid: -1,     //品牌id
                cmkid: -1,     //车型id
                cmdid: -1,     //车款id
                cmbname: '',   //品牌名称
                cmkname: '',   //车型名称
                cmdname: '',   //车款名称
                percent: '',   //线索百分比
                type: 2        //贷款运营审核需要传2
            },
            //修改弹框表单
            editFormData: {
                id: '',    //线索id
                cmbid: -1,     //品牌id
                cmkid: -1,     //车型id
                cmdid: -1,     //车款id
                cmbname: '',   //品牌名称
                cmkname: '',   //车型名称
                cmdname: '',   //车款名称
                percent: '',   //线索百分比
                type: 2        //贷款运营审核需要传2
            },
            //修改全局设置表单
            editGlobalForm: {
                percent: '',   //线索百分比
                type: 2    //贷款运营审核需要传2
            },
            rulesAdd: {
                cmdid: [{ validator: this.selectValidator, trigger: 'blur'}],
                percent: [{required: true, message: '请输入百分比数值', trigger: 'blur'}]
            },
            rulesEdit: {
                percent: [{required: true, message: '请输入百分比数值', trigger: 'blur'}]
            },
            rulesEditGlobal: {
                percent: [{required: true, message: '请输入百分比数值', trigger: 'blur'}]
            },
            globalList: [],   //全局设置百分比数据
            activeName: 'first',   //tab切换默认显示第一项
            //列表无数据的情况，数据小于20条，无分页
            paginationShow:false,
            listUrl: '/clueapi/limit_percent/query_limit_percent_list',    //审核列表接口地址  
            globalListUrl: '/clueapi/limit_percent/query_defult_limit_percent',   //全局设置接口地址
            addSaveUrl: '/clueapi/limit_percent/save_limit_percent',   //新增保存接口地址
            editSaveUrl: '/clueapi/limit_percent/update_limit_percent_byid',   //编辑保存接口地址
            editGlobalSaveUrl: '/clueapi/limit_percent/save_defult_limit_percent',  //编辑全局设置保存接口地址
            deleteUrl: '/clueapi/limit_percent/delete_limit_percent_byid',   //删除接口地址
            
        }
    },
    created() {
        this.getList();    //获取列表
        this.getGlobalList();  //获取全局设置列表
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
                data: this.setListParmas()
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
        setListParmas(){
            let data = {};
            data.pageSize = this.pagination.pageSize;
            data.currentPage = this.pagination.currentPage;
            data.cmbid = this.searchBar.cmbid;   //品牌id
            data.cmkid = this.searchBar.cmkid;   //车型id
            data.cmdid = this.searchBar.cmdid;   //车款id
            data.type = 2;     //贷款运营审核需要传2
            return data;
        },
        //获取全局设置百分比
        getGlobalList(){
            this.api({
                url: this.globalListUrl,
                method: 'post',
                data: {
                    type: 2    //贷款运营审核需要传2
                }
            }).then((data) =>{
                this.globalList = data;
            })
        },
        //*************************保存方法****************************
        //新增保存
        submitFormAdd(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid && this.percentValidator(this.addFormData.percent)) {
                    let parmas = {...this.addFormData};
                    parmas.percent = Number(this.addFormData.percent/100)
                    this.api({
                        url: this.addSaveUrl,
                        method: 'post',
                        data: parmas
                    }).then((res)=>{
                        if(!res){
                            this.isAdd = false;
                            this.getList();
                            this.$refs.addFormDataSelectModel.clearSelectFn()
                            console.log("添加成功")
                        }else{
                            this.$message({
                                message: res.message,
                                type: 'error'
                            })
                        }
                    })
                } else {
                    return false;
                }
            })
        },
        
        //编辑保存
        submitFormEdit(formName){
            this.$refs[formName].validate((valid) => {
                if (valid && this.percentValidator(this.editFormData.percent)) {
                    let parmas = {...this.editFormData};
                    parmas.percent = Number(this.editFormData.percent/100)
                    this.api({
                        url: this.editSaveUrl,
                        method: 'post',
                        data: parmas
                    }).then((data)=>{
                        this.isEdit = false;
                        this.getList();
                        console.log("修改成功")
                    })
                } else {
                    return false;
                }
            })
        },

        //编辑全局设置保存
        submitFormEditGobal(formName){
            this.$refs[formName].validate((valid) => {
                if (valid && this.percentValidator(this.editGlobalForm.percent)) {
                    let parmas = {...this.editGlobalForm};
                    parmas.percent = Number(this.editGlobalForm.percent/100)
                    this.api({
                        url: this.editGlobalSaveUrl,
                        method: 'post',
                        data: parmas
                    }).then((data)=>{
                        this.isEditGlobal = false;
                        this.getGlobalList();
                    })
                } else {
                    return false;
                }
            })
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
        },
        //*********************事件方法******************
        //关闭事件
        addFormClose(){
            this.$refs.addFormDataSelectModel.clearSelectFn()
            this.isAdd = false;
        },
        //新增事件
       async addEvt(){
            this.isAdd = true;
            await this.$nextTick();
            this.resetForm('addFormData');
        },
        //修改事件
        editEvt(row){
            this.isEdit = true;
            this.editFormData.id = row.id;
            this.editFormData.cmbname = row.cmbname;
            this.editFormData.cmbid = row.cmbid;
            this.editFormData.cmkname = row.cmkname;
            this.editFormData.cmkid = row.cmkid;
            this.editFormData.cmdname = row.cmdname;
            this.editFormData.cmdid = row.cmdid;
            this.editFormData.percent = Number(row.percent*100);
        },
        //新增表单品牌
        addFormMasterChangeEvent({ master }){
            this.addFormData.cmbid = master.id
            this.addFormData.cmkid = -1
            this.addFormData.cmdid = -1
        },
        //新增表单车型
        addFormCarChangeEvent({ master, car }){
            this.addFormData.cmbid = master.id   //品牌id
            this.addFormData.cmbname = master.name
            this.addFormData.cmkid = car.brandId    //子品牌id
            this.addFormData.cmkname = car.brandName
            this.addFormData.cmdid = car.id     //车系id
            this.addFormData.cmdname = car.name
            this.$refs['addFormData'].validateField('cmdid')
        },
        //删除事件
        deleteEvt(id){
            this.$confirm("确定删除此线索吗?", "提示", {
                confirmButtonText: "确定",
                showCancelButton: true,
                type: "warning"
            }).then(() => {
                this.api({
                    url: this.deleteUrl,
                    method: "post",
                    data: {
                        id: id,   //项目id
                        type: 2   //贷款运营审核需要传2
                    }
                }).then(() => {
                    this.getList();
                });
            }).catch(() => {});
        },
        //线索比例全局修改事件
        editGlobalEvt(){
            this.isEditGlobal = true;
            this.editGlobalForm.percent = Number(this.globalList.percent*100);
        },
        //***************************查询***************** */
        //查询事件
        searchEvt(){
            this.pagination.currentPage = 1;
            this.getList();
        },
        //品牌选择事件
        masterChangeEvent({ master }){
            this.searchBar.cmbid = master.id
            this.searchBar.cmkid = -1
            this.searchBar.cmdid = -1
        },
        //车型选择事件
        carChangeEvent({master, car}){
            this.searchBar.cmbid = master.id   //品牌id
            this.searchBar.cmkid = car.brandId    //子品牌id
            this.searchBar.cmdid = car.id     //车系id
        },
        //校验
        checkContents(content,des) {
            if(!content) {
                this.$message.error(des);
                return true;
            }
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
        handleClick(tab,event){

        },
        //自定义验证下拉框
        selectValidator(rule, value, callback) {
            // 如果等于空或等于-1 那么就是没选
            if (value === '') {
                value = -1
            } else if (typeof value === 'string') {
                value = Number(value)
            }

            if (value === -1) {
                callback(new Error("请选择关联车型"))
                return
            }
            // 否则成功回调
            callback()
        },
        //百分比验证规则，只能输入0-100之间的整数
        percentValidator(value){
            var regex = /(^[1-9][0-9]$|^[0-9]$|^100$)/
            if(regex.test(value)){
                return true;
            }else{
                this.$message({
                    message:'请输入正确的百分比数值',
                    type: 'error'
                })
                return false;
            }
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
.btn-right{
    float: right;
    margin-right: 0;
}
.clue-addbox {
    .clue-inpt{
        width: 194px;
    }
}
.clue-editbox{
    .clue-inpt{
        width: 274px;
    }
}
.global-box {
    padding: 50px;
    .percent{
        color: #ff0000;
        padding-left: 10px;
    }
    .btn-global{
        margin-left: 20px;
    }
}
</style>
