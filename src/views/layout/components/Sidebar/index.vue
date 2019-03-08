<template>
  <scroll-bar>
    <h3 class="logo" v-show="!isCollapse"><img :src="logo"/><span style="font-size:18px">运营审核</span></h3>
    <!-- <img class="pic-404__child right" style="width:80;height:80" :src="logo" alt="logo" v-show="isCollapse"> -->
    <el-menu mode="vertical" unique-opened :default-active="$route.path" :collapse="isCollapse"
             background-color="#304156" text-color="#fff" active-text-color="#409EFF">
      <sidebar-item :routes="permission_routers" :fathersPaths="''"></sidebar-item>
    </el-menu>
  </scroll-bar>
</template>
<script>
  import {mapGetters} from 'vuex'
  import SidebarItem from './SidebarItem'
  import ScrollBar from '@/components/ScrollBar'
  import logo from '@/assets/images/newlogo.png'
  export default {
     data() {
      return {
       logo,
       user:this.$store.state.user.nickname
      }
    },
    components: {SidebarItem, ScrollBar},
    computed: {
      ...mapGetters([
        'permission_routers',
        'sidebar'
      ]),
      isCollapse() {
        return !this.sidebar.opened
      }
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "src/styles/mixin.scss";
  .logo {
    height: 70px;
    text-align:center;
    color:white;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #002140;
    margin: 0;
    img{
      width: 80px;
      margin: 0 7px 0px 1px;
    }
  }
</style>
