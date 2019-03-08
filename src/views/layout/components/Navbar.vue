<template>
  <el-menu class="navbar" mode="horizontal">
    <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>
    <breadcrumb></breadcrumb>
    <a class="username">{{username}}</a>
    <el-dropdown class="avatar-container" trigger="click">
      <div class="avatar-wrapper">
        <img class="user-avatar" :src="avatar+'?imageView2/1/w/80/h/80'">
        <i class="el-icon-caret-bottom"></i>
      </div>
      <el-dropdown-menu class="user-dropdown" slot="dropdown">
        <router-link class="inlineBlock" to="/">
          <el-dropdown-item>
            主页
          </el-dropdown-item>
        </router-link>
        <el-dropdown-item divided>
          <span @click="logout" style="display:block;">退出</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { delStorage } from '@/utils/localStorage'
import { removeToken } from '@/utils/auth'
export default {
  data() {
    return {
      username:''
    }
  },
  created () {
    this.username =JSON.parse(localStorage.getItem('userData')).user.trueName;
  },
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar')
    },
    logout() {
      this.$confirm('确认退出?状态不保存', '提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type:'warning'
        })
          .then(() => {
            // this.$store.dispatch('LogOut').then(() => {
            //   //location.reload();// 为了重新实例化vue-router对象 避免bug
            //   location.href=url
            // })
            removeToken()
            delStorage()
            window.location.reload()
          })
          .catch(action => {
            this.$message({
              type: 'warning',
              message: action === 'cancel'
                ? '取消操作'
                : '停留在当前页面'
            })
          });
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.username{
    position: absolute;
    right: 84px;
      top: 12px;
      font-size: 18px;
      color:#000;
    }
.navbar {
  height: 70px;
  line-height: 50px;
  border-radius: 0px !important;
  position: sticky;
  top: 0;
  z-index: 99;
  display: flex;
  align-items: center;
  // background: #002142;
  // border-left: 1px solid #000;
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  .screenfull {
    position: absolute;
    right: 90px;
    top: 16px;
    color: red;
  }
  .avatar-container {
    height: 50px;
    display: inline-block;
    position: absolute;
    right: 35px;
    .avatar-wrapper {
      cursor: pointer;
      margin-top: 5px;
      position: relative;
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid #9288e4;
      }
      .el-icon-caret-bottom {
        position: absolute;
        right: -20px;
        top: 25px;
        font-size: 12px;
      }
    }
  }
}
</style>

