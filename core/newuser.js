/* user opens '/newuser'
 * server returns page with fields 'email' 'given_name' family_name' and 'name_order'
 * user fills the fields and xhr post to current url
 * server validates the info and return http status
 * server encodes the email, creation_date and secret to jwt and sends the code to email asyncally
 * browser receives the status code and displays the message
 */
module.exports=function(req,res,next){
  const path=require('path')
  const qry=req.query
  const fs=require('fs')
  const sqlite3=require('sqlite3').verbose()
  const {SHA3}=require('sha3')
  const randomString=require('randomstring')
  const db_param=require(path.resolve(__dirname,"db.js"))
  if(req.method=='GET'){
    res.render('newuser.pug')
  // post with given name, surname, name order, email
  }else if(req.method=='POST'){
    const family_name=req.body.family_name
    const given_name=req.body.given_name
    const email=req.body.email
    const name_order=req.body.name_order
    if(!(family_name&&given_name&&email&&(name_order==0||name_order==1)))
      return next({code:400})
    let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
      if(err)
        return next({code:500})
    })
    db.serialize(function(){
      db.each('SELECT rowid FROM '+db_param.tbl.user.name+' WHERE email=\''+email+'\'',(err,row)=>{
        if(err)
          return next({code:500})
        return next({code:303})
      })
      .run('INSERT INTO '+db_param.tbl.user.name+' (given_name,family_name,name_order,password,active,email,creation_date) VALUES ($given_name,$family_name,$name_order,$password,$active,$email,$creation_date)',{$given_name:given_name,
      $family_name:family_name,
      $name_order:name_order,
      $password:randomString.generate({length:20,
      $charset:'alphabetic'}),
      $active:0,
      $email:email,
      $creation_date:new Date().toString()},function(err){
        if(err)
          return next({code:500})
        let sender=require(path.resolve(__dirname,'util.js')).sendActivationCode
        db.each('SELECT email,given_name,creation_date,password FROM '+db_param.tbl.user.name+' WHERE rowid='+this.lastID,(err,row)=>{
          if(err){
            console.log(err)
            return next({code:500})
          }
          sender({secret:row.password,
          email:row.email,
          baseurl:req.protocol+'://'+req.hostname+':8080/activate',
          given_name:row.given_name,
          creation_date:row.creation_date})
        })
        res.status(200)
        if(req.xhr)
          res.send()
        else
          res.render('success.newuser.pug')
      })
    })
  }
}
