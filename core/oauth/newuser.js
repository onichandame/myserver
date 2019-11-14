/* user opens '/newuser'
 * server returns page with fields 'email' and 'username'
 * user fills the fields and xhr post to current url
 * server validates the info and return http status
 * server creates a random string and stores it in the password field then email the string to the registered email
 * browser receives the status code and displays the message
 *
 * When user clicks the link in the email
 * server receives the string as a query field
 * server validates the string and display password creation page
 * user fills the fields and xhr posts to current url
 * server validates the password and update the database then returns status
 * browser receives the status code and displays the message
 */

const path=require('path')
const insert=require(path.resolve(global.basedir,'core','db','insert.js'))
const select=require(path.resolve(global.basedir,'core','db','select.js'))
const update=require(path.resolve(global.basedir,'core','db','update.js'))
const randomstring=require('randomstring')
const {sendMail}=require(path.resolve(global.basedir,'core','util','mail.js'))
const {hash,encode}=require(path.resolve(global.basedir,'core','util','encrypt.js'))
const reply=require(path.resolve(global.basedir,'core','common','reply.js'))

// 1: request invalid
// 2: credentials invalid
// 3: resource conflict
module.exports=function(req,res,next){
  const code=req.query.code
  const id=req.query.id
  const email=req.body.email
  const username=req.body.username 
  const password=req.body.pass

  return checkRequest()
  .then(handleRequest)
  .catch(handleError)
  .then(()=>{return reply(res)})

  function checkRequest()
  {
    if(req.method=='POST'){
      if(id && code)
        if(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(req.body.password)) return Promise.resolve()
        else return Promise.reject(1)
      else
        if(username && email) return Promise.resolve()
        else return Promise.reject(1)
    }else{
      return Promise.resolve()
    }
  }

  function handleRequest()
  {
    return checkUser()
    .then(finalize)

    function checkUser()
    {
      if(id && code)
        return select('TableUser',['active','password'],'rowid='+id)
        .then(rows=>{
          if(!rows.length) return Promise.reject(2)
          let row=rows[0]
          if(row.active!=0) return Promise.reject(3)
          return hash(code)
          .then(c=>{
            if(row.password!=c) return Promise.reject(4)
          })
        })
      else
        return select('TableUser',['rowid'],'email='+email)
        .then(rows=>{
          if(rows.length) return Promise.reject(3)
        })
    }

    function finalize()
    {
      if(req.method=='GET'){
        res.status(200)
        if(id && code) res.page=path.resolve('oauth','newpass.pug')
        res.page=path.resolve('oauth','newuser.pug')
        return Promise.resolve()
      }else if(req.method=='POST'){
        if(id && code){
          return hash(password)
          .then(p=>{
            return update('TableUser',{password:p,active:1},'rowid='+id)
            .then(changes=>{
              if(!changes) return Promise.reject(4)
            })
          })
        }else{
          code=randomstring.generate({
            length:20,
            charset:'alphabetic'
          })
          return hash(code)
          .then(c=>{
            return insert('TableUser',{
              username:username,
              active:0,
              email:email,
              password:c,
              created_at:new Date().getTime()/1000,
              permission:2
            })
          })
          .then(lastid=>{
            if(!Number.isInteger(lastid)) return Promise.reject(4)
            return mail()
            .then(()=>{
              res.status(200)
            })

            function mail(){
              return sendMail({
                title:'Activate your account',
                correspondent:email,
                body:pug.renderFile(path.resolve(__dirname,'activate.pug'),{username:username,lk:req.protocol+'://'+req.hostname+':8080'+req.path+'?id='+lastid+'&code='+code})
              })
            }
          })
        }
      }else{
        res.status(405)
        return Promise.resolve()
      }
    }
  }

  function handleError(e){
    res.status(400)
    switch(e){
      case 1:
        res.body={
          error:'invalid email',
          error_description:'The email cannot be validated'
        }
        break
      case 2:
        res.body={
          error:'invalid username',
          error_description:'The username is of the wrong format'
        }
        break
      case 3:
        res.body={
          error:'user exists',
          error_description:'The username requested already exists'
        }
        break
      case 4:
        res.body={
          error:'email exists',
          error_description:'The email requested is already registered'
        }
        break
      case 5:
        res.body={
          error:'invalid password',
          error_description:'The password submitted is of the wrong format'
        }
        break
      case 6:
        res.body={
          error:'user not found',
          error_description:'The user requested cannot be found'
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
