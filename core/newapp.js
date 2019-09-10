const path=require('path')
const db_param=require(path.resolve(__dirname,"db.js"))
const sqlite3=require('sqlite3').verbose()
module.exports=function(req,res,next){
  if(req.method=='GET'){
    const sid=req.cookies('sid')
    if(!sid)
      next({code:401})
    let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
      if(err){
        return next({code:500})
      }
    })
    db.serialize(function(){
      db.each('SELECT creation_date,expired_in FROM '+db_param.tbl.session.name+' WHERE rowid='+sid,(err,row)=>{
        var cd=row.creation_date
        const ex=row.expired_in
        cd.setTime(cd.getTime()+ex)
        if(cd.getTime()<new Date().getTime()){
          if(req.query.first){
            db.get('SELECT COUNT(rowid) as num FROM '+db_param.tbl.app.name,(err,row)=>{
              if row.num<1{
                res.status(200)
                res.render('newapp.pug')
              }else{
                next({code:405})
              }
            })
          }else{
            next({code:405})
          }
        }
      })
    })
    res.status(200)
    res.render('newapp.pug')
  }else if(req.method=='POST'){
    const name=req.body.name
    const callback=req.body.callback
    const type=req.body.type
  }else{
    return next({code:405})
  }
}
