<template>
  <div id="app">
    <router-view></router-view>
    <!-- <my-template></my-template> -->
    <!-- <template-msg></template-msg> -->
    <!-- <push-log></push-log> -->
  </div>
</template>

<script>
// import myTemplate from './views/templateManage'
// import templateMsg from './views/msgPushManage/templateMsg'
// import pushLog from './views/msgPushManage/pushLog'
export default {
  name: 'app',
  components:{
    // myTemplate
    // templateMsg
    // pushLog
  }
}
</script>

<style lang="scss">
  @import '~normalize.css/normalize.css';// normalize.css 样式格式化
  @import './styles/index.scss'; // 全局自定义的css样式
</style>
