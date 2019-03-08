<!--
 * @Author: 王亮
 * @Date: 2019-02-19 09:30:47
 * @LastEditors: 王亮
 * @LastEditTime: 2019-02-19 14:21:54
 * @Description: elementUI 三级选车插件
 -->
 <template>
    <!--选车组件 start -->
    <div class="selectCarModels">
       <!--品牌 start-->
       <el-select class="select" ref="master"  v-model="masterId" filterable @change="masterChangeEvent($event)">
          <el-option label="请选择品牌" :value="-1"></el-option>
          <!--循环 start-->
          <el-option-group v-for="group in dat.masterDat" :key="group.label" :label="group.label">

            <el-option v-for="(item,index) in group.options" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-option-group>
           <!--循环 end-->
       </el-select>
       <!--品牌 end-->
       <!--车型 start-->
       <el-select v-if="carEnabled"  class="select" v-model="carId" @change="carChangeEvent($event)">
          <el-option label="请选择车型" :value="-1"></el-option>
          <el-option-group v-for="group in dat.carDat" :key="group.brandId" :label="group.brandName">
            <el-option v-for="item in group.serialList" :key="item.serialId" :label="item.serialName" :value="item.serialId">
                <span class="select_title">{{ item.serialName }}</span>
                <span :class="item.saleStatus | saleStatusClassNameById(item.saleStatus)">{{ item.saleStatus | saleStatusNameById  }}</span>
            </el-option>
          </el-option-group>
      </el-select>
      <!--车型 end-->
      <!--车款 start-->
      <div class="models" v-if="modelsEnabled">
        <el-select  class="select" v-model="modelsId" @change="modelsChangeEvent($event)">
          <el-option label="请选择车款" :value="-1"></el-option>
          <el-option-group v-for="group in dat.modelsDat" :key="group.year" :label="group.year + '款'">
            <el-option v-for="item in group.carList" :key="item.carId" :label="item.name" :value="item.carId">
              <span class="select_title">{{ item.name }}</span>
              <span :class="item.saleStatus | saleStatusClassNameById(item.saleStatus)">{{ item.saleStatus }}</span>
            </el-option>
          </el-option-group>
        </el-select>
      </div>
      <!--车款 end-->
    </div>
    <!--选车组件 end -->
 </template>
<script>
// md5加密
import { md5 } from '@/utils/MD5-new'

