/* user clicks the url in email 'activate?code=*****
 * server receives the code and decode the jwt
 * server validates the email, creation_date and secret and returns pages expressing the result
 * server displays the init pass page at 'activate?id=***'
 * user fills the form and submit
 * server updates the password and redirects the user to login page
 */
module.exports=function(req,res,next){
  const path=require('path')
  const randomString=require('randomstring')
  const db_param=require(path.resolve(__dirname,"db.js"))
  const sqlite3=require('sqlite3').verbose()
  const decode=require(path.resolve(__dirname,'util.js')).decodeJWT
  const code=req.query.code
  const id=req.query.id
  if(!(id===undefined)){
    if(req.method=='GET'){
      res.status(200)
      res.render('init.pass.pug')
    }else if(req.method=='POST'){
      const password=req.body.pass
      var regex=/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/
      if(!regex.test(password))
        return next({code:422})
      let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
        if(err){
          return next({code:500,err:err})
        }
      })
      db.serialize(function(){
        const hash=require(path.resolve(__dirname,'util.js')).hashCode
        db.run('UPDATE '+db_param.tbl.user.name+' SET active=1,password=\''+hash(password)+'\' WHERE rowid='+id,(err)=>{
          if(err){
            return next({code:500,err:err})
          }
        })
        .get('SELECT COUNT(rowid) as num FROM '+db_param.tbl.user.name+' WHERE active=1',(err,row)=>{
          if(err)
            return next({code:500,err:err})
          if(row.num==1){
            db.serialize(function(){
              db.run('INSERT INTO '+db_param.tbl.appadmin.name+' (rowid,level) VALUES ('+id+',0)',(err)=>{
                if(err){
                  return next({code:500,err:err})
                }
                res.status(200)
                res.send()
              })
            })
          }else{
            res.status(200)
            res.send()
          }
        })
      })
    }else{
      return next({code:405})
    }
  }else if(!(code===undefined)){
    if(req.method!='GET')
      return next({code:405})
    decode(code,(err,data)=>{
      if(err)
        return next({code:500,err:err})
      const creation_date=data.creation_date
      const secret=data.secret
      const email=data.email
      let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
        if(err)
          return next({code:500,err:err})
      })
      db.serialize(function(){
        db.each('SELECT rowid,password,creation_date FROM '+db_param.tbl.user.name+' WHERE email=\''+email+'\'',(err,row)=>{
          if(err)
            return next({code:500,err:err})
          if(secret==row.password&&creation_date==row.creation_date){
            res.status(302)
            res.set('Location','/activate?id='+row.rowid)
            res.send()
          }else{
            return next({code:422})
          }
        })
      })
    })
  }else{
    return next({code:422})
  }
}
