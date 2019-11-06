const path=require('path')
const insert=require(path.resolve(global.basedir,'core','db','insert.js'))
const select=require(path.resolve(global.basedir,'core','db','select.js'))
const checkToken=require(path.resolve(__dirname,'common','checkToken.js'))
const randomstring=require('randomstring')
const {sendMail}=require(path.resolve(global.basedir,'core','util','mail.js'))
const hash=require(path.resolve(global.basedir,'core','util','encrypt.js'))

module.exports=function(req,res,next){

  return new Promise((resolve,reject)=>{
    if(req.method=='GET')
      return render()
    else if(req.method=='POST')
      return handle()
    else
      return reject(5)
  })
  .catch(handleError)
  .then(reply)

  function render(){
    res.page=path.resolve('oauth','resetuser.pug')
    return Promise.resolve()
  }

  function handle(){
    const id=req.body.id
    const email=req.body.email
    if(Number.isInteger(id) && !email)
      return checkToken(req)
      .then(validateUser)
      .then(validateToken)
      .then(finalize)
    else if(email && !Number.isInteger(id))
      return finalize()
    else
      return Promise.reject(6)

    function validateUser(token){
      const uid=token.uid
      if(!Number.isInteger(uid)) return Promise.reject()
      return select('TableUser',['permission'],'rowid='+uid)
      .then(rows=>{
        if(rows.length<1) return Promise.reject(2)
        const row=rows[0]
        if(row.permission>1) return Promise.reject(2)
        return token
      })
    }

    function validateToken(token){
      const scope=token.scope
      let s=0
      switch(scope){
        case 'read':
          s=1
          break
        case 'write':
          s=2
          break
        default:
          break
      }
      if(s<2) return Promise.reject(3)
      return Promise.resolve(token)
    }

    function finalize(token){
      if(token)
        return select('TableUser',['rowid','permission','email','username'],'rowid='+id)
        .then(rows=>{
          if(rows.length<1) return Promise.reject(4)
          const row=rows[0]
          if(row.permission<2) return Promise.reject(6)
          return row
        })
      else
        return select('TableUser',['rowid','permission','username','email'],'email=\''+email+'\'')
        .then(rows=>{
          if(rows.length<1) return Promise.reject(4)
          return rows[0]
        })
        .then(updatesend)

      function updatesend(row){
        let pass=randomstring.generate({
          length:20,
          charset:'alphabetic'
        })
        return hash(pass)
        .then(h=>{
          return update('TableUser',{
            active:0,
            password:h
          },'email=\''+row.email+'\'')
        })
        .then(()=>{
          return sendMail({
            title:'Reset account',
            correspondent:row.email,
            body:pub.renderFile(path.resolve(__dirname,'resetuser.pug'),{lk:req.protocol+'://'+req.hostname+':8080/newuser'+'?id='+row.rowid+'&code='+pass,username:row.username})
          })
        })
      }
    }
  }

  function handleError(e){
    res.status(400)
    switch(e){
      case 1:
        res.body={
          error:'invalid token',
          error_description:'The token received did not pass validation'
        }
        break
      case 2:
        res.body={
          error:'unauthorised user',
          error_description:'The email does not exist'
        }
        break
      case 3:
        res.body={
          error:'unauthorised token',
          error_description:'The token received was not authorised for this request'
        }
        break
      case 4:
        res.body={
          error:'operation failed',
          error_description:'The request was validated but the operation failed for unknown reasons'
        }
        break
      case 5:
        res.body={
          error:'unsupported method',
          error_description:`The method ${req.method} is not supported for this endpoint`
        }
        break
      case 6:
        res.body={
          error:'invalid request',
          error_description:'the request received cannot be understood'
        }
        break
      default:
        res.status(500)
        res.body={
          error:'unknwon error',
          error_description:'undefined error!'
        }
        break
    }
    return Promise.resolve()
  }

  function reply(){
    if(res.headersSent) return Promise.resolve()
    if(!res.statusCode) res.status(200)
    if(res.body) res.send(JSON.stringify(res.body))
    else if(res.page) res.render(page)
    else res.send()
    return Promise.resolve()
  }
}
