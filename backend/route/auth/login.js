const path=require('path')
const okitchen=require('okitchen')

const checkuser=require(path.resolve(__dirname,'common','checkuser.js'))
const opensession=require(path.resolve(__dirname,'common','opensession.js'))

/**
 * handles login requests
 * @memberof module:routers/auth
 * @method login
 * @returns {Promise} resolves with res on success
 */
module.exports=function(req,res){
  const uname=req.body.uname | ''
  const password=req.body.password | ''
  const email=req.body.email | ''
  return checkParam()
  .then(()=>{return checkCredentials()})
  .then(id=>{return opensession(id)})
  .then(key=>{
    res.status(200)
    res.body=key
  })
  .catch(e=>{return handleError(e)})
  .then(()=>{return okitchen.common.reply(res)})

  function checkParam(){
    if(((typeof uname === 'string' && uname) || (typeof email === 'string' && email)) && typeof password === 'string' && password) return Promise.resolve()
    else return Promise.reject(1)
  }

  function checkCredentials(){
    return checkuser({
      uname:uname,
      email:email,
      password:password
    })
    .catch(e=>{
    if(e) throw e
    else return Promise.reject(2)
    })
  }

  async function handleError(flag){
    if(flag==1){
      res.status(400)
      res.body='form not complete'
    }else if(flag==2){
      res.status(401)
      res.body='credential invalidated'
    }else{
      res.status(200)
      res.body=flag
    }
    return Promise.resolve()
  }
}
