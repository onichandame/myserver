/* handles 2 requests
 * 1. GET: displays app registration form if user is validated
 * 2. POST: register app
 */
const path=require('path')
const insert=require(path.resolve(global.basedir,'core','db','insert.js'))
const select=require(path.resolve(global.basedir,'core','db','select.js'))
const randomstring=require('randomstring')
const {sendMail}=require(path.resolve(global.basedir,'core','util','mail.js'))
const {hash}=require(path.resolve(global.basedir,'core','util','encrypt.js'))
const checkToken=require(path.resolve(__dirname,'common','checkToken.js'))
const reply=require(path.resolve(global.basedir,'core','common','reply.js'))

module.exports=function(req,res,next){
  return checkToken(req)
  .catch(()=>{return Promise.reject(1)})
  .then(handle)
  .catch(handleError)
  .then(reply)

  function handle(token){
    if(req.method=='GET')
      return render()
    else if(req.method=='POST')
      return parseParam()
      .then(validate)
      .then(register)
      .then(send)

    function render(){
      res.status(200)
      res.page=path.resolve('oauth','newapp.pug')
      return Promise.resolve()
    }

    function parseParam(){
      let p={
        name:req.body.name,
        url:req.body.callback,
        type:req.body.type
      }
      return Promise.resolve(p)
    }

    function validate(param){
      return select('TableApp',['name','redirect_uri','approved_by'],`name='${param.name}' OR redirect_uri='${url}'`)
      .then(rows=>{
        if(rows.length<1) return Promise.reject(2)
        if(!(param.name && param.url)) return Promise.reject(3)
        return param
      })
    }

    function register(param){
      param.secret=randomstring.generate({
        length:20,
        charset:'alphabetic'
      })
      return hash(param.secret)
      .then(h=>{
        param.redirect_uri=param.url
        param.registered_by=token.uid
        param.permission=1
        return insert('TableApp',param)
        .then(()=>{return param})
      })
    }

    function send(param){
      return select('TableUser',['email','username'],'rowid='+token.uid)
      .then(rows=>{
        if(rows.length<1) return Promise.reject(1)
        param.username=rows[0].username
        return sendMail({
          title:'App registered',
          correspondent:rows[0].email,
          body:pug.render(path.resolve(__dirname,'newapp.pug',param))
        })
      })
    }
  }

  function handleError(e){
    res.status(400)
    switch(e){
      case 1:
        res.body={
          error:'invalid token',
          error_description:'The token cannot be validated'
        }
        break
      case 2:
        res.body={
          error:'conflict',
          error_description:'The name or redirect uri has already been registered'
        }
        break
      case 3:
        res.body={
          error:'invalid input',
          error_description:'The input data is invalid(empty)'
        }
        break
      default:
        res.status(500)
        res.body={
          error:'unknown error',
          error_description:'an unknown internal error occured'
        }
        break
    }
  }
}
