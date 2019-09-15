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
const dbconfig=path.resolve(global.basedir,'dbconfig.json')

async function connect(){
  fs.readFile(dbconfig,(err,data)=>{
    if(err)
      logger.log({level:'error',message:'Failed reading '+dbconfig+' when update '+JSON.stringify(entries)+' with conditions '+cond+' in '+tbl})
    const db_param=JSON.parse(data)
    if(!(db_param.user&&db_param.password&&db_param.host&&db_param.port&&db_param.dbname))
      logger.log({level:'error',message:'dbconfig file could not be parsed to obj containing enough data'})
    resolve(mysqlx.getSession({user:db_param.user,
                               password:db_param.password,
                               host:db_param.host,
                               port:db_param.port
      })
    )
  })
}

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
        process.exit()
    })
    callback()
  }
}
const logdir=path.resolve(global.basedir,'log')
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
 * Check error file
 *   if not accessible, print error and hang
 * Check database configuration file
 *   if not present, try create default
 *     if creation failed, throw error
 * Check db tables
 *   if not present, try create empty ones
 *   if present with wrong columns, throw error
 */
function init(){
  var info={}
  info.basedir=true
  info.errfile=true       // info.errfile: error file accessibility
  info.dbconfig=true      // info.dbconfig: dbconfig file accessibility and validity
  info.db=true            // info.db: db connectivity and table validity
  global.basedir=findBaseDir()
  // Check base directory(where the main process is located)
  if(!basedir)
    exit('Root directory could not be found')
  // Check log dir
  try{
    fs.accessSync(logdir,fs.constants.F_OK|fs.constants.W_OK)
  }catch(e){
    error('Log directory '+logdir+' is not accessible')
  }
  // Check error log file
  try{
    fs.accessSync(errdir,fs.constants.F_OK|fs.constants.W_OK)
  }catch(e){
    try{
      fs.writeFileSync(errdir,'','w')
      fs.accessSync(errdir,fs.constants.F_OK|fs.constants.W_OK)
    }catch(er){
      exit('Failed to open '+errdir+'. '+er.message)
    }
  }
  // Check dbconfig accessibility
  try{
    fs.accessSync(dbconfig,fs.constants.F_OK|fs.constants.W_OK)
  }catch(e){
    try{
      fs.writeFileSync(dbconfig,'')
    }catch(er){
      exit('dbconfig file '+dbconfig+' not accessible')
    }
  }
  // Check dbconfig validity
  //
  // dbname: schema name
  // user: username for schema
  // password: password for schema
  // host: host of database
  // port: listening port of the database
  // head: collection name for metadata
  //       {alias:shortname,
  //        name:table/collection name,
  //        type:sql/nosql,
  //        col:{colname:type} (if sql)
  //        }
  //
  // Check DB validity
  // 1. Check DB existance
  // 2. Check Head existance
  // 3. Check Table/Collection existance/validity
  try{
    var dbparam=JSON.parse(fs.readFileSync(dbconfig))
    if(!(db_param.user&&db_param.password&&db_param.host&&db_param.port&&db_param.dbname&&db_param.head)){
      fs.writeFileSync(dbconfig,'{"dbname":"HomeSite","user":"homesite","password":"123456","host":"localhost","port":"33060","head":"CollectionMeta"','w')
      dbparam=JSON.parse(fs.readFileSync(dbconfig))
    }
    connect()
      .then((session)=>{
        // Check schema. terminate if not accessible
        var schema=session.getSchema(dbparam.dbname)
        schema
          .existsInDatabase()
          .then((flag)=>{
            if(flag){
              resolve(schema)
            }else{
              resolve(await session.createSchema(dbparam.dbname)
                .then((schema)=>{
                  resolve(schema)
                })
                .catch((err)=>{
                  exit('Failed to create database')
                })
              )
            }
          })
          .then((schema)=>{
            // Check Head
            var head=schema.getCollection(dbparam.head)
            head.existsInDatabase()
              .then((flag)=>{
                if(flag)
                  resolve(head)
                else
                  resolve(await schema.createCollection(dbparam.head)
                    .then((colle)=>{
                      resolve(colle)
                    })
                    .catch((err)=>{
                      exit('Failed to create collection '+dbparam.head)
                    })
                  )
              })
          })
          .then((colle)=>{
            // Check SQL tables
            colle
              .find('type="sql"')
              .execute((doc)=>{
                if(!(doc.name&&doc.col&&doc.alias))
                  exit('Inconsistancy found in SQL table '+JSON.stringify(doc))
                try{
                  session.sql('SELECT * FROM '+doc.name+' LIMIT 1').execute((row)=>{},(meta)=>{
                  })
                }catch(e){
                  exit('Inconsistancy found in SQL table '+JSON.stringify(doc))
                }
              })
          })
          .catch((err)=>{
            exit('Failed to connect to database')
          })
      })
      .catch((err)=>{
        error('Failed to create session')
      })
    function exit(message){
      console.log(message)
      process.exit()
    }
  }catch(e){
    error()
  }
}
function findBaseDir(){
  const files=['server.js','package.json']
  const dirs=['core','node_modules','views']
  let curdir=__dirname
  var result=false
  try{
    while(!result){
      let flag=true
      files.forEach((file)=>{
        const filename=path.resolve(curdir,file)
        if(!(fs.existsSync(filename)&&fs.statSync(filename).isFile()))
          flag=false
      })
      dirs.forEach((dir)=>{
        const dirname=path.resole(curdir.dir)
        if(!(fs.existsSync(dirname)&&fs.statSync(dirname).isDirectory()))
          flag=false
      })
      if(!flag)
        curdir=path.resolve(curdir,'..')
      else
        result=curdir
    }
  }catch(e){
    result=false
  }
  return result
}

module.exports={
  logger:logger,
  sql:{select:select,
       update:update,
       addRow:addRow},
  nosql:{},
  init:init
}
