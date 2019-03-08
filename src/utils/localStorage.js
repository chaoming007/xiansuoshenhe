const storage=window.localStorage
export function setStorage(name,val){
    if(getStorage(name)){
        return
    }
    if(storage){
        storage.setItem(name,JSON.stringify(val))
    }
}
export function getStorage(name){
    let val=""
    if(storage){
        val=storage.getItem(name)
    }
    return JSON.parse(val)
}
export function delStorage(){
    storage.clear()
}