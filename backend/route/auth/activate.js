const path=require('path')
const okitchen=require('okitchen')

const checksecret=require(path.resolve(__dirname,'common','checksecret.js'))
const adduser=require(path.resolve(__dirname,'common','adduser.js'))

/**
 * handles activate requests
 * @memberof module:routers/auth
 * @method activate
 * @returns {Promise} resolves with res on success
 */
module.exports=function(req,res){
  const email=req.body.email | ''
  const key=req.query.key | ''
  const uname=req.body.uname | ''
  const password=req.body.password | ''

  return checkParam()
  .then(()=>{return checkKey()})
  .then(()=>{return checkCredentials()})
  .then(()=>{return activate()})
  .catch(e=>{return handleError(e)})
  .then(()=>{return okitchen.common.reply(res)})

  function checkParam(){
    if(typeof key === 'string' && key && typeof uname === 'string' && uname && typeof password === 'string' && password && typeof email === 'string' && email) return Promise.resolve()
    else return Promise.reject(1)
  }

  async function checkKey(){
    return okitchen.db.selectOne((await okitchen.config.get('signup.table')).name,['email','salt','secret'],`email='${email}'`)
    .then(row=>{
      if(row){
        return checksecret(key,row.salt,secret)
        .catch(e=>{
          if(e) throw e
          else return Promise.reject(3)
        })
      }else{
        return Promise.reject(2)
      }
    })
  }

  function checkCredentials(){
    return okitchen.db.selectOne((await okitchen.config.get('auth.table')).name,[1],`uname='${uname}'`)
    .then(row=>{
      if(row) return Promise.reject(4)
    })
  }

  function activate(){
    return adduser({
      uname:uname,
      email:email,
      password:password,
      status:0,
      level:2
    })
    .then(()=>{res.status(200)})
  }

  async function handleError(flag){
    if(flag==1){
      res.status(400)
      res.body='key empty'
    }else if(flag==2){
      res.status(404)
      res.body='user not found'
    }else if(flag==3){
      res.status(401)
      res.body='key not validated'
    }else if(flag==3){
      res.status(409)
      res.body='username conflict'
    }else{
      res.status(500)
      res.body=`server internal error: ${JSON.stringify(flag)}`
    }
    return Promise.resolve()
  }
}
