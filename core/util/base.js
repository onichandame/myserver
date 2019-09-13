/* Basic database actions and all logger functions
 * Some initiation at server startup
 */
const path=require('path')
const winston=require('winston')
const mysqlx=require('@mysql/xdevapi')
const sqlite3=require('sqlite3').verbose()
const db_param=require(path.resolve(__dirname,"db.js"))
const fs=require('fs')
const pug=require('pug')

const dbconfig=path.resolve(__dirname,'dbconfig.json')

/* Database. Only basic operations
 * select(tbl,[targets],'condition'/{condition},callback(err,row))
 * add(tbl,[{entries}],callback(err,lastID))
 * update(tbl,{target},'condition'/{condition},callback(err,lastID))
 */
async function select(tbl,target,cond,callback){
}
async function add(tbl,row,callback){
  fs.readFile(dbconfig,(err,data)=>{
    if(err)
      logger.log({level:'error',message:'Failed reading '+dbconfig+' when add '+JSON.stringify(row)+' to '+tbl})
    const db_param=JSON.parse(data)
    mysqlx.getSession({user:db_param.user,
                       password:db_param.password,
                       host:db_param.host,
                       port:db_param.port
    })
    .then((session)=>{
      let tbl=session.getSchema(db_param.dbname).getTable(tbl)
      if(Array.isArray(row)){
        if(row.length<1)
          callback({code:1,message:'empty'})
        tbl.insert(Object.keys(row[0]))
        row.forEach((one)=>{
          tbl.values(Object.values(one))
        })
      }
    })
    if(Array.isArray(row)){
      row.forEach((one)=>{
        addRow(one)
      })
    }else{
      addRow(row)
    }
    if(!(db_param && db_param.dbname && db_param.url && db_param.head))
  })
}

/* logger
 *
 * debug: verbose when not in production
 * info: things worth storage for future analysis
 * warn: non-blocking error
 * error: fatal error causing service to shutdown
 *
 * Storage:
 * 1. Database: (info) (warn)
 * 2. File: (error)
 * 3: Console: (debug)
 */
const levels={error:0,
              warn:1,
              info:2,
              debug:3
}
// Log transport for writing to database
//
// Table: TableLog
//
// rowid(INT NOT NULL)
// level(INT NOT NULL)
// datetime(TEXT NOT NULL)
// message(TEXT NOT NULL)
// request(TEXT)
// origin(TEXT)
const Transport=require('winston-transport')
const util=require('util')
class MyLogger extends Transport{
  constructor(opts){
    super(opts)
  }
  log(info,callback){
    setImmediate(()=>{
      const lvl=info.level
      info.level=levels[info.level]
      if(info.level>2)
        console.log('['+lvl+'] '+info.message)
      else if(info.level<1)
        fs.writeFileSync(errdir,'['+lvl+']'+info.message)
      else
        add('TableLog',info)
      if(info.level>2)
        process.exit(3)
    })
    callback()
  }
}
const logdir=path.resolve(__basedir,'log')
const errdir=path.resolve(logdir,'error.log')
const logger=winston.createLogger({levels:levels,
                                 format:info_format,
                                 transports:[
                                   new MyLogger()
                                 ],
                                 exitOnError:true,
                                 silent:false
})

const {createLogger,format,transports}=require('winston')
const {combine,timestamp,label,printf}=format
const logger={info:winston.createLogger({
  level:'info',
  format:winston.format.json()
})}

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

/* initiation
 */
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

module.exports={
  validateSid:validateSid,
  sql:{select:select},
  nosql:{},
  init:init
}
