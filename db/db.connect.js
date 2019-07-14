const sqlite3=require('sqlite3').verbose()
const path=require('path')
let dbpath='db.meta.sql'
let db=new sqlite3.Database(path.resolve(__dirname,dbpath),sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,(err)=>{
  if (err)
    console.error(err.message)
  else
    console.log('connected to meta sql')
})
db.serialize(function(){
  db.run('CREATE TABLE IF NOT EXISTS TableMeta (id INT PRIMARY KEY,' +
                                                'path TEXT NOT NULL' +
                                                'dimension INT NOT NULL' +
                                                'series TEXT' +
                                                'volumn'
  )
})
