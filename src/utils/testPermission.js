import { getStorage } from './localStorage'
export const testUser=(moduleJson)=>{
    let moduleArr = getStorage('userData') ? getStorage('userData').modules : [],
    linkHost=window.location.origin || ""
    if(moduleArr.length<=0){
        location.href=linkHost
        return
    }
    if(linkHost.match(/^(http)\:\/\/ms\.yiche\.com/gi)){       //生产环境
        if(!testModuleIdFun(moduleJson.prodId)){               //无权限
            console.log("无权限",moduleJson.prodId)
            location.href=linkHost
            return 
        }                         
    }else{                                                           //测试环境
        if(!testModuleIdFun(moduleJson.testId)){                //无权限
            console.log("无权限",moduleJson.testId,linkHost)
            location.href=linkHost
            return
        }                         
    }
    function testModuleIdFun(currentModuleId){
        let isSystem = moduleArr.find((item)=>{
            if(item.moduleId === currentModuleId){
                return true                         //有权限
            }else{
                return false                        //无权限
            }
        })
        return isSystem
    }
}