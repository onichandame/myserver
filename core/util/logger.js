const path=require('path')
const fs=require('fs')
const config=path.resolve(global.basedir,'config.json')
const insert=require('db.js').insert
const Transport=require('winston-transport')
const util=require('util')

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
        insert('TableLog',info)
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

