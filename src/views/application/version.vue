<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true">
        <el-form-item>
          <el-select v-model="listQuery.platform" placeholder="平台" clearable>
              <el-option v-for="item in platforms" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
            <el-select v-model="listQuery.publishStatus" placeholder="发布状态" clearable>
                <el-option v-for="item in publishStatuses" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
            <el-select v-model="listQuery.applicationCode" placeholder="应用" clearable> 
                <el-option v-for="app in apps" :key="app.code" :label="app.applicationName" :value="app.code"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" v-if="hasPerm('version:list')" @click="getList">查询</el-button>
        </el-form-item>
        <el-form-item style="float:right;margin-right:90px;">
          <el-button type="primary" icon="plus" @click="showCreate" v-if="hasPerm('version:add')">添加
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row>
      <!-- <el-table-column align="center" label="序号" width="80">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column> -->
      <el-table-column align="center" prop="applicationName" label="应用名称" style="width: 60px;"></el-table-column>
      <el-table-column align="center" prop="appVersion" label="版本号" style="width: 60px;"></el-table-column>
      <el-table-column align="center" prop="updateContents" label="更新日志" style="width: 60px;"></el-table-column>
      <el-table-column align="center" prop="platform" label="平台" style="width: 60px;" :formatter="formatPlatform"></el-table-column>
      <el-table-column align="center" prop="publishStatus" label="发布状态" style="width: 60px;" :formatter="formatStatus"></el-table-column>
      <el-table-column align="center" prop="forceUpdate" label="强制更新" style="width: 60px;" :formatter="formatUpdate"></el-table-column>
      <el-table-column align="center" prop="createTime" label="新增时间" style="width: 60px;"></el-table-column>
      <el-table-column align="center" prop="operatorName" label="操作人" style="width: 60px;"></el-table-column>
      <el-table-column align="center" label="操作" width="260px" v-if="hasPerm('version:delete')||hasPerm('version:update') || hasPerm('version:publish')">
        <template slot-scope="scope">
          <el-button type="success" icon="edit" v-if="hasPerm('version:publish')" :disabled="scope.row.publishStatus =='y'" @click="publish(scope.$index)">发布</el-button>
          <el-button type="primary" icon="edit" v-if="hasPerm('version:update')" @click="showUpdate(scope.$index)">修改</el-button>
          <el-button type="danger" icon="delete" v-if="hasPerm('version:delete')" @click="removeVersion(scope.$index)">删除 </el-button>
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :before-close="handleClose">
      <el-form class="small-space" :model="tempVersion" label-position="right" label-width="120px"
        ref="tempVersion" style='width: 500px; margin-left:50px;'>
        <el-form-item label="应用名称" required>
            <el-select v-model="tempVersion.applicationCode" placeholder="请选择"> 
                <el-option v-for="app in apps" :key="app.code" :label="app.applicationName" :value="app.code"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="版本号" required>
            <el-tooltip content="版本号不能低于上个版本且保存后无法修改，保存前请确认" placement="top-end" effect="light" 
                :disabled="this.tempVersion.id != ''">
                <el-input type="text" v-model="tempVersion.appVersion" :disabled="this.tempVersion.id != ''"></el-input>
            </el-tooltip>
        </el-form-item>
        <el-form-item label="平台" required>
          <el-select v-model="tempVersion.platform" placeholder="请选择">
            <el-option v-for="item in platforms" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="更新日志" required>
          <el-input type="textarea" v-model="tempVersion.updateContents" :rows="4">
          </el-input>
        </el-form-item>
        <el-form-item label="强制更新">
          <el-switch v-model="updateType">
          </el-switch>
        </el-form-item>
        <el-form-item label="附件">
          <el-upload class="upload-demo"
            name="apkFile"
            ref="upload"
            :action="uploadUrl"
            :headers="headers"
            :data="uploadData"
            method:="post"
            :multiple="false" 
            :on-change="handleChange"
            :on-preview="filePreview" 
            :on-remove="fileRemove" 
            :file-list="fileList" 
            :auto-upload="false"
            :on-success="handleSuccess"
            :on-error="handleError">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload()">上传到服务器</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="文件路径" required>
            <!-- <el-input type="textarea" v-model="realPath" :rows="2" :disabled="true"> -->
            <el-input type="text" v-model="tempVersion.filePath" placeholder="请上传或输入文件路径"></el-input>
        </el-form-item>
        <el-form-item label="渠道" required>
            <el-input type="text" v-model="tempVersion.channel"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog()">取 消</el-button>
        <el-button type="success" v-if="hasPerm('version:publish')" :disabled="tempVersion.publishStatus == 'y'" @click="publishAppVersion()">发 布</el-button>
        <el-button type="primary" @click="saveAppVersion()">保 存</el-button>
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
                platform: "",
                publishStatus: "",
                applicationCode: ""
            },
            dialogStatus: "create",
            dialogFormVisible: false,
            textMap: {
                update: "编辑版本",
                create: "新增版本"
            },
            apps: [],
            platforms: [
                {
                    value: "android",
                    label: "安卓"
                },
                {
                    value: "ios",
                    label: "苹果"
                }
            ],
            publishStatuses: [
                {
                    value:"y",
                    label:"已发布"
                },
                {
                    value:"n",
                    label:"待发布"
                }
            ],
            updateType: false,
            headers:{'Authorization': "Bearer "+getToken()},
            uploadUrl: process.env.BASE_URL+"version_manage/upload",
            uploadData: {
                uploadId: "",
                filePath: ""
            },
            fileList: [],
            ftpDomain:"",
            //realPath:"",
            tempVersion: {
                id: "",
                applicationCode: "",
                appVersion: "",
                platform: "",
                updateContents: "",
                forceUpdate: "",
                filePath: "",
                publishStatus: "n",
                uploadId: -1,
                channel: ""
            }
        };
    },
    created() {
        this.getList();
        this.getAllApps();
    },
    methods: {
        filePreview() {},
        fileRemove() {},
        getList() {
            //查询列表
            if (!this.hasPerm("version:list")) {
                return;
            }
            this.listLoading = true;
            //this.listQuery.version=JSON.stringify(this.listQuery.data);
            //this.listQuery.data=JSON.stringify(this.listQuery.data);
            this.api({
                url: "/version_manage/find",
                method: "get",
                params: this.listQuery
            }).then(data => {
                console.log(data);
                this.listLoading = false;
                this.list = data.list;
                this.totalCount = data.total;
                this.ftpDomain = data.ftpDomain;
            });
        },
        getAllApps() {
            this.api({
                url: "/application_manage/find_apps",
                method: "get"
            }).then(data => {
                console.log(data);
                this.apps = data;
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
            this.tempVersion.id = "";
            this.tempVersion.applicationCode = "";
            this.tempVersion.appVersion = "";
            this.tempVersion.platform = "";
            this.tempVersion.updateContents = "";
            this.updateType = false;
            this.tempVersion.filePath = "";
            this.tempVersion.publishStatus = "n";
            //this.realPath = "";
            this.tempVersion.uploadId =-1;
            this.tempVersion.channel = "";
            this.dialogStatus = "create";
            this.dialogFormVisible = true;

        },
        showUpdate($index) {   
            let version = this.list[$index];
            this.tempVersion.id = version.id;
            this.tempVersion.applicationCode = version.applicationCode;
            this.tempVersion.appVersion = version.appVersion;
            this.tempVersion.platform = version.platform;
            this.tempVersion.updateContents = version.updateContents;
            this.updateType = version.forceUpdate == "y" ? true : false;
            this.tempVersion.filePath = version.filePath;
            //this.realPath = this.ftpDomain+"/"+version.filePath;
            this.tempVersion.publishStatus = version.publishStatus;
            this.tempVersion.uploadId = version.uploadId;
            this.tempVersion.channel = version.channel;
            this.dialogStatus = "update";
            this.dialogFormVisible = true;
        },

        //发布
        publishAppVersion() {
            //校验内容是否为空
            if(this.checkContents(this.tempVersion.applicationCode,"请选择应用!!!")) {
                 return;
            }
            if(this.checkContents(this.tempVersion.appVersion,"请输入版本号!!!")) {
                return ;
            }
            if(this.checkContents(this.tempVersion.platform,"请选择平台!!!")) {
                return;
            }
            if(this.checkContents(this.tempVersion.updateContents,"请输入更新日志!!!")) {
                return;
            }
            if(this.checkContents(this.tempVersion.filePath,"请上传文件/输入文件路径!!!")) {
                return;
            }
            if(this.checkContents(this.tempVersion.channel,"请输入渠道!!!")) {
                return;
            }
            if (this.updateType) {
                this.tempVersion.forceUpdate = "y";
            } else {
                this.tempVersion.forceUpdate = "n";
            }
            this.$refs.tempVersion.validate((valid) => {
                let message = "发布成功";
                if (valid) {
                    this.api({
                        url: "/version_manage/save_publish_version",
                        method: "post",
                        data: this.tempVersion
                    }).then(() => {
                        this.dialogFormVisible = false;
                        this.$message({
                            message: message,
                            type: "success",
                            duration: 1 * 1000,
                            onClose: () => {
                                this.fileList = [];
                                this.getList();
                            }   
                        });
                    }).catch(() => {
                        this.tempVersion.publishStatus = "N";
                    });
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },

        //保存
        saveAppVersion() {
            //校验内容是否为空
            if(this.checkContents(this.tempVersion.applicationCode,"请选择应用!!!")) {
                 return;
            }
            if(this.checkContents(this.tempVersion.appVersion,"请输入版本号!!!")) {
                return ;
            }
            if(this.checkContents(this.tempVersion.platform,"请选择平台!!!")) {
                return;
            }
            if(this.checkContents(this.tempVersion.updateContents,"请输入更新日志!!!")) {
                return;
            }
            if(this.checkContents(this.tempVersion.filePath,"请上传文件/输入文件路径!!!")) {
                return;
            }
            if(this.checkContents(this.tempVersion.channel,"请输入渠道!!!")) {
                return;
            }
            if (this.updateType) {
                this.tempVersion.forceUpdate = "y";
            } else {
                this.tempVersion.forceUpdate = "n";
            }
            this.$refs.tempVersion.validate((valid) => {
                let message = "保存成功";
                //修改应用
                if(valid) {
                    this.api({
                        url: "/version_manage/save",
                        method: "post",
                        data: this.tempVersion
                    }).then(() => {
                        this.dialogFormVisible = false;
                        this.$message({
                            message: message,
                            type: "success",
                            duration: 1 * 1000,
                            onClose: () => {
                                this.fileList = [];
                                this.getList();
                            }
                        });
                    });
                } else {
                   alert('error submit!!');
                    return false;
                }
            });
        },

        publish($index) {
            let _vue = this;
            let version = _vue.list[$index];
            let message = "发布成功";
            _vue
                .api({
                    url: "/version_manage/save_publish_status/" + version.id,
                    method: "put",
                    data: ""
                })
                .then(() => {
                    _vue.$message({
                        message: message,
                        type: "success",
                        duration: 1 * 1000,
                        onClose: () => {
                            _vue.getList();
                        }   
                    });
                });
        },

        //校验
        checkContents(content,des) {
            if(!content) {
                this.$message.error(des);
                return true;
            }
        },

        removeVersion($index) {
            let _vue = this;
            this.$confirm("确定删除此版本?", "提示", {
                confirmButtonText: "确定",
                showCancelButton: true,
                type: "warning"
            }).then(() => {
                let version = _vue.list[$index];
                _vue
                    .api({
                        url: "/version_manage/delete/" + version.id,
                        method: "delete",
                        data: ""
                    })
                    .then(() => {
                        _vue.getList();
                    });
            });
        },
        formatPlatform(row, column) {
            return row.platform == "ios" ? "苹果" : row.platform =="android" ? "安卓" : "其他";
        },
        formatStatus(row, column) {
            return row.publishStatus == "y" ? "已发布" :  "待发布" ;
        },

        formatUpdate(row, column) {
            return row.forceUpdate == "y" ? "是" :  "否" ;
        },
        
        //上传，判断文件是否选择上传文件
        submitUpload() {
            if(this.fileList.length != 1) {
                alert("please choice your file!!");
                return;
            } else {
                this.uploadData.uploadId = this.tempVersion.uploadId;
                this.uploadData.filePath = this.tempVersion.filePath;
                this.$refs.upload.submit();
            } 
        },
        //文件状态改变触发函数
        handleChange(file, fileList) {
            //去掉fileList中原文件，只保留最后选择的文件
            this.fileList = fileList.slice(-1);
        },

        handleSuccess(response,file,fileList) {
            console.log(response);
            if(response.code == this.global.SUCCESS_CODE) {
                //this.realPath = this.ftpDomain +"/"+ response.data.resultPath
                this.tempVersion.filePath = this.ftpDomain +"/"+ response.data.resultPath;
                this.tempVersion.uploadId = response.data.uploadId;
            } else {
                this.$message.error(response.message);
                this.$refs.upload.clearFiles();
            }
        },

        handleError(err, file, fileList) {
            this.$message.error("上传失败,请重新上传");
        },

        //关闭前的回调，清空表单及上传信息，消灭回显
        handleClose(done) {
            this.$refs.upload.clearFiles();        //效果同this.fileList = []，后者有延迟
            done();
        },
        //取消按钮关闭
        closeDialog() {
            this.$refs.upload.clearFiles();
            this.dialogFormVisible = false;
        }
    }
};
</script>
