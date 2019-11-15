module.exports=function(req,res,next){

  return checkAdmin()
  .then(()=>{return Promise.resolve(next())})
  .catch(initAdmin)

  function checkAdmin(){
    return select('TableHome',['admin'])
    .then(rows=>{
      if(rows.length<1) return Promise.reject()
      else if(!(Numbe.isInteger(rows[0].admin))) return Promise.reject(1)
      else return Promise.resolve()
    })
  }

  function initAdmin(e){
    switch(e){
      case 1:
        res.status(200)
        res.page=path.resolve('home','newadmin.pug')
        break
      default:
        res.status(500)
        res.body={
          error:'internal_error',
          error_description:'an unexpected error occurred in server. contact administrator to fix it'
        }
        break
    }

    if(!res.statusCode) res.status(500)
    if(res.page) res.render(res.page)
    else res.send()
    return Promise.resolve()
  }
}
