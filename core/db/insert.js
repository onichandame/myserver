const path=require('path')
const connect=require(path.resolve(__dirname,'connect.js'))

function insert(tbl,row){
  function getsql(){
    function getkv(){
      var key='('
      var val='('
      for(let [k,v] of Object.entries(row)){
        key+=k+','
        val+=v+','
      }
      key=key.slice(0,-1)+')'
      val=val.slice(0,-1)+')'
      return [key,val]
    }
    const kv=getkv()
    return `INSERT INTO ${tbl} ${kv[0]} VALUES ${kv[1]}`
  }
  return connect()
  .then((db)=>{
    db.serialize(()=>{
      db.run(getsql(),(err)=>{
        err ? throw err : return this.lastID
      })
    })
  })
}

module.exports=insert
