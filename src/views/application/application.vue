<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="listQuery.applicationName" placeholder="应用名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" v-if="hasPerm('application:list')" @click="getList">查询</el-button>
        </el-form-item>
        <el-form-item style="float:right;margin-right:90px;">
          <el-button type="primary" icon="plus" @click="showCreate" v-if="hasPerm('application:add')">添加
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row>
      <el-table-column align="center" label="序号" width="80">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="applicationCode" label="应用码" style="width: 60px;"></el-table-column>
      <el-table-column align="center" prop="applicationName" label="应用名称" style="width: 60px;"></el-table-column>
      <el-table-column align="center" prop="applicationSchema" label="Schema" style="width: 60px;"></el-table-column>
      <el-table-column align="center" prop="description" label="应用描述" style="width: 60px;"></el-table-column>
      <el-table-column align="center" prop="createTime" label="时间" style="width: 60px;"></el-table-column>
      <el-table-column align="center" prop="operatorName" label="操作人" style="width: 60px;"></el-table-column>
      <el-table-column align="center" label="操作" width="200" v-if="hasPerm('application:update') || hasPerm('application:delete')">
        <template slot-scope="scope">
          <el-button type="primary" icon="edit" v-if="hasPerm('application:update')" @click="showUpdate(scope.$index)">修改</el-button>
          <el-button type="danger" icon="delete" v-if="hasPerm('application:delete')" @click="removeApplication(scope.$index)">删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination 
        @size-change="handleSizeChange" 
        @current-change="handleCurrentChange" 
        :current-page="listQuery.pageNo" 
        :page-size="listQuery.pageSize" 
        :total="totalCount" :page-sizes="[10, 20, 50, 100]" 
        layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form class="small-space" :model="tempApplication" label-position="right" label-width="120px"
        ref="tempApplication" style='width: 500px; margin-left:50px;'>
        <el-form-item label="应用码" required>
          <el-tooltip content="应用码不可重复且保存后无法修改，保存前请确认" placement="top-end" effect="light" :disabled="this.tempApplication.id != ''">
            <el-input type="text" v-model="tempApplication.applicationCode" :disabled="this.tempApplication.id != ''"></el-input>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="应用名称" required>
          <el-input type="text" v-model="tempApplication.applicationName">
          </el-input>
        </el-form-item>
        <el-form-item label="Schema" required>
          <el-input type="text" v-model="tempApplication.applicationSchema">
          </el-input>
        </el-form-item>
        <el-form-item label="应用描述" required>
          <el-input type="text" v-model="tempApplication.description">
          </el-input>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveApplication()">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {getToken,removeToken} from '@/utils/auth'
export default {
    data() {
        return {
            totalCount: 0, //分页组件--数据总条数
            list: [], //表格的数据
            listLoading: false, //数据加载等待动画
            listQuery: {
                pageNo: 1, //页码
                pageSize: 20, //每页条数
                applicationName: ""
            },
            dialogStatus: "create",
            dialogFormVisible: false,
            textMap: {
                update: "编辑应用",
                create: "新增应用"
            },
            headers:{'Authorization': "Bearer "+getToken()},
            fileList: [],
            tempApplication: {
                id: "",
                applicationCode: "",
                applicationName: "",
                applicationSchema: "",
                description: ""
            }
        };
    },
    created() {
        this.getList();
    },
    methods: {
        filePreview() {},
        fileRemove() {},
        getList() {
            
            //查询列表
            if (!this.hasPerm("application:list")) {
                return;
            }
            this.listLoading = true;
           
            this.api({
                url: "/application_manage/find",
                method: "get",
                params: this.listQuery
            }).then(data => {
                this.listLoading = false;
                this.list = data.list;
                this.totalCount = data.total;
            });
        },
        handleSizeChange(val) {
            //改变每页数量
            this.listQuery.pageSize = val;
            this.handleFilter();
        },
        handleFilter() {
            //查询事件
            this.listQuery.pageNo = 1
            this.getList()
        },
        handleCurrentChange(val) {
            //改变页码
            this.listQuery.pageNo = val;
            this.getList();
        },
        getIndex($index) {
            //表格序号
            return (
                (this.listQuery.pageNo - 1) * this.listQuery.pageSize +
                $index +
                1
            );
        },
        showCreate() {
            //显示新增对话框，清空表单
            this.tempApplication.id = "",
            this.tempApplication.applicationCode = "",
            this.tempApplication.applicationName = "",
            this.tempApplication.applicationSchema = "",
            this.tempApplication.description = "",
            this.dialogStatus = "create";
            this.dialogFormVisible = true;

        },
        showUpdate($index) {   
            let application = this.list[$index];
            this.tempApplication.id = application.id;
            this.tempApplication.applicationCode = application.applicationCode;
            this.tempApplication.applicationName = application.applicationName;
            this.tempApplication.applicationSchema = application.applicationSchema;
            this.tempApplication.description = application.description;
            this.dialogStatus = "update";
            this.dialogFormVisible = true;
        },

        //保存
        saveApplication() {
            //校验内容是否为空
            if(this.checkContents(this.tempApplication.applicationCode,"请输入应用码!!!")) {
                return ;
            }
            if(this.checkContents(this.tempApplication.applicationName,"请输入应用名称!!!")) {
                return ;
            }
            if(this.checkContents(this.tempApplication.applicationSchema,"请输入应用Schema!!!")) {
                return ;
            }
            if(this.checkContents(this.tempApplication.description,"请输入应用描述!!!")) {
                return;
            }

            let saveUrl = "/application_manage";
            if(this.tempApplication.id == "") {
                saveUrl += "/save";
            } else {
                saveUrl +="/update";
            } 
            this.$refs.tempApplication.validate((valid) => {
                let message = "保存成功";
                if (valid) {
                    this.api({
                        url: saveUrl,
                        method: "post",
                        data: this.tempApplication
                    }).then(() => {
                        this.dialogFormVisible = false;
                        this.$message({
                            message: message,
                            type: "success",
                            duration: 1 * 1000,
                            onClose: () => {
                                this.getList();
                            }   
                        });
                    });
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },

        //校验
        checkContents(content,des) {
            if(!content) {
                this.$message.error(des);
                return true;
            }
        },

        removeApplication($index) {
            let _vue = this;
            this.$confirm("确定要删除该应用吗?", "提示", {
                confirmButtonText: "确定",
                showCancelButton: true,
                type: "warning"
            }).then(() => {
                let application = _vue.list[$index];
                _vue
                    .api({
                        url: "/application_manage/delete/" + application.id + "/" + application.applicationCode ,
                        method: "delete"
                    })
                    .then(() => {
                        _vue.$message({
                            message: "删除成功",
                            type: "success",
                            duration: 1 * 1000,
                        });
                         _vue.getList();
                    });
            });
        }
    }
};
</script>
