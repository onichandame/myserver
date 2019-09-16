const path=require('path')
const fs=require('fs')
const Transport=require('winston-transport')
const util=require('util')
const {exit,getConfig}=require(path.resolve(__dirname,'base.js'))
const {select,addTable,checkTable,dropTable}=require(path.resolve(__dirname,'db.js'))

/* logger
 *
 * debug: verbose when not in production
 * info: things worth storage for future analysis
 * warn: non-blocking error
 * error: fatal error causing service to shutdown
 *
 * Storage:
 * 1. Database: (info) (warn) (error)
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
class MyLogger extends Transport{
  constructor(opts){
    super(opts)
  }
  log(info,callback){
    setImmediate(()=>{
      const lvl=info.level
      info.level=levels[info.level]
      info.timestamp=new Date().toString()
      if(info.level>2)
        console.log('['+new Date().toString()+'] '+info.message)
      else
        insert('log',info,()=>{
          callback()
        })
    })
  }
  info(message,callback){
    log({level:info,message:message})
    return callback()
  }
  error(message,callback){
    log({level:error,message:message})
    if(callback)
      return callback()
    else
      exit('[Error] '+message)
  }
}
const logger=winston.createLogger({
  levels:levels,
  transports:[
    new MyLogger()
  ],
  exitOnError:true,
  silent:false
})

async function checkConfig(callback){
  getConfig((param)=>{
    const logparam=param.log
    if(!(logparam&&logparam.name&&logparam.cols))
      exit('Failed to retrieve schema of logger')
    else
      return callback(logparam)
  })
}

async function initLog(callback){
  checkConfig((param)=>{
    param.alias='log'
    checkTable(param,(flag)=>{
      if(!flag)
        exit('Failed to create Table for Logger')
      return callback()
    })
  })
}
module.exports={
  initLog:initLog,
  logger:logger
}
