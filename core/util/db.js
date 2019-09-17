/* Database. Only basic operations without wrapped log utility
 *
 * select(tbl,[targets],'condition',callback(row),finish(num)
 * insert(tbl,{info}/[{info}],callback(lastID/[lastIDs]))
 * update(tbl,{entries},'condition',callback())
 */
const path=require('path')
const sqlite3=require('sqlite3').verbose()
const db_param=require(path.resolve(__dirname,"db.js"))
const fs=require('fs')
const {exit,getConfig}=require(path.resolve(__dirname,'base.js'))

async function checkConfig(callback){
  getConfig((dbparam)=>{
    if(!(dbparam.dbpath&&dbparam.dbname&&dbparam.head))
      exit('config file does not have enough database info')
    else
      callback(dbparam)
  })
}
async function connect(callback){
  checkConfig((dbparam)=>{
    var db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
      if(err)
        exit('Failed to connect to SQL database.')
      return callback(db)
    })
  })
}
async function getTableName(alias,callback){
  connect((db)=>{
    checkConfig((dbparam)=>{
      if(alias==dbparam.head)
        return callback(alias)
      db.serialize(()=>{
        db.all('SELECT name,alias FROM '+dbparam.head+' WHERE name=\''+alias+'\' OR alias=\''+alias+'\'',(err,rows)=>{
          if(rows.length<1)
            exit('Failed to find table with alias '+alias)
          var result=''
          for(let row of rows){
            if(row.name==alias){
              result=row.name
              break
            }else if(row.alias==alias){
              result=row.name
            }
          }
          if(result)
            return callback(result)
          else
            exit('Failed to find the name of Table with alias/name '+alias)
        })
      })
    })
  })
}
function serializeQuery(row){
  var keys=Object.keys(row)
  var vals=Object.values(row)
  var keystr='('
  var valstr='('
  var valobj={}
  keys.forEach((key)=>{
    keystr+=key
    keystr+=','
    valstr+='$'+key
    varstr+=','
    valobj['$'+key]=row[key]
  })
  keystr=keystr.slice(0,-1)+')'
  valstr=valstr.slice(0,-1)+')'
  return [keystr,valstr,valobj]
}
async function insert(tbl,info,callback){
  getTableName(tbl,(tblname)=>{
    connect((db)=>{
      function insertRow(row,callback){
        db.serialize(()=>{
          var [keystr,valstr,valobj]=serializeQuery(row)
          db.run('INSERT INTO '+tblname+' '+keystr+' VALUES '+valstr,valobj,(err)=>{
            if(err)
              exit('Failed to insert into '+tblname+' '+JSON.stringify(row))
            return callback(this.lastID)
          })
        })
      }
      if(Array.isArray(info)){
        var lastIDs=[]
        for(const row of info){
          insertRow(row,(lastID)=>{lastIDs.push(lastID)})
        }
        return callback(lastIDs)
      }else{
        insertRow(info,(lastID)=>{return callback(lastID)})
      }
    })
  })
}
async function update(tbl,entries,cond,callback){
  getTableName(tbl,(tblname)=>{
    connect((db)=>{
      db.serialize(()=>{
        var [keystr,valstr,valobj]=serializeQuery(entries)
        var keys=keystr.split(',')
        var str=''
        for(const key of keys){
          str+=key+'=$'+key+','
        }
        str.slice(0,-1)
        db.run('UPDATE '+tblname+' SET '+str+' WHERE '+cond,valobj,(err)=>{
          if(err)
            exit('Failed to update '+tblname+' '+JSON.stringify(entries))
          return callback(this.changes)
        })
      })
    })
  })
}
async function select(tbl,target,cond,callback,finish){
  getTableName(tbl,(tblname)=>{
    connect((db)=>{
      db.serialize(()=>{
        var keystr=''
        target.forEach((key)=>{
          keystr+=key+','
        })
        keystr.slice(0,-1)
        db.each('SELECT '+keystr+' FROM '+tblname+' WHERE '+cond,(err,row)=>{
          if(err)
            exit('Failed to select '+keystr+' from '+tblname)
          return callback(row)
        },(err,num)=>{
          if(err)
            exit('Selection completed but error occurred when selecting '+keystr+' from '+tblname)
          finish(num)
        })
      })
    })
  })
}