export default {
   name:'selectModels',
   data(){
     return {
        // 品牌ID
        masterId: -1,
        // 车型ID
        carId: -1,
        // 车款ID
        modelsId: -1,
        // 品牌对象
        master: null,
        // 车型对象
        car: null,
        // 车款对象
        models: null,
        dat: {
          masterDat: [],
          carDat: [],
          modelsDat: []
        }
     }
   },
   props: {
      // 默认品牌ID
      defaultMasterId: {
        default: -1
      },
      // 默认车型ID
      defaultCarId: {
        default: -1
      },
      // 默认车款ID
      defaultModelsId: {
        default: -1
      },
      // 品牌
      masterSource: {
        type: Function,
        //默认品牌获取品牌数据
        default: async function(){
           let dat = await this.apiPostAspData({ url: "http://172.20.4.14:8769/mapi_common/api/v1/brand/get_master_brands", data: {status: 7, source: 1, allBrands: false}})
           return dat
        }
      },
      // 车型
      carSource: {
        type: Function,
        default: async function(masterId){
          var dat = await this.apiPostAspData({url: "http://172.20.4.14:8769/mapi_common/api/v1/brand/get_sub_brands", data: {source: 1, masterId: masterId, status: 7 }})
          return dat
        }
      },
      // 车款
      modelsUrl: {
        type: String,
        default: 'http://172.20.4.14:8769/mapi_common/api/v1/choosecar/inquiry/get_car_list'
      },
      // 是否启用车型
      carEnabled: {
        type: Boolean,
        default: true
      },
      // 是否启用车款
      modelsEnabled: {
        type: Boolean,
        default: true
      }
   },
   methods:{
      /*******************************初始化方法 start****************************** */
      // 加载品牌数据
      async initMasterList () {
        let that = this
         // source: 类型（1车型所有数据2显示有图片的数据） status 销售状态（1：在销，2： 停销，4： 未上市（待销），3：在销+停销，5：在销+未上市 6：停销+未上市，7：所有,allBrands:是否显示所有品牌（默认为false，即返回不包含停销车型的主品牌）
        let dat = await that.masterSource()
        // 从新组装数据结构
        that.dat.masterDat = that.filterMasterData(dat)
      },
      // 加载车型数据
      async initCarList () {
        let that = this
        //从新组装车型数据
        that.dat.carDat = await that.carSource(that.master.id)
      },
      // 加载车款数据
      async initModelsList () {
        let that = this
        let dat = await that.apiPostAspData({url: that.modelsUrl, data: {source: 1, serialId: that.car.id, status: 7, cityId: 201}})
        that.dat.modelsDat = that.filterModelsData(dat)
      },
      /********************************初始化方法 end****************************** */
      /********************************事件 start********************************** */
      masterChangeEvent (ev) {
        let that = this
        // 清空车型集合
        that.dat.carDat = []
        // 清空车款集合
        that.dat.modelsDat = []
        // 判断是否有品牌ID
        that.master = {id: -1, name: '请选择品牌'}
        that.carId = -1
        that.modelsId = -1
        if (that.masterId >= 0) {
          let arr = []
          // 合并数组
          that.dat.masterDat.forEach(function (item) {
            arr = arr.concat(item.options)
          })
          // 获取选中品牌对象
          let {label, value} = arr.find((item) => item.value === that.masterId)
          // 统一返回属性
          that.master = {id: value, name: label}
          // 品牌ID为空跳过
          if (!that.master.id) return
          that.initCarList()
        }
        // 回调选品牌事件
        if (!ev) return
        that.$emit('masterChangeEvent', {master: that.master})
      },
      // 选择车型事件
      carChangeEvent (ev) {
        let that = this
        // 车型不启用跳过
        if (!that.carEnabled) return
        // 清空车款集合
        that.dat.modelsDat = []
        that.car = {id: -1, name: '请选择车型', status: -1}
        that.modelsId = -1
        // 判断是否有车型ID
        if (that.carId >= 0) {
          let arr = []
          // 合并数组
          that.dat.carDat.forEach(function (item) {
            let brandId = item.brandId
            let brandName = item.brandName
            arr = arr.concat(item.serialList.map
            (function(serialItem){
               return { serialId:serialItem.serialId,serialName:serialItem.serialName,brandId:brandId,brandName:brandName }
            }))
          })

          let {serialId, serialName, saleStatus,brandId,brandName} = arr.find((item) => item.serialId === that.carId)
          // 统一返回属性
          that.car = {id: serialId, name: serialName, status: saleStatus,brandId:brandId,brandName:brandName}
          // 车型ID为空跳过
          if (!that.car.id) return
          that.initModelsList()
        }
        // 回调选车型事件
        if (!ev) return
        that.$emit('carChangeEvent', {master: that.master, car: that.car})
      },
      // 选择车款事件
      modelsChangeEvent (ev) {
        let that = this
        // 车款不启用跳过
        if (!that.modelsEnabled) return
        // 判断是否有车款ID
        that.models = {id: -1, name: '请选择车款', status: -1}
        if (that.modelsId >= 0) {
          let arr = []
          // 合并数组
          that.dat.modelsDat.forEach(function (item) {
            arr = arr.concat(item.carList)
          })
          // 统一返回属性
          let {carId, name, saleStatus} = arr.find((item) => item.carId === that.modelsId)
          // 属性名称重置
          that.models = {id: carId, name: name, status: saleStatus}
        }
        // 回调选车款事件
        if (!ev) return
        that.$emit('modelsChangeEvent', {master: that.master, car: that.car, models: that.models})
      },
      // 重置选择器
      clearSelectFn () {
        let that = this
        that.masterId = -1
        that.carId = -1
        that.modelsId = -1
      },
      /********************************事件 end********************************** */
      /*************************附加方法 start ******************************* */
      /**
       * 品牌数据过滤器
       * @params data {array} 输入值
       * return {arry} 新结构数据
       */
      filterMasterData (data) {
        let groupArr = []
        if (!(data instanceof Array)) return groupArr
        // 获取分组[{label:'A',options:[]}]
        data.forEach(function (n, i) {
          if (!groupArr.some((item) => item.label === n.initial)) {
            groupArr.push({label: n.initial, options: []})
          }
        })
        // 根据分组获取数据[{label:'A',options:[{label:'奥迪'},{masterId:8}]}]
        let newGroup = groupArr.filter(function (item) {
          item.options = data.filter((n) => n.initial === item.label).map(function (n) {
            return {label: n.name, value: n.masterId}
          })
          return item
        })
        return newGroup
      },
       /**
     * 组装车款数据
     * @params data {array} 输入值
     * return {arry} 新结构数据
     */
    filterModelsData (data) {
      let groupArr = []
      if (!(data instanceof Array)) return groupArr
      data.forEach(function (item) {
        let carList = []
        item.yearList.forEach(function (itemYear) {
          itemYear.carList.forEach(function (itemCar) {
            carList.push({carId: itemCar.carId, name: itemCar.name, saleStatus: itemCar.saleStatus})
          })
        })
        groupArr.push({year: item.year, carList: carList})
      })
      return groupArr
    },
    async apiPostAspData({url,data}){
        let that = this
        let dat = await this.api({url: url, method: 'post',data: that.reqParams(data) })
        // console.log(dat, 12345)
        return dat
    },
    reqParams (param) {
      let questParam = {cid: 401, key: 'C2A741FB93BCEB403D3862BC5DE2FF07', uid: '', ver: '6.6.3'}
      // 签名规则 cid={cid};param={param};uid={uid};ver={ver};t={t};{key}
      let tNum = Number(Date.parse(new Date()).toString().substr(0, 10))
      let signBuffer = `cid=${questParam.cid};param=${JSON.stringify(param)};ver=${questParam.ver};t=${tNum};${questParam.key}`
      // console.log(signBuffer, 111)
      signBuffer = md5(signBuffer)
      // console.log(signBuffer, 222)
      let commonParam = {
        cid: questParam.cid,
        ver: questParam.ver,
        uid: questParam.uid,
        t: tNum,
        sign: signBuffer
      }
      return Object.assign({}, commonParam, { param: param })
    }
    /*************************附加方法 end ******************************* */
   },
   /** **************************生命周期 start**************************** */
   created () {
      let that = this
      // 初始化品牌
      that.initMasterList()
   },
   filters: {
      // 获取销售状态名称
      saleStatusNameById (v) {
        // 销售状态（-1:停销、0:待销、1:在销）
        let name = ''
        switch (v) {
          case -1:
            name = '停销'
            break
          case 0:
            name = '待销'
            break
          case 1:
            name = '在销'
            break
        }
        return name
      },
      // 获取销售状态样式
      saleStatusClassNameById (v) {
        let name = 'select_status'
        switch (v) {
          case -1:
          case '停销':
            name += ''
            break
          case 0:
          case '待销':
            name += ' future'
            break
          case 1:
          case '在销':
            name += ' sell'
            break
        }
        return name
      }
  },
  // 监听
  watch: {
    // 监听品牌集合
    'dat.masterDat': function () {
      let that = this
      that.masterId = that.defaultMasterId
      // 如果有默认品牌ID那触发选择品牌事件
      if (Number(that.defaultMasterId) > 0) {
        that.masterChangeEvent()
      }
    },
    // 监听车型集合
    'dat.carDat': function () {
      let that = this
      that.carId = that.defaultCarId
      // 如果有默认车型ID那触发选择车型事件
      if (Number(that.defaultCarId) > 0) {
        that.carChangeEvent()
      }
    },
    // 监听车款集合
    'dat.modelsDat': function () {
      let that = this
      that.modelsId = that.defaultModelsId
      // 如果有默认车款ID那触发选择车款事件
      if (Number(that.defaultModelsId) > 0) {
        that.modelsChangeEvent()
      }
    }

  }
   /** **************************end start**************************** */

 }
 </script>

<style lang="scss">
  .selectCarModels {
    .models{
        display: inline-block;
        input{ width:300px; }
    }
  }
</style>

<style lang="scss" scoped>
  .select_title { float: left; }
  .select_status {
    float: right;
    padding-left:20px;
    color: #f56c6c;
    font-size: 13px;
    &.sell{
      color: #409EFF
    }
    &.future {
      color: #67c23a
    }
  }
  .select{
    margin-right: 10px;
  }
</style>



