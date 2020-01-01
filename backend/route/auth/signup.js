const path=require('path')
const okitchen=require('okitchen')
const emailExistence=require('email-existence')
const randomstring=require('randomstring')
const pug=require('pug')

const checkuser=require(path.resolve(__dirname,'common','checkuser.js'))
const opensession=require(path.resolve(__dirname,'common','opensession.js'))
const encodesecret=require(path.resolve(__dirname,'common','encodesecret.js'))

/**
 * handles signup requests
 * @memberof module:routers/auth
 * @method signup
 * @returns {Promise} resolves with res on success
 */
module.exports=function(req,res){
  const email=req.body.email | ''
  return checkParam()
  .then(()=>{return checkEmail()})
  .then(()=>{return signup()})
  .then(secret=>{return email(secret)})
  .catch(e=>{return handleError(e)})
  .then(()=>{return okitchen.common.reply(res)})

  function checkParam(){
    if(typeof email === 'string' && email) return Promise.resolve()
    else return Promise.reject(1)
  }

  function checkEmail(){
    return new Promise((r,j)=>{
      emailExistence.check(email,async (e,r)=>{
        if(r) return r()
        else return j(2)
      })
    })
    .then(async ()=>{
      if(await okitchen.db.selectOne((await okitchen.config.get('auth.table')).name,[1],`email='${email}'`)) return Promise.reject(3)
      else return okitchen.db.delete((await okitchen.config.get('signup.table')).name,`email='${email}'`)
    })
  }

  async function signup(){
    let secret=encodesecret(randomstring.generate({length:20,charset:'alphanumeric'}))
    let flag=true
    while(flag){
      flag=await okitchen.db.selectOne((await okitchen.config.get('signup.table')).name,[1],`secret='${secret.encoded}'`).then(row=>{
        if(row) secret=encodesecret(randomstring.generate({length:20,charset:'alphanumeric'}))
        else flag=false
      })
    }
    return okitchen.insert((await okitchen.config.get('signup.table')).name,{email:email,signup_at:new Date().getTime(),secret:secret.encoded,salt:secret.salt}).then(()=>{return secret})
  }

  function email(secret){
    return okitchen.common.mail({from:'noreply@xiao',to:email,title:'Activate your account',body:pug.renderFile(path.resolve(__dirname,'signup.pug',{email:email,lk:`${req.protocol}://${req.hostname}:${await okitchen.config.get('port')}/auth/activate?key=${secret.secret}&email=${email}`}))})
      .then(()=>{res.status(200)})
  }

  async function handleError(flag){
    if(flag==1){
      res.status(400)
      res.body={errno:102,errmsg:'form not complete'}
    }else if(flag==2){
      res.status(400)
      res.body='email invalidated'
    }else if(flag==3){
      res.status(409)
      res.body='user already exists'
    }else{
      res.status(500)
      res.body=`server internal error: ${JSON.stringify(flag)}`
    }
    return Promise.resolve()
  }
}