async function addTable(alias,name,cols,callback){
  checkConfig((dbparam)=>{
    connect((db)=>{
      db.serialize(()=>{
        var str=''
        for(const key in cols)
          str+=key+' '+cols[key]
        str=str.slice(0,-1)
        db.run('CREATE TABLE IF NOT EXISTS '+name+' '+str,(err)=>{
          if(err)
            exit('Failed to create table '+name)
          insert(dbparam.head,{alias:alias,name:name,cols:JSON.stringify(cols)},(lastID)=>{
            return callback()
          })
        })
      })
    })
  })
}

async function dropTable(name,callback){
  checkConfig((dbparam)=>{
    getTableName(name,(tblname)=>{
      connect((db)=>{
        db.serialize(()=>{
          db.run('DROP TABLE IF EXISTS '+tblname,(err)=>{
            if(err)
              exit('Failed to drop table '+tblname)
            db.run('DELETE FROM '+dbparam.head+' WHERE name=\''+tblname+'\'',(err)=>{
              if(err)
                exit('Failed to drop record of '+tblname+' from metatable')
              return callback()
            })
          })
        })
      })
    })
  })
}

async function checkTable(schema,callback){
  const {name,cols}=schema
  getTableName(name,(tblname)=>{
    connect((db)=>{
      var existingCol=[]
      db.each('PRAGMA table_info(\''+tblname+'\')',(err,row)=>{
        if(err)
          exit('Failed to retrieve table info of '+name)
        const {name,type,notnull}=row
        str=type+(notnull ? ' NOT NULL' : '')
        if(str==cols[name])
          existingCol.push(name)
        else
          exit('Metatable inconsistant with existing table '+tblname)
      },(err,num)=>{
        if(err)
          exit('Failed to iterate all columns of '+name)
        if(num<1){
          addTable(schema.alias,name,cols,()=>{
            return callback(true)
          })
        }else{
          var keys=Object.keys(cols)
          keys.forEach((key)=>{
            if(!existingCol[key])
              return callback(false)
          })
          return callback(true)
        }
      })
    })
  })
}

async function initDB(callback){
  checkConfig((dbparam)=>{
    console.log('config checked')
    try{
      fs.accessSync(path.resolve(global.basedir,dbparam.dbpath))
      console.log('dbpath exists')
    }catch(e){
      try{
        fs.mkdirSync(path.resolve(global.basedir,dbparam.dbpath))
        console.log('dbpath created')
      }catch(e){
        exit('Failed to create dbpath')
      }
    }
    connect((db)=>{
      db.serialize(()=>{
        console.log('start db')
        db.run('CREATE TABLE IF NOT EXISTS '+dbparam.head+' (alias TEXT NOT NULL,name NOT NULL,cols NOT NULL',(err)=>{
          if(err)
            exit('Failed to create '+dbparam.head)
          console.log('head created')
          select(dbparam.head,['cols','name','alias'],'',(row)=>{
            const cols=JSON.parse(row.cols)
            const tblname=row.name
            connect((db)=>{
              var existingCol=[]
              db.each('PRAGMA table_info(\''+tblname+'\')',(err,row)=>{
                if(err)
                  exit('Failed to retrieve table info of '+name)
                const {name,type,notnull}=row
                str=type+(notnull ? ' NOT NULL' : '')
                if(str==cols[name])
                  existingCol.push(name)
                else
                  exit('Metatable inconsistant with existing table '+tblname)
              })
              var keys=Object.keys(cols)
              keys.forEach((key)=>{
                if(!existingCol[key])
                  exit(tblname+' does not have column '+key)
              })
            })
          },(num)=>{
            callback()
          })
        })
      })
    })
  })
}

module.exports={
  select:select,
  update:update,
  insert:insert,
  dropTable:dropTable,
  addTable:addTable,
  checkTable:checkTable,
  initDB:initDB
}
