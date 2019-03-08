<template>
  <div class="dashboard-container">
    <!-- <a href="https://github.com/Heeexy/SpringBoot-Shiro-Vue" target="_blank">
    <img style="margin: 40px"src="http://ots7yt7am.bkt.clouddn.com/file/github.png"></a> -->
    <!-- <img :src="yixiaosha"> -->
    <div class="welcome"><img class="pic" :src="yixiaosha"><p class="welcome-word">您好,&nbsp;<span class="username">{{user}}</span>欢迎使用运营审核管理系统</p></div>
  </div>
</template>
<script>
import {getToken,removeToken} from '@/utils/auth'
import { mapGetters } from 'vuex'
import yixiaosha from '@/assets/images/yixiaosha12.png'
  export default {
    name: 'dashboard',
    data() {
      return {
        yixiaosha,
        user: ''
      }
    },
    created () {
      this.getInfo();
    },
    methods: {
      getInfo(){
        this.api({
          url: "/clueapi/auth/get_info",
          method: "post",
          headers: {
              'Content-Type': 'application/json',
              'Authorization': "Bearer " + getToken()
          },
        }).then(data=>{
          this.user = data.nickName;
        })
      }
    },
  }
</script>

<style lang="scss" scoped>
.welcome{
  font-size: 30px;
  font-weight: bolder;
  margin-bottom: 0px;
  position: relative;
  margin: 18%;
  display: flex;
  justify-content: center;
  align-items: center;
  .pic{
    width: 100px;
  }
  .welcome-word{
    display: inline-block;
    margin-left: 20px;
  }
}
.username{
  color:rgb(218, 114, 45);
}
.dashboard-container{
  text-align: center;
}
</style>

