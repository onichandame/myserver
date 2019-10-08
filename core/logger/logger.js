const path=require('path')
const fs=require('fs')
const Transport=require('winston-transport')
const winston=require('winston')
const util=require('util')
const insert=require(path.resolve(basedir,'core','db','insert.js'))
const config=require(path.resolve(__dirname,'config.js'))

/* logger
 *
 * debug: verbose when not in production
 * info: things worth storage for future analysis
 * warn: non-blocking error
 * error: fatal error causing service to shutdown
 */
const levels={error:0,
              warn:1,
              info:2,
              debug:3
}

class MyLogger extends Transport{
  constructor(opts){
    super(opts)
  }
  log(obj){
    return config()
    .then((c)=>{
      return insert(c.name,obj)
    })
  }
  compliment(message,lvl){
    return {message:message,level:levels.lvl,timestamp:new Date().toString()}
  }
  debug(message){
    return log(compliment(message,'debug'))
  }
  info(message){
    return log(compliment(message,'info'))
  }
  warn(message){
    return log(compliment(message,'warn'))
  }
  error(message){
    const obj=compliment(message,'error')
    console.log(obj)
    return log(obj)
    .catch((err)=>{
      fs.write(path.resolve(global.basedir,'error.log'),obj,(err)=>{
        return exit()
      })
      return exit()
    })
  }
  exit(){
    process.exit(1)
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

module.exports=logger
