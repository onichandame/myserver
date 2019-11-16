const path=require('path')
const fs=require('fs')
const fsp=fs.promises

class Config{
  constructor(){

    if(!Config.instance){
      this._data_={}
      Config.instance=this
      set('basedir',path.resolve(__dirname,'..'))
      set('filepath',path.resolve(get('basedir'),'config.json'))

      this.read=function(basedOnFile){
        return checkFile()
        .then(readFile)
        .then(populate)

        function checkFile(){
          return fsp.access(get('filepath'),fs.constants.R_OK | fs.constants.W_OK)
          .then(()=>{
            return fsp.stat(get('filepath'))
          })
          .then(stat=>{
            return stat.isFile() ? null : Promise.reject(stat.isDirectory() ? 1 : null)
          })
          .catch(e=>{
            if(e && e.code=='ENOENT') return fsp.writeFile(get('filepath'),'')
            else if(e==1) return fsp.rmdir(get('filepath'),{recursive:true}).then(()=>{return fsp.writeFile(get('filepath'),'')})
            else throw err
          })
        }

        function readFile(){
          return fsp.readFile(get('filepath'),'utf8')
          .then(data=>{
            return JSON.parse(data)
          })
        }

        function populate(obj){
          Object.keys(obj).forEach(key=>{
            if(key in this._data_ && !basedOnFile) continue
            this._data_[key]=obj[key]
          })
          this.initiated=true
          return Promise.resolve()
        }
      }

      this.write=function(){
        return fsp.writeFile(get('filepath'),JSON.stringify(this._data_))
      }
    }
    return Config.instance
  }
  
  reset(){
    return new Promise((resolve,reject)=>{
      return this.read(true)
    })
  }

  get(key){
    let read=this.initiated ? Promise.resolve() : this.read()
    read.then(()=>{
      return this._data_[key]
    })
  }

  set(key,val){
    return new Promise((resolve,reject)=>{
      this._data_[key]=val
      return resolve()
    })
    .then(this.write)
  }
}

const config=new Config()
Object.freeze(config)

module.exports=config
