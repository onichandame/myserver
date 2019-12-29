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
  return parseRequest()
  .then(()=>{return okitchen.common.reply(res)})

  function parseRequest(){
    if(req.method=='GET') return displayForm()
    else if(req.method=='POST') return login()
    else return finalize(1)

    function displayForm(){
      res.status(200)
      res.page='auth/login.pug'
      return Promise.resolve()
    }

    async function login(){
      const uname=req.body.uname | ''
      const password=req.body.password | ''
      if(!(uname && password)) return finalize(2)
      return checkuser({uname:uname,email:uname,password:password})
      .then(row=>{
        if(!row) return finalize(3)
        else return opensession(row.user)
        .then(key=>{return finalize(key)})
      })

    }
  }
  async function finalize(flag){
    if(flag==1){
      res.status(400)
      res.body={errno:101,errmsg:`method ${req.method} is not recognized`}
    }else if(flag==2){
      res.status(400)
      res.body={errno:102,errmsg:'form not complete'}
    }else if(flag==3){
      res.status(401)
      res.body={errno:103,errmsg:'credential invalidated'}
    }else{
      res.status(200)
      res.body=flag
    }
    return Promise.resolve()
  }
}
