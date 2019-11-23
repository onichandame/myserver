/* register new user
 * activate new user
 */
const path=require('path')
const randomstring=require('randomstring')
const emailexistence=require('email-existence')

const {insert,select,update}=require(path.resolve(__dirname,'..','core.js')).db
const {mail,reply}=require(path.resolve(__dirname,'..','core.js')).common
const {hash,encode}=require(path.resolve(__dirname,'..','core.js')).encrypt

module.exports=function(req,res,next){

  const code=req.query.code
  const id=req.query.id
  const email=req.body.email
  const username=req.body.username 
  const password=req.body.pass

  return handle()
  .catch(error)
  .then(reply)

  function handle(){
    if(req.method=='GET'){
      if(Number.isInteger(id) && code) return activate()
      else return register()
      
      function activate(){
        return checkCode()
        .then(()=>{
          res.page=path.resolve(__dirname,'newpass.pug')
        })
      }

      function register(){
        res.page=path.resolve('oauth','newuser.pug')
        return Promise.resolve()
      }
    }else if(req.method=='POST'){
      if(code) return activate()
      else return register()
      
      function activate(){
        return checkCode()
        .then(checkPassword)
        .then(async ()=>{
          return update('TableUser',{password:await hash(password),active=1},`id=${id}`)
          .then(()=>{res.status(200)})
        })

        function checkPassword(){
          var regex=/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/
          return regex.test(password) ? Promise.resolve() : Promise.reject(2)
        }
      }

      function register(){
        return checkNameEmail()
        .then(createUser)
        .then(sendmail)

        function checkNameEmail(){
          var regex= /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if(!(regex.test(email) && await emailexists())) return Promise.reject(3)
          if(username.length<1) return Promise.reject(4)

          return select('TableUser',['email'],`username='${username}' OR email='${email}'`)
          .then(rows=>{
            if(rows.length)
              if(rows[0].email==email) return Promise.reject(5)
              else return Promise.reject(6)
          })

          function emailexists(){
            return new Promise((resolve,reject)=>{
              emailexistence(email,(e,r)=>{
                if(e) return reject(e)
                else return resolve(r)
              })
            })
          }
        }

        async function createUser(){
          const code=randomstring.generate({
            length:20,
            charset:'alphabetic'
          })

          return insert('TableUser',{
            username:username,
            active:0,
            email:email,
            password: await hash(code),
            created_at:new Date().getTime()/1000,
            permission:2
          })
        }

        function sendmail(code){
          return mail({
            title:'Activate your account',
            correspondent:email,
            body:pug.renderFile(path.resolve(__dirname,'activate.pug'),{username:username,lk:req.protocol+'://'+req.hostname+':8080'+req.path+'?id='+lastid+'&code='+code})
          })
        }
      }
    }else{
      res.status(405)
      return Promise.resolve()
    }

    function checkCode(){
      return select('TableUser',['password'].'id='+id)
      .then(async (rows)=>{
        if(!(rows.length && await hash(rows[0].password)==code)) return Promise.reject(1)
      })
    }
  }

  function error(e){
    res.status(400)
    switch(e){
      case 1:
        res.body={
          error:'invalid activation code',
          error_description:'The activation code cannot be validated against the record'
        }
        break
      case 2:
        res.body={
          error:'invalid password',
          error_description:'The password submitted is of the wrong format'
        }
        break
      case 3:
        res.body={
          error:'invalid email',
          error_description:'The email submitted is not valid'
        }
        break
      case 4:
        res.body={
          error:'invalid username',
          error_description:'The username submitted is not valid'
        }
        break
      case 5:
        res.body={
          error:'email conflict',
          error_description:'the email submitted has been registered'
        }
        break
      case 6:
        res.body={
          error:'username conflict',
          error_description:'The username submitted has been taken'
        }
        break
      case 7:
        res.body={
          error:'credentials invalid',
          error_description:'The user requested cannot be authenticated'
        }
        break
      case 8:
        res.body={
          error:'user activated',
          error_description:'The user requested is already activated'
        }
        break
      default:
        res.status(500)
        res.body={
          error:'internal error',
          error_description:'an unknown error occurred in the server'
        }
        break
    }
    return Promise.resolve()
  }
}
