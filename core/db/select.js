const path=require('path')
const connect=require(path.resolve(__dirname,'connect.js'))

function select(tbl,target,cond,handle){
  function getsql(){
    function getkv(){
      var result=''
      target.forEach((item)=>{
        result+=item+','
      })
      return result.slice(0,-1)
    }
    return `SELECT ${getsql()} FROM ${tbl} WHERE ${cond}`
  }
  return connect()
  .then((db)=>{
    db.serialize(()=>{
      db.each(getsql(),(err,row)=>{
        err ? throw err : handle(row)
      },(err,num)=>{
        err ? throw err : return num
      })
    })
  })
}

module.exports=select
