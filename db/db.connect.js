module.exports=function(dbname){
  const sqlite3=require('sqlite3').verbose()
  const path=require('path')
  let db=new sqlite3.Database(path.resolve(__dirname,dbname),sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,(err)=>{
    if (err)
      console.error(err.message)
    else
      console.log('connected to meta sql')
  })
  db.serialize(function(){
    db.run('CREATE TABLE IF NOT EXISTS TableUser (username TEXT NOT NULL' +
                                                 'password NOT NULL' +
                                                 'series TEXT' +
                                                 'volumn'
    )
  })
}
