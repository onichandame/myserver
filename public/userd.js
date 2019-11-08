$(document).ready(function(){
  const key='sid'
  const sid=localStorage.getItem(key)

  let detail=sid ? request() : Promise.resolve()

  detail.finally(finalize)

  function request(){
    return getXHR(1,'/request','',{
      Authorization:`Bearer ${sid}`
    })
    .then(res=>{
      if(typeof res != 'object') return Promise.reject()
      const username=res.username
      const email=res.email
      const created_at=res.created_at
      const active=res.active
      const permission=res.permission

      if(active<1) return Promise.reject()
    })
  }

  function finalize(user){
    if(!(user && user.username && user.email && user.created_at && user.active && user.permission)) return anonymous()
    else return loggedin()
  }

  function getXHR(method, url, body, header){
    return new Promise((resolve,reject)=>{
      let xhr=bew XMLHttpRequest()
      for(const key of Object.keys(header))
        xhr.setRequestHeader(key,header[key])
      let s=''
      switch(method){
        case 0:
          s='POST'
          break
        case 1:
          s='GET'
          break
        case 2:
          s='PUT'
          break
        case 3:
          s='DELETE'
          break
        default:
          return Promise.reject()
          break
      }
      xhr.open(s,url)
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
})
