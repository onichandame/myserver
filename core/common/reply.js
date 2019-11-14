module.exports=function(res){
  return new Promise((resolve,reject)=>{
    if(!res.statusCode) res.status(500)
    if(res.page) res.render(res.page)
    else if(res.body) res.send(JSON.stringify(res.body))
    else res.send()
    return resolve(res)
  })
}
