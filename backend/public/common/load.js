function loadScript(url){
  return new Promise((resolve,reject)=>{
    let script=document.createElement('script')
    script.onload=function(){return resolve()}
    script.onerror=function(msg,src,row,col,e){
      return reject(e)
    }
    script.src=url
    document.head.appendChild(script)
  })
}
