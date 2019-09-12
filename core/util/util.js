/* Database and Logger
 * Some initiation at server startup
 */
const path=require('path')
const winston=require('winston')
const mysqlx=require('@mysql/xdevapi')
const sqlite3=require('sqlite3').verbose()
const db_param=require(path.resolve(__dirname,"db.js"))
const fs=require('fs')
const pug=require('pug')

function validateSid(sid){
  let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
    if(err){
      return err
    }
  })
  db.serialize(function(){
    db.each('SELECT uid,creation_date,expired_in FROM '+db_param.tbl.session.name+' WHERE rowid='+sid,(err,row)=>{
      if(err)
        return err
      var cd=row.creation_date
      const ex=row.expired_in
      cd.setTime(cd.getTime()+ex)
      let flag=false
      if(cd.getTime()<new Date().getTime())
        flag=false
      else
        flag=true
      if(flag)
        return row.uid
      else
        return flag
    })
  })
}

const dbconfig=path.resolve(__dirname,'dbconfig.json')

async function select(target,cond,tbl,callback){
}

function init(){
  if(fs.existsSync(dbconfig)){
    db_param=JSON.parse(fs.readFileSync(dbconfig))
    if(!(db_param && db_param.dbname && db_param.url && db_param.head))
      initDB()
    else
      checkCon()
    function checkCon(){
      try{
        const session=await mysqlx.getSession(db_param.url)
      }catch(e){
      }
    }
  }else{
  }
}

const logger={info:winston.createLogger({
  level:'info',
  format:winston.format.json()
})}

module.exports={
  validateSid:validateSid,
  sql:{select:select},
  nosql:{},
  init:init
}
