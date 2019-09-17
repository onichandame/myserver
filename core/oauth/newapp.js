/* handles 2 requests
 * 1. GET: displays app registration form if user is validated
 * 2. POST: register app
 */
const path=require('path')
const randomString=require('randomstring')
const {validate}=require(path.resolve(__dirname,'..','util','validate.js'))
const sender=require(path.resolve(__dirname,'..','util','mail.js')).sendApp
const {select,insert}=require(path.resolve(__dirname,'..','util','db.js'))
module.exports=function(req,res,next){
  const {sid,dat}=req.cookies('sid')
  validate(sid,dat,(result)=>{
    if(!result)
      return next({code:401})
    const {username,uid,email}=result
    if(req.method=='GET'){
        select('appadmin',['level'],'rowid='+uid,(row)=>{
          if(row.level>1)
            return next({code:403})
          res.status(200)
          res.locals.page='core/oauth/newapp.pug'
          return next()
        },(num)=>{
          if(num<1)
            return next({code:403})
        })
    }else if(req.method=='POST'){
      const name=req.body.name
      const callback=req.body.callback
      const type=req.body.type
      let valid=true
      if(name.length<3)
        valid=false
      if(!/[^\s]/.test(callback))
        valid=false
      if(!(type==0||type==1))
        valid=false
      if(!valid)
        return next({code:422})
      select('app',['COUNT(rowid) as num'],'name=\''+name+'\'',(row)=>{
        if(row.num>0)
          return next({code:303})
        select('app',['COUNT(rowid) as num'],'permission=3',(row)=>{
          var permission=1
          if(row.num<1)
            permission=3
          insert('app',{name:name,redirect_uri:callback,secret:randomstring.generate({length:20,charset:'alphabetic'}),permission:permission,type:type},(lastID)=>{
            select('app',['secret','permission'],'rowid='+lastID,(row)=>{
              sender({email:email,username:username,name:name,secret:row.secret,permission:row.permission,redirect_uri:callback})
              res.status(200)
              res.locals.page='core/oauth/success.newapp.pug'
              return next()
            })
          })
        })
      })
    }else{
      return next({code:405})
    }
  })
}
