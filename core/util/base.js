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
 *
 * Roadmap:
 * 1. add/update multiple rows
 * 2. add/update provide lastID to callback
 *
 * select(tbl,[targets],'condition',callback(err,row))
 * add(tbl,{entries},callback(err))
 * update(tbl,{target},'condition'/{condition},callback(err))
 */
async function update(tbl,entries,cond,callback){
  fs.readFile(dbconfig,(err,data)=>{
    if(err)
      logger.log({level:'error',message:'Failed reading '+dbconfig+' when update '+JSON.stringify(entries)+' with conditions '+cond+' in '+tbl})
    const db_param=JSON.parse(data)
    if(!(db_param.user&&db_param.password&&db_param.host&&db_param.port&&db_param.dbname))
      logger.log({level:'error',message:'dbconfig file could not be parsed to obj containing enough data'})
    mysqlx.getSession({user:db_param.user,
                       password:db_param.password,
                       host:db_param.host,
                       port:db_param.port
    })
    .then((session)=>{
      let upd=session
        .getSchema(db_param.dbname)
        .getTable(tbl)
        .update(cond)
      for(const [key,val] of entries.entries()
        upd.set(key,val)
      return upd.execute(()=>{
          return callback(null)
        })
    })
    .catch((err)=>{
      return callback(err)
    })
  })
}
async function select(tbl,target,cond,callback){
  fs.readFile(dbconfig,(err,data)=>{
    if(err)
      logger.log({level:'error',message:'Failed reading '+dbconfig+' when select '+JSON.stringify(target)+' with conditions '+cond+' in '+tbl})
    const db_param=JSON.parse(data)
    if(!(db_param.user&&db_param.password&&db_param.host&&db_param.port&&db_param.dbname))
      logger.log({level:'error',message:'dbconfig file could not be parsed to obj containing enough data'})
    mysqlx.getSession({user:db_param.user,
                       password:db_param.password,
                       host:db_param.host,
                       port:db_param.port
    })
    .then((session)=>{
      return session
        .getSchema(db_param.dbname)
        .getTable(tbl)
        .select(target)
        .where(cond)
        .execute((row)=>{
          return callback(null,row)
        })
    })
    .catch((err)=>{
      return callback(err)
    })
  })
}
async function addRow(tbl,row,callback){
  fs.readFile(dbconfig,(err,data)=>{
    if(err)
      logger.log({level:'error',message:'Failed reading '+dbconfig+' when add '+JSON.stringify(row)+' to '+tbl})
    const db_param=JSON.parse(data)
    if(!(db_param.user&&db_param.password&&db_param.host&&db_param.port&&db_param.dbname))
      logger.log({level:'error',message:'dbconfig file could not be parsed to obj containing enough data'})
    mysqlx.getSession({user:db_param.user,
                       password:db_param.password,
                       host:db_param.host,
                       port:db_param.port
    })
    .then((session)=>{
      return session
        .getSchema(db_param.dbname)
        .getTable(tbl)
        .insert(Object.keys(row))
        .values(Object.values(row))
        .execute()
    })
    .then(()=>{
      return callback()
    })
    .catch((err)=>{
      return callback(err)
    })
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
        addRow('TableLog',info)
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
 *
 */
function init(){
  var info={}
  if(fs.existsSync(dbconfig)){
    info.dbconfig=true
    db_param=JSON.parse(fs.readFileSync(dbconfig))
    if(db_param && db_param.dbname && db_param.url && db_param.head)
      checkCon((result)=>{
        info.dbconfig=result
      })
    else
      initDBConfig()
    function checkCon(){
      mysqlx.getSession({user:db_param.user,
                         password:db_param.password,
                         host:db_param.host,
                         port:db_param.port
      })
      .then((session)=>{
        var schema=session.getSchema(db_param.dbname)
        schema.existsInDatabase()
          .then((flag)=>{
            if(flag)
              info.db=true
            else
              createDB()
          })
      })
      .catch((err)=>{
        info.db=false
      })
    }
    function createDB(){
      mysqlx.getSession({user:db_param.user,
                         password:db_param.password,
                         host:db_param.host,
                         port:db_param.port
      })
      .then((session)=>{
        return 
      })
    }
    function initDBConfig(){
    }
  }else{
    info.dbconfig=false
  }
}

module.exports={
  logger:logger,
  sql:{select:select,
       update:update,
       addRow:addRow},
  nosql:{},
  init:init
}
