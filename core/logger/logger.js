const path=require('path')
const fs=require('fs')
const fsp=require('fs').promises

const insert=require(path.resolve(global.basedir,'core','db','insert.js'))
const config=require(path.resolve(__dirname,'config.js'))

/* logger
 *
 * debug: verbose when not in production
 * info: things worth storage for future analysis
 * warn: non-blocking error
 * error: fatal error causing service to shutdown
 */
class Logger{
  constructor(){
    this.levels={error:0,
                 warn:1,
                 info:2,
                 debug:3
    }
    if(!Logger.instance) Logger.instance=this
    return Logger.instance
  }

  log(lvl,msg){
    if(typeof lvl==='string' && lvl in Object.keys(this.levels)) lvl=this.levels[lvl]
    else if(!(Number.isInteger(lvl) && lvl in Object.values(this.levels))) return error(`undefined level ${lvl} received with message ${msg}`)
    return config()
    .then(c=>{
      return insert(c.name,compliment(lvl,msg))
    })
  }

  compliment(lvl,message){
    return {message:message,level:lvl,timestamp:new Date().getTime()/1000}
  }

  debug(message){
    return typeof v8debug ==='object' ? log('debug',message) : Promise.resolve()
  }

  info(message){
    return log('info',message)
  }

  warn(message){
    return log('warn',message)
  }

  error(message){
    const obj=compliment('error',typeof message==='object' ? message.message : typeof message==='string' ? message : 'undefined message')
    console.log(obj)
    return writeFile()
    .then(writeDB)
    .finally(terminate)

    function writeFile(){
      return config()
      .then(c=>{
        return fsp.writeFile(c.errfile,JSON.stringify(obj))
      })
    }

    function writeDB(){
      return config()
      .then(c=>{
        return insert(c.name,obj)
      })
    }

    function terminate(){
      return new Promise((resolve,reject)=>{
        process.exit(1)
        return resolve()
      })
    }
  }
}

const logger=new Logger()
Object.freeze(Logger)

module.exports=logger
