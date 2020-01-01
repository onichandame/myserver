const path=require('path')

const {insert,select}=require(path.resolve(__dirname,'..','core.js')).db
const checkToken=require(path.resolve(__dirname,'common','checkToken.js'))
const {reply}=require(path.resolve(__dirname,'..','core.js')).common
const logger=require(path.resolve(__dirname,'..','core.js')).logger

module.exports=function(req,res,next){

  const id=req.body.id

  return checkToken(req).catch(()=>{return Promise.reject(1)})
  .then(handle)
  .catch(error)
  .then(reply)

  function handle(token){
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
    if(s<2) return Promise.reject(2)
    return select('TableUser',['rowid'],`rowid=${id}`)
    .then(rows=>{
      if(!rows.length) return Promise.reject(3)
    })
    .then(()=>{return drop('TableUser',`rowid=${id}`)})
    .then(()=>{res.status(200)})
  }

  function error(e){
    let l=logger.info
    return convertError()
    .then(l)

    function convertError(){
      let m=''
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
            error:'unauthorised token',
            error_description:'The token received was not authorised for this request'
          }
          break
        case 3:
          res.body={
            error:'user not found',
            error_description:'The user being deleted is not found'
          }
          break
        default:
          res.status(500)
          res.body={
            error:'unknwon error',
            error_description:'undefined error!'
          }
          l=logger.warn
          break
      }
      m=Number.isInteger(e) ? res.body.error_description : e
      return Promise.resolve(m)
    }
  }
}
