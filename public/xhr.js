function getXHR(method, url, body, header){
  return new Promise((resolve,reject)=>{
    let xhr=bew XMLHttpRequest()
    for(const key of Object.keys(header))
      xhr.setRequestHeader(key,header[key])
    xhr.open(method,url)
    if(body) xhr.send(body)
    else xhr.send()
    xhr.onload=function(){
      return resolve(xhr.response)
    }
    xhr.onerror=function{
      return reject()
    }
  })
}
